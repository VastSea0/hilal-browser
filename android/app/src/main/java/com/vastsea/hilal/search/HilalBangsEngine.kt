package com.vastsea.hilal.search

import com.vastsea.hilal.model.Bang
import java.net.URLEncoder

object HilalBangsEngine {
    val defaultBangs = listOf(
        Bang("!g", "Google", "https://www.google.com/search?q=%s"),
        Bang("!yt", "YouTube", "https://www.youtube.com/results?search_query=%s"),
        Bang("!w", "Vikipedi", "https://tr.wikipedia.org/wiki/Special:Search?search=%s"),
        Bang("!gh", "GitHub", "https://github.com/search?q=%s"),
        Bang("!ddg", "DuckDuckGo", "https://duckduckgo.com/?q=%s"),
        Bang("!b", "Bing", "https://www.bing.com/search?q=%s"),
        Bang("!r", "Reddit", "https://www.reddit.com/search/?q=%s"),
        Bang("!m", "Google Haritalar", "https://www.google.com/maps/search/%s"),
        Bang("!tr", "Google Çeviri", "https://translate.google.com/?text=%s")
    )

    val customBangs = androidx.compose.runtime.mutableStateListOf<Bang>()

    val allBangs: List<Bang>
        get() = customBangs + defaultBangs

    fun addCustomBang(prefix: String, name: String, urlTemplate: String): Boolean {
        val cleanPrefix = if (prefix.startsWith("!")) prefix.trim() else "!${prefix.trim()}"
        if (cleanPrefix.length <= 1 || urlTemplate.isBlank()) return false
        val template = if (urlTemplate.contains("%s")) urlTemplate.trim() else "${urlTemplate.trim()}%s"
        customBangs.removeAll { it.prefix.equals(cleanPrefix, ignoreCase = true) }
        customBangs.add(0, Bang(cleanPrefix, name.trim().ifBlank { cleanPrefix }, template, isCustom = true))
        return true
    }

    fun removeCustomBang(prefix: String) {
        customBangs.removeAll { it.prefix.equals(prefix, ignoreCase = true) }
    }

    fun resolveUrl(query: String, defaultEngine: String = "DuckDuckGo"): String {
        val trimmed = query.trim()
        if (trimmed.isEmpty()) return "about:newtab"

        // Check for Bang prefix e.g. "!g flutter" or "!yt lo-fi"
        if (trimmed.startsWith("!")) {
            val spaceIndex = trimmed.indexOf(' ')
            val bangPrefix = if (spaceIndex != -1) trimmed.substring(0, spaceIndex) else trimmed
            val searchTerm = if (spaceIndex != -1) trimmed.substring(spaceIndex + 1).trim() else ""

            val match = allBangs.find { it.prefix.equals(bangPrefix, ignoreCase = true) }
            if (match != null) {
                val encodedTerm = URLEncoder.encode(searchTerm, "UTF-8")
                return match.urlTemplate.replace("%s", encodedTerm)
            }
        }

        // Check if already an absolute URL or scheme
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://") ||
            trimmed.startsWith("about:") || trimmed.startsWith("file:") ||
            trimmed.startsWith("javascript:") || trimmed.startsWith("content:")
        ) {
            return trimmed
        }

        // Robust domain and host check without spaces
        val isDomainOrHost = !trimmed.contains(" ") && (
            trimmed.startsWith("localhost", ignoreCase = true) ||
            trimmed.matches(Regex("^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}(:\\d+)?(/.*)?$")) ||
            trimmed.matches(Regex("^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\\.[a-zA-Z]{2,}(:\\d+)?(/.*)?$"))
        )

        return if (isDomainOrHost) {
            "https://$trimmed"
        } else {
            SearchEngineManager.buildSearchUrl(trimmed, defaultEngine)
        }
    }

    fun getSuggestions(query: String): List<Bang> {
        val trimmed = query.trim()
        if (!trimmed.startsWith("!")) return emptyList()
        val prefix = trimmed.split(" ").firstOrNull() ?: ""
        return allBangs.filter { it.prefix.startsWith(prefix, ignoreCase = true) }
    }
}
