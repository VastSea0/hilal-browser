package com.vastsea.hilal.live

import android.util.Log
import com.vastsea.hilal.search.Bang
import com.vastsea.hilal.search.Bangs
import com.vastsea.hilal.search.SearchEngine
import com.vastsea.hilal.search.SearchEngines
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject
import org.mozilla.geckoview.GeckoResult
import org.mozilla.geckoview.GeckoRuntime
import org.mozilla.geckoview.WebExtension

/**
 * Puts a live update bundle into effect: search engines and bangs right away, site fixes
 * through the built-in Hilal Live extension, which registers them as content scripts.
 */
class LiveApplier(
    private val runtime: GeckoRuntime,
    private val scope: CoroutineScope,
    private val updates: LiveUpdates,
) {
    private var port: WebExtension.Port? = null
    private var started = false

    fun start() {
        if (started) return
        started = true
        runtime.webExtensionController
            .ensureBuiltIn(EXTENSION_URL, EXTENSION_ID)
            .accept({ extension ->
                if (extension == null) return@accept
                extension.setMessageDelegate(messageDelegate, NATIVE_APP)
                if (!extension.metaData.allowedInPrivateBrowsing) {
                    runtime.webExtensionController.setAllowedInPrivateBrowsing(extension, true)
                }
            }, { error -> Log.w(TAG, "Hilal Live extension did not load", error) })

        scope.launch {
            updates.config.collect { config ->
                SearchEngines.live = parseEngines(config.searchEngines)
                Bangs.live = parseBangs(config.bangs)
                sendFixes(config)
            }
        }
    }

    private val messageDelegate = object : WebExtension.MessageDelegate {
        override fun onConnect(port: WebExtension.Port) {
            this@LiveApplier.port = port
            port.setDelegate(object : WebExtension.PortDelegate {
                override fun onDisconnect(port: WebExtension.Port) {
                    if (this@LiveApplier.port == port) this@LiveApplier.port = null
                }
            })
            sendFixes(updates.config.value)
        }

        override fun onMessage(nativeApp: String, message: Any, sender: WebExtension.MessageSender): GeckoResult<Any>? = null
    }

    private fun sendFixes(config: LiveConfig) {
        val port = port ?: return
        val fixes = JSONArray()
        config.siteFixes.forEach { fix ->
            fixes.put(JSONObject().apply {
                put("id", fix.id)
                put("matches", JSONArray(fix.matches))
                put("runAt", fix.runAt)
                fix.css?.let { put("css", it) }
                fix.js?.let { put("js", it) }
            })
        }
        port.postMessage(JSONObject().put("type", "siteFixes").put("fixes", fixes))
    }

    private fun parseEngines(array: JSONArray?): List<SearchEngine> = array.objects().mapNotNull { o ->
        val name = o.optString("name").takeIf { it.isNotBlank() } ?: return@mapNotNull null
        val search = o.optString("searchUrl").takeIf(::isTemplate) ?: return@mapNotNull null
        SearchEngine(name, search, o.optString("suggestUrl").takeIf(::isTemplate))
    }

    private fun parseBangs(array: JSONArray?): List<Bang> = array.objects().mapNotNull { o ->
        val trigger = o.optString("trigger").takeIf { it.isNotBlank() && ' ' !in it } ?: return@mapNotNull null
        val url = o.optString("url").takeIf(::isTemplate) ?: return@mapNotNull null
        Bang(trigger, o.optString("name").ifBlank { trigger }, url)
    }

    private fun isTemplate(url: String) = url.startsWith("https://") && "%s" in url

    private fun JSONArray?.objects(): List<JSONObject> =
        if (this == null) emptyList() else (0 until length()).mapNotNull { optJSONObject(it) }

    private companion object {
        const val TAG = "HilalLive"
        const val EXTENSION_ID = "live@hilal.vastsea.com"
        const val EXTENSION_URL = "resource://android/assets/extensions/hilal-live/"
        const val NATIVE_APP = "hilal"
    }
}
