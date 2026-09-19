package com.vastsea.hilal.download

import android.app.DownloadManager
import android.content.Context
import android.net.Uri
import android.os.Environment
import android.webkit.MimeTypeMap
import android.webkit.URLUtil
import android.widget.Toast
import com.vastsea.hilal.R
import com.vastsea.hilal.ui.theme.HilalHapticType
import com.vastsea.hilal.ui.theme.HilalHaptics
import java.io.File

object DownloadHelper {

    fun startDownload(
        context: Context,
        url: String,
        suggestedFileName: String? = null,
        mimeType: String? = null,
        haptics: HilalHaptics? = null
    ): Boolean {
        return try {
            val uri = Uri.parse(url)
            val fileName = suggestedFileName?.ifBlank { null }
                ?: URLUtil.guessFileName(url, null, mimeType)

            val request = DownloadManager.Request(uri).apply {
                setTitle(fileName)
                setDescription(context.getString(R.string.downloading_file, fileName))
                setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                setAllowedOverMetered(true)
                setAllowedOverRoaming(true)
                
                if (!mimeType.isNullOrBlank()) {
                    setMimeType(mimeType)
                } else {
                    val extension = MimeTypeMap.getFileExtensionFromUrl(url)
                    if (extension.isNotBlank()) {
                        val mapped = MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension.lowercase())
                        if (mapped != null) setMimeType(mapped)
                    }
                }

                setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName)
            }

            val downloadManager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
            downloadManager.enqueue(request)

            haptics?.perform(HilalHapticType.Confirm)
            Toast.makeText(
                context,
                context.getString(R.string.download_started, fileName),
                Toast.LENGTH_SHORT
            ).show()

            true
        } catch (e: Exception) {
            haptics?.perform(HilalHapticType.Reject)
            Toast.makeText(
                context,
                context.getString(R.string.download_failed, e.localizedMessage ?: ""),
                Toast.LENGTH_SHORT
            ).show()
            false
        }
    }
}
