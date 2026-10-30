package com.vastsea.hilal.downloads

import android.content.ContentValues
import android.content.Context
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.webkit.MimeTypeMap
import android.webkit.URLUtil
import com.vastsea.hilal.data.DownloadDao
import com.vastsea.hilal.data.DownloadEntry
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.mozilla.geckoview.WebResponse
import java.io.File
import java.io.InputStream
import java.io.OutputStream

/**
 * Saves responses Gecko hands over as downloads. The body is streamed from Gecko's own
 * response, so cookies, POST results and blob: URLs work without fetching the URL again.
 */
class DownloadController(private val context: Context, private val dao: DownloadDao) {
    val downloads = dao.all()

    /** Returns the file name on success, null on failure. */
    suspend fun save(response: WebResponse, isPrivate: Boolean): String? {
        val body = response.body ?: return null
        val mime = response.headers.entries
            .firstOrNull { it.key.equals("Content-Type", ignoreCase = true) }
            ?.value?.substringBefore(';')?.trim()
        val disposition = response.headers.entries
            .firstOrNull { it.key.equals("Content-Disposition", ignoreCase = true) }?.value
        val fileName = URLUtil.guessFileName(response.uri, disposition, mime).sanitized()
        val id = if (isPrivate) null else dao.insert(
            DownloadEntry(fileName = fileName, url = response.uri, contentUri = null, mimeType = mime, sizeBytes = 0, status = DownloadEntry.STATUS_RUNNING)
        )
        return withContext(Dispatchers.IO) {
            val result = runCatching { write(body, fileName, mime) }
            id?.let {
                val (uri, size) = result.getOrNull() ?: (null to 0L)
                dao.finish(it, if (uri != null) DownloadEntry.STATUS_DONE else DownloadEntry.STATUS_FAILED, size, uri?.toString())
            }
            if (result.isSuccess) fileName else null
        }
    }

    suspend fun delete(entry: DownloadEntry) = dao.delete(entry.id)

    suspend fun failInterrupted() = dao.failInterrupted()

    private fun write(body: InputStream, fileName: String, mime: String?): Pair<Uri, Long> {
        val type = mime ?: MimeTypeMap.getSingleton()
            .getMimeTypeFromExtension(fileName.substringAfterLast('.', "").lowercase())
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val resolver = context.contentResolver
            val values = ContentValues().apply {
                put(MediaStore.Downloads.DISPLAY_NAME, fileName)
                type?.let { put(MediaStore.Downloads.MIME_TYPE, it) }
                put(MediaStore.Downloads.IS_PENDING, 1)
            }
            val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
                ?: error("MediaStore refused $fileName")
            try {
                val size = resolver.openOutputStream(uri)!!.use { out -> body.use { it.copyCounting(out) } }
                resolver.update(uri, ContentValues().apply { put(MediaStore.Downloads.IS_PENDING, 0) }, null, null)
                return uri to size
            } catch (e: Exception) {
                resolver.delete(uri, null, null)
                throw e
            }
        }
        // Before Android 10 there is no MediaStore.Downloads; keep files in app storage.
        val dir = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS) ?: context.filesDir
        val file = uniqueFile(dir, fileName)
        val size = file.outputStream().use { out -> body.use { it.copyCounting(out) } }
        return Uri.fromFile(file) to size
    }

    private fun uniqueFile(dir: File, name: String): File {
        var file = File(dir, name)
        var n = 1
        val base = name.substringBeforeLast('.')
        val ext = name.substringAfterLast('.', "").let { if (it.isEmpty()) "" else ".$it" }
        while (file.exists()) file = File(dir, "$base (${n++})$ext")
        return file
    }

    private fun InputStream.copyCounting(out: OutputStream): Long {
        val buffer = ByteArray(64 * 1024)
        var total = 0L
        while (true) {
            val read = read(buffer)
            if (read < 0) break
            out.write(buffer, 0, read)
            total += read
        }
        return total
    }

    private fun String.sanitized() = replace(Regex("[\\\\/:*?\"<>|]"), "_").ifBlank { "download" }
}
