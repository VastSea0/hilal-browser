package com.vastsea.hilal.telemetry

import android.content.Context
import android.os.Build
import com.vastsea.hilal.BuildConfig
import com.vastsea.hilal.data.Settings
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.util.Locale
import java.util.UUID

/**
 * Opt-out anonymous usage ping: one "first_run" event, then at most one "daily_ping" per day.
 * Payload and storage keys are unchanged from Hilal 1.x so the website's stats stay continuous.
 */
class Telemetry(context: Context) {
    private val prefs = context.getSharedPreferences("hilal_app_prefs", Context.MODE_PRIVATE)

    suspend fun pingIfAllowed(settings: Settings, tabCount: Int, ublockEnabled: Boolean) {
        if (!settings.telemetry) return
        val now = System.currentTimeMillis()
        val event = when {
            !prefs.getBoolean(KEY_FIRST_RUN_SENT, false) -> "first_run"
            now - prefs.getLong(KEY_LAST_PING, 0L) >= DAY_MS -> "daily_ping"
            else -> return
        }
        val payload = JSONObject().apply {
            put("event", event)
            put("installation_id", installationId())
            put("app_version", BuildConfig.VERSION_NAME)
            put("build_number", BuildConfig.VERSION_CODE)
            put("os_version", Build.VERSION.SDK_INT)
            put("device_arch", Build.SUPPORTED_ABIS.firstOrNull() ?: "unknown")
            put("locale", Locale.getDefault().language)
            put("metrics", JSONObject().apply {
                put("search_engine", settings.searchEngine)
                put("ublock_enabled", ublockEnabled)
                put("theme_mode", settings.themeMode.name.lowercase())
                put("tabs_range", when {
                    tabCount <= 1 -> "1"
                    tabCount <= 5 -> "2-5"
                    tabCount <= 10 -> "6-10"
                    else -> "11+"
                })
                put("privacy_level", 1)
            })
        }
        val ok = withContext(Dispatchers.IO) {
            runCatching {
                val connection = (URL(ENDPOINT).openConnection() as HttpURLConnection).apply {
                    requestMethod = "POST"
                    connectTimeout = 5_000
                    readTimeout = 5_000
                    doOutput = true
                    setRequestProperty("Content-Type", "application/json; charset=utf-8")
                }
                try {
                    connection.outputStream.use { it.write(payload.toString().toByteArray()) }
                    connection.responseCode in 200..299
                } finally {
                    connection.disconnect()
                }
            }.getOrDefault(false)
        }
        if (ok) {
            prefs.edit()
                .putBoolean(KEY_FIRST_RUN_SENT, true)
                .putLong(KEY_LAST_PING, now)
                .apply()
        }
    }

    private fun installationId(): String =
        prefs.getString(KEY_INSTALLATION_ID, null)?.takeIf { it.isNotBlank() }
            ?: UUID.randomUUID().toString().also { prefs.edit().putString(KEY_INSTALLATION_ID, it).apply() }

    private companion object {
        const val ENDPOINT = "https://hilal-browser.vercel.app/api/telemetry"
        const val KEY_INSTALLATION_ID = "telemetry_installation_id"
        const val KEY_FIRST_RUN_SENT = "telemetry_first_run_sent"
        const val KEY_LAST_PING = "telemetry_last_ping_ms"
        const val DAY_MS = 24 * 60 * 60 * 1000L
    }
}
