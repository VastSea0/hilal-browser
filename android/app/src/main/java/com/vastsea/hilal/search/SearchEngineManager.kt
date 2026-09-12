package com.vastsea.hilal.search

import android.content.Context
import androidx.compose.runtime.mutableStateListOf
import com.vastsea.hilal.model.SearchEngine
import org.json.JSONArray
import org.json.JSONObject
import java.net.URLEncoder
import java.util.UUID

object SearchEngineManager {
    val builtInEngines = listOf(
        SearchEngine("ddg", "DuckDuckGo", "https://duckduckgo.com/?q=%s"),
        SearchEngine("google", "Google", "https://www.google.com/search?q=%s"),
        SearchEngine("bing", "Bing", "https://www.bing.com/search?q=%s"),
        SearchEngine("brave", "Brave", "https://search.brave.com/search?q=%s"),
        SearchEngine("ecosia", "Ecosia", "https://www.ecosia.org/search?q=%s"),
        SearchEngine("yandex", "Yandex", "https://yandex.com/search/?text=%s")
    )

    val customEngines = mutableStateListOf<SearchEngine>()

    private const val PREFS_NAME = "hilal_search_prefs"
    private const val KEY_CUSTOM_ENGINES = "custom_search_engines"

    fun init(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val json = prefs.getString(KEY_CUSTOM_ENGINES, null)
        customEngines.clear()
        if (!json.isNullOrBlank()) {
            try {
                val array = JSONArray(json)
                for (i in 0 until array.length()) {
                    val obj = array.getJSONObject(i)
                    customEngines.add(
                        SearchEngine(
                            id = obj.optString("id", UUID.randomUUID().toString()),
                            name = obj.getString("name"),
                            queryUrl = obj.getString("queryUrl"),
                            isCustom = true
                        )
                    )
                }
            } catch (_: Exception) {}
        }
    }

    private fun persist(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val array = JSONArray()
        for (engine in customEngines) {
            val obj = JSONObject().apply {
                put("id", engine.id)
                put("name", engine.name)
                put("queryUrl", engine.queryUrl)
            }
            array.put(obj)
        }
        prefs.edit().putString(KEY_CUSTOM_ENGINES, array.toString()).apply()
    }

    fun getAllEngines(): List<SearchEngine> = customEngines + builtInEngines

    fun addCustomEngine(context: Context, name: String, urlTemplate: String): SearchEngine? {
        val cleanName = name.trim()
        var cleanUrl = urlTemplate.trim()
        if (cleanName.isBlank() || cleanUrl.isBlank()) return null
        if (!cleanUrl.contains("%s")) {
            cleanUrl = if (cleanUrl.contains("?")) "$cleanUrl&q=%s" else "$cleanUrl?q=%s"
        }
        val id = UUID.randomUUID().toString()
        val engine = SearchEngine(id, cleanName, cleanUrl, isCustom = true)
        customEngines.removeAll { it.name.equals(cleanName, ignoreCase = true) }
        customEngines.add(0, engine)
        persist(context)
        return engine
    }

    fun removeCustomEngine(context: Context, id: String) {
        customEngines.removeAll { it.id == id }
        persist(context)
    }

    fun getEngineByName(name: String): SearchEngine {
        return getAllEngines().find { it.name.equals(name, ignoreCase = true) }
            ?: builtInEngines.first()
    }

    fun buildSearchUrl(query: String, engineName: String): String {
        val engine = getEngineByName(engineName)
        val encoded = URLEncoder.encode(query.trim(), "UTF-8")
        return engine.queryUrl.replace("%s", encoded)
    }
}
