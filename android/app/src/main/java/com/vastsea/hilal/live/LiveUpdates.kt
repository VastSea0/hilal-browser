package com.vastsea.hilal.live

import android.content.Context
import android.util.Base64
import android.util.Log
import androidx.compose.runtime.Immutable
import com.vastsea.hilal.BuildConfig
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import java.security.KeyFactory
import java.security.Signature
import java.security.spec.X509EncodedKeySpec
import java.util.Locale

/** Text in several languages; falls back to English, then to any language present. */
@Immutable
data class LocalizedText(val values: Map<String, String>) {
    fun get(locale: Locale = Locale.getDefault()): String =
        values[locale.language] ?: values["en"] ?: values.values.firstOrNull().orEmpty()

    companion object {
        fun from(value: Any?): LocalizedText? = when (value) {
            is String -> LocalizedText(mapOf("en" to value))
            is JSONObject -> LocalizedText(value.keys().asSequence().associateWith { value.optString(it) })
            else -> null
        }
    }
}

@Immutable
data class Notice(
    val id: String,
    val title: LocalizedText,
    val body: LocalizedText?,
    val url: String?,
)

@Immutable
data class SiteFix(
    val id: String,
    val matches: List<String>,
    val css: String?,
    val js: String?,
    val runAt: String,
)

@Immutable
data class ApkRelease(val versionCode: Int, val versionName: String, val url: String)

/** The part of a bundle that applies to this app version. */
@Immutable
data class LiveConfig(
    val serial: Long = 0,
    val flags: Map<String, Boolean> = emptyMap(),
    val notices: List<Notice> = emptyList(),
    val siteFixes: List<SiteFix> = emptyList(),
    val searchEngines: JSONArray? = null,
    val bangs: JSONArray? = null,
    val latestApk: ApkRelease? = null,
) {
    fun flag(name: String, default: Boolean): Boolean = flags[name] ?: default

    /** A newer APK exists; only shown for builds made by the release workflow. */
    val apkUpdate: ApkRelease?
        get() = latestApk?.takeIf { it.versionCode > BuildConfig.VERSION_CODE }
}

/**
 * Live updates: a small signed JSON bundle that changes the app's behaviour without a new APK.
 *
 * `android/ota/` in the repository is turned into one file by `.github/workflows/android-ota.yml`
 * and published on the rolling `android-ota` GitHub release. The file is an envelope
 * `{"payload": base64(json), "signature": base64(ECDSA P-256 / SHA-256 over payload)}`.
 * The app only applies a payload signed by the key whose public half is [PUBLIC_KEY] and whose
 * serial is not older than the one it already has, so a compromised host or a replayed old
 * bundle cannot change anything. Bundles carry data, CSS and page scripts only, never app code.
 */
class LiveUpdates(context: Context, private val scope: CoroutineScope) {
    private val cacheFile = File(context.filesDir, "live-updates.json")
    private val prefs = context.getSharedPreferences("hilal_live_updates", Context.MODE_PRIVATE)

    private val _config = MutableStateFlow(LiveConfig())
    val config: StateFlow<LiveConfig> = _config.asStateFlow()

    private val _dismissed = MutableStateFlow(prefs.getStringSet(KEY_DISMISSED, emptySet()).orEmpty())
    val dismissed: StateFlow<Set<String>> = _dismissed.asStateFlow()

    private var loop: Job? = null

    // Set by disable(); checked after the download completes so an in-flight
    // check cannot resurrect a bundle that was just disabled.
    @Volatile
    private var updateEnabled = true

    /** Applies the cached bundle, then checks for a new one now and every few hours. */
    fun start(enabled: () -> Boolean) {
        if (loop != null) return
        updateEnabled = true
        loop = scope.launch {
            withContext(Dispatchers.IO) { runCatching { cacheFile.readText() }.getOrNull() }
                ?.let { verify(it) }
                ?.let { _config.value = it }
            while (isActive) {
                if (enabled()) checkNow()
                delay(CHECK_INTERVAL_MS)
            }
        }
    }

    /** Checks unless the last check was recent; used when the app comes back to the foreground. */
    fun checkIfStale(enabled: Boolean) {
        if (!enabled) return
        if (System.currentTimeMillis() - prefs.getLong(KEY_LAST_CHECK, 0) < MIN_RECHECK_MS) return
        scope.launch {
            if (updateEnabled) checkNow()
        }
    }

    suspend fun checkNow() {
        prefs.edit().putLong(KEY_LAST_CHECK, System.currentTimeMillis()).apply()
        val envelope = withContext(Dispatchers.IO) { download() } ?: return
        // If live updates were turned off while we were downloading, the
        // user expects no bundle to be applied or written to disk.
        if (!updateEnabled) return
        val next = verify(envelope) ?: return
        if (next.serial <= _config.value.serial) return
        withContext(Dispatchers.IO) {
            val tmp = File(cacheFile.parentFile, cacheFile.name + ".tmp")
            tmp.writeText(envelope)
            tmp.renameTo(cacheFile)
        }
        _config.value = next
    }

    /** Turned off in settings: forget the bundle so nothing from it stays applied. */
    fun disable() {
        updateEnabled = false
        loop?.cancel()
        loop = null
        cacheFile.delete()
        _config.value = LiveConfig()
    }

    fun dismiss(noticeId: String) {
        val next = _dismissed.value + noticeId
        _dismissed.value = next
        prefs.edit().putStringSet(KEY_DISMISSED, next).apply()
    }

    private fun download(): String? = runCatching {
        val connection = URL(BUNDLE_URL).openConnection() as HttpURLConnection
        connection.connectTimeout = 15_000
        connection.readTimeout = 15_000
        connection.instanceFollowRedirects = true
        connection.setRequestProperty("Accept", "application/json, application/octet-stream")
        try {
            if (connection.responseCode != HttpURLConnection.HTTP_OK) return null
            if (connection.contentLengthLong > MAX_BYTES) return null
            connection.inputStream.use { input ->
                val bytes = input.readNBytesCompat(MAX_BYTES + 1)
                if (bytes.size > MAX_BYTES) null else String(bytes, Charsets.UTF_8)
            }
        } finally {
            connection.disconnect()
        }
    }.onFailure { Log.i(TAG, "live update check failed: $it") }.getOrNull()

    private fun verify(envelope: String): LiveConfig? = runCatching {
        val json = JSONObject(envelope)
        val payload = Base64.decode(json.getString("payload"), Base64.DEFAULT)
        val signature = Base64.decode(json.getString("signature"), Base64.DEFAULT)
        val key = KeyFactory.getInstance("EC")
            .generatePublic(X509EncodedKeySpec(Base64.decode(PUBLIC_KEY, Base64.DEFAULT)))
        val verifier = Signature.getInstance("SHA256withECDSA")
        verifier.initVerify(key)
        verifier.update(payload)
        if (!verifier.verify(signature)) {
            Log.w(TAG, "live update signature does not match, ignoring it")
            return null
        }
        parse(JSONObject(String(payload, Charsets.UTF_8)))
    }.onFailure { Log.w(TAG, "live update bundle is invalid: $it") }.getOrNull()

    private fun parse(root: JSONObject): LiveConfig {
        if (root.optInt("format", 1) > FORMAT) return _config.value
        fun JSONObject.applies(): Boolean {
            val code = BuildConfig.VERSION_CODE
            return code >= optInt("minVersionCode", 0) && code <= optInt("maxVersionCode", Int.MAX_VALUE)
        }
        fun JSONArray?.objects(): List<JSONObject> =
            if (this == null) emptyList() else (0 until length()).mapNotNull { optJSONObject(it) }.filter { it.applies() }

        val flags = root.optJSONObject("flags")?.let { o ->
            o.keys().asSequence().mapNotNull { key ->
                when (val value = o.opt(key)) {
                    is Boolean -> key to value
                    is JSONObject -> if (value.applies()) key to value.optBoolean("value") else null
                    else -> null
                }
            }.toMap()
        }.orEmpty()

        val notices = root.optJSONArray("notices").objects().mapNotNull { o ->
            Notice(
                id = o.optString("id").ifEmpty { return@mapNotNull null },
                title = LocalizedText.from(o.opt("title")) ?: return@mapNotNull null,
                body = LocalizedText.from(o.opt("body")),
                url = o.optString("url").takeIf { it.startsWith("https://") },
            )
        }

        val siteFixes = root.optJSONArray("siteFixes").objects().mapNotNull { o ->
            val matches = o.optJSONArray("matches")?.let { a -> (0 until a.length()).map(a::getString) }.orEmpty()
            if (matches.isEmpty()) return@mapNotNull null
            SiteFix(
                id = o.optString("id").ifEmpty { return@mapNotNull null },
                matches = matches,
                css = o.optString("css").takeIf { it.isNotEmpty() },
                js = o.optString("js").takeIf { it.isNotEmpty() },
                runAt = o.optString("runAt").takeIf { it in RUN_AT } ?: "document_idle",
            )
        }

        val apk = root.optJSONObject("latestApk")?.let { o ->
            val url = o.optString("url")
            if (!url.startsWith("https://")) null
            else ApkRelease(o.optInt("versionCode"), o.optString("versionName"), url)
        }

        return LiveConfig(
            serial = root.optLong("serial"),
            flags = flags,
            notices = notices,
            siteFixes = siteFixes,
            searchEngines = root.optJSONArray("searchEngines"),
            bangs = root.optJSONArray("bangs"),
            latestApk = apk,
        )
    }

    private fun java.io.InputStream.readNBytesCompat(limit: Int): ByteArray {
        val out = java.io.ByteArrayOutputStream()
        val buffer = ByteArray(8192)
        while (out.size() < limit) {
            val read = read(buffer, 0, minOf(buffer.size, limit - out.size()))
            if (read < 0) break
            out.write(buffer, 0, read)
        }
        return out.toByteArray()
    }

    companion object {
        private const val TAG = "HilalLive"
        private const val FORMAT = 1
        const val BUNDLE_URL = "https://github.com/VastSea0/hilal-browser/releases/download/android-ota/ota.json"
        private const val MAX_BYTES = 1_000_000
        private const val CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000L
        private const val MIN_RECHECK_MS = 60 * 60 * 1000L
        private const val KEY_LAST_CHECK = "last_check"
        private const val KEY_DISMISSED = "dismissed_notices"
        private val RUN_AT = setOf("document_start", "document_end", "document_idle")

        /** SPKI DER of the live update signing key (P-256). The private half is a CI secret. */
        const val PUBLIC_KEY = "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEyjozO69psqKKMo4XKCV3fEXvMt2xfk7p8oJDJJznpxzN8ZLkz396q4kLbUfwuegAYQ9Ff58UyiNjl0HMty5ATA=="
    }
}
