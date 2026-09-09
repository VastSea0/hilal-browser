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

    fun resolveUrl(query: String): String {
        val trimmed = query.trim()
        if (trimmed.isEmpty()) return "about:newtab"

        // Check for Bang prefix e.g. "!g flutter" or "!yt lo-fi"
        if (trimmed.startsWith("!")) {
            val spaceIndex = trimmed.indexOf(' ')
            val bangPrefix = if (spaceIndex != -1) trimmed.substring(0, spaceIndex) else trimmed
            val searchTerm = if (spaceIndex != -1) trimmed.substring(spaceIndex + 1).trim() else ""

            val match = defaultBangs.find { it.prefix.equals(bangPrefix, ignoreCase = true) }
            if (match != null) {
                val encodedTerm = URLEncoder.encode(searchTerm, "UTF-8")
                return match.urlTemplate.replace("%s", encodedTerm)
            }
        }

        // Check if already an absolute URL
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("about:")) {
            return trimmed
        }

        // Check if looks like a web address (e.g. "google.com" or "news.ycombinator.com/path")
        val looksLikeDomain = !trimmed.contains(" ") && (
            trimmed.contains(".com") || trimmed.contains(".org") ||
            trimmed.contains(".net") || trimmed.contains(".io") ||
            trimmed.contains(".dev") || trimmed.contains(".tr") ||
            trimmed.contains(".me") || trimmed.contains("localhost")
        )

        return if (looksLikeDomain) {
            "https://$trimmed"
        } else {
            // Default search on DuckDuckGo
            "https://duckduckgo.com/?q=${URLEncoder.encode(trimmed, "UTF-8")}"
        }
    }

    fun getSuggestions(query: String): List<Bang> {
        val trimmed = query.trim()
        if (!trimmed.startsWith("!")) return emptyList()
        val prefix = trimmed.split(" ").firstOrNull() ?: ""
        return defaultBangs.filter { it.prefix.startsWith(prefix, ignoreCase = true) }
    }
}
