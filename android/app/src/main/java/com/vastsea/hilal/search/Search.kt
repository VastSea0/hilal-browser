package com.vastsea.hilal.search

import android.util.Patterns
import java.net.URLEncoder

data class SearchEngine(
    val name: String,
    val searchUrl: String,
    /** OpenSearch JSON suggestion endpoint; null when the engine has none. */
    val suggestUrl: String?,
)

data class Bang(val trigger: String, val name: String, val urlTemplate: String)

object SearchEngines {
    val all = listOf(
        SearchEngine("DuckDuckGo", "https://duckduckgo.com/?q=%s", "https://duckduckgo.com/ac/?q=%s&type=list"),
        SearchEngine("Google", "https://www.google.com/search?q=%s", "https://suggestqueries.google.com/complete/search?client=firefox&q=%s"),
        SearchEngine("Brave", "https://search.brave.com/search?q=%s", "https://search.brave.com/api/suggest?q=%s"),
        SearchEngine("Bing", "https://www.bing.com/search?q=%s", "https://api.bing.com/osjson.aspx?query=%s"),
        SearchEngine("Ecosia", "https://www.ecosia.org/search?q=%s", "https://ac.ecosia.org/autocomplete?q=%s&type=list"),
        SearchEngine("Startpage", "https://www.startpage.com/do/search?q=%s", null),
        SearchEngine("Yandex", "https://yandex.com/search/?text=%s", "https://suggest.yandex.com/suggest-ff.cgi?part=%s"),
    )

    fun byName(name: String): SearchEngine = all.firstOrNull { it.name.equals(name, ignoreCase = true) } ?: all.first()
}

object Bangs {
    val all = listOf(
        Bang("g", "Google", "https://www.google.com/search?q=%s"),
        Bang("ddg", "DuckDuckGo", "https://duckduckgo.com/?q=%s"),
        Bang("b", "Bing", "https://www.bing.com/search?q=%s"),
        Bang("yt", "YouTube", "https://www.youtube.com/results?search_query=%s"),
        Bang("w", "Wikipedia", "https://en.wikipedia.org/wiki/Special:Search?search=%s"),
        Bang("wtr", "Vikipedi", "https://tr.wikipedia.org/wiki/Special:Search?search=%s"),
        Bang("gh", "GitHub", "https://github.com/search?q=%s"),
        Bang("r", "Reddit", "https://www.reddit.com/search/?q=%s"),
        Bang("m", "Maps", "https://www.openstreetmap.org/search?query=%s"),
        Bang("gm", "Google Maps", "https://www.google.com/maps/search/%s"),
        Bang("tr", "Google Translate", "https://translate.google.com/?text=%s"),
        Bang("a", "Amazon", "https://www.amazon.com/s?k=%s"),
        Bang("so", "Stack Overflow", "https://stackoverflow.com/search?q=%s"),
        Bang("mdn", "MDN", "https://developer.mozilla.org/search?q=%s"),
    )

    /** Bangs whose trigger starts with what the user typed after "!". */
    fun matching(input: String): List<Bang> {
        val trimmed = input.trimStart()
        if (!trimmed.startsWith("!") || trimmed.contains(' ')) return emptyList()
        val typed = trimmed.drop(1)
        return all.filter { it.trigger.startsWith(typed, ignoreCase = true) }
    }

    fun parse(input: String): Pair<Bang, String>? {
        val trimmed = input.trim()
        val tokens = trimmed.split(Regex("\\s+"))
        val bangToken = tokens.firstOrNull { it.length > 1 && it.startsWith("!") } ?: return null
        val bang = all.firstOrNull { it.trigger.equals(bangToken.drop(1), ignoreCase = true) } ?: return null
        val terms = tokens.filter { it !== bangToken }.joinToString(" ")
        return bang to terms
    }
}

object InputResolver {
    private val schemes = listOf("http://", "https://", "about:", "file://", "data:", "view-source:", "moz-extension://")

    /** Turns what the user typed into a URL: a bang, an address, or a search. */
    fun resolve(input: String, engine: SearchEngine): String {
        val text = input.trim()
        Bangs.parse(text)?.let { (bang, terms) ->
            if (terms.isNotBlank()) return bang.urlTemplate.replace("%s", encode(terms))
        }
        if (schemes.any { text.startsWith(it, ignoreCase = true) }) return text
        if (looksLikeAddress(text)) return "https://$text"
        return engine.searchUrl.replace("%s", encode(text))
    }

    fun looksLikeAddress(text: String): Boolean {
        if (text.isEmpty() || text.any { it.isWhitespace() }) return false
        val host = text.substringBefore('/').substringBefore('?').substringBefore('#').substringBefore(':')
        if (host.equals("localhost", ignoreCase = true)) return true
        if (Patterns.IP_ADDRESS.matcher(host).matches()) return true
        val tld = host.substringAfterLast('.', missingDelimiterValue = "")
        return tld.length >= 2 && tld.all { it.isLetter() } && Patterns.DOMAIN_NAME.matcher(host).matches()
    }

    /** The URL as people read it: no scheme, no "www.", no trailing slash. */
    fun displayUrl(url: String): String = url
        .removePrefix("https://").removePrefix("http://").removePrefix("www.")
        .removeSuffix("/")

    fun host(url: String): String = android.net.Uri.parse(url).host?.removePrefix("www.") ?: displayUrl(url)

    private fun encode(text: String) = URLEncoder.encode(text, "UTF-8")
}
