package com.vastsea.hilal.telemetry

import android.content.Context
import android.os.Build
import android.util.Log
import com.vastsea.hilal.BuildConfig
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.util.Locale

object TelemetryManager {
    private const val TAG = "TelemetryManager"
    private const val TELEMETRY_ENDPOINT = "https://hilal-browser.vercel.app/api/telemetry"
    private const val PREFS_KEY_ENABLED = "anonymous_telemetry_enabled"
    private const val PREFS_KEY_LAST_PING = "telemetry_last_ping_ms"
    private const val PING_INTERVAL_MS = 24 * 60 * 60 * 1000L // 24 hours

    fun isTelemetryEnabled(context: Context): Boolean {
        val prefs = context.getSharedPreferences("hilal_app_prefs", Context.MODE_PRIVATE)
        return prefs.getBoolean(PREFS_KEY_ENABLED, true)
    }

    fun setTelemetryEnabled(context: Context, enabled: Boolean) {
        val prefs = context.getSharedPreferences("hilal_app_prefs", Context.MODE_PRIVATE)
        prefs.edit().putBoolean(PREFS_KEY_ENABLED, enabled).apply()
    }

    fun sendDailyPingIfAllowed(
        context: Context,
        searchEngine: String = "DuckDuckGo",
        ublockEnabled: Boolean = true,
        themeMode: Int = 0,
        tabCount: Int = 1,
        privacyLevel: Int = 1
    ) {
        val prefs = context.getSharedPreferences("hilal_app_prefs", Context.MODE_PRIVATE)
        val enabled = prefs.getBoolean(PREFS_KEY_ENABLED, true)
        if (!enabled) {
            Log.d(TAG, "Telemetry disabled by user preference")
            return
        }

        val lastPing = prefs.getLong(PREFS_KEY_LAST_PING, 0L)
        val now = System.currentTimeMillis()
        if (now - lastPing < PING_INTERVAL_MS) {
            Log.d(TAG, "Telemetry daily ping throttled (sent within last 24h)")
            return
        }

        val tabsRange = when {
            tabCount <= 1 -> "1"
            tabCount <= 5 -> "2-5"
            tabCount <= 10 -> "6-10"
            else -> "11+"
        }

        val themeString = when (themeMode) {
            1 -> "light"
            2 -> "dark"
            else -> "system"
        }

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val payload = JSONObject().apply {
                    put("event", "daily_ping")
                    put("app_version", BuildConfig.VERSION_NAME)
                    put("build_number", BuildConfig.VERSION_CODE)
                    put("os_version", Build.VERSION.SDK_INT)
                    put("device_arch", Build.SUPPORTED_ABIS.firstOrNull() ?: "unknown")
                    put("locale", Locale.getDefault().language)
                    put("metrics", JSONObject().apply {
                        put("search_engine", searchEngine)
                        put("ublock_enabled", ublockEnabled)
                        put("theme_mode", themeString)
                        put("tabs_range", tabsRange)
                        put("privacy_level", privacyLevel)
                    })
                }

                val url = URL(TELEMETRY_ENDPOINT)
                val conn = (url.openConnection() as HttpURLConnection).apply {
                    requestMethod = "POST"
                    connectTimeout = 5000
                    readTimeout = 5000
                    doOutput = true
                    setRequestProperty("Content-Type", "application/json; charset=utf-8")
                }

                OutputStreamWriter(conn.outputStream, "UTF-8").use { writer ->
                    writer.write(payload.toString())
                    writer.flush()
                }

                val responseCode = conn.responseCode
                Log.d(TAG, "Telemetry ping sent, response code: $responseCode")
                conn.disconnect()

                if (responseCode in 200..299) {
                    prefs.edit().putLong(PREFS_KEY_LAST_PING, now).apply()
                }
            } catch (e: Exception) {
                Log.d(TAG, "Telemetry ping deferred (network or server unavailable): ${e.message}")
            }
        }
    }
}
