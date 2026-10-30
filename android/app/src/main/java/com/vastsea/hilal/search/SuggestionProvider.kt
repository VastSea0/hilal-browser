package com.vastsea.hilal.search

import androidx.compose.runtime.Immutable
import com.vastsea.hilal.data.BookmarkDao
import com.vastsea.hilal.data.HistoryDao
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.withContext
import org.json.JSONArray
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

@Immutable
sealed interface Suggestion {
    data class Page(val url: String, val title: String, val isBookmark: Boolean) : Suggestion
    data class Query(val text: String) : Suggestion
    data class BangHint(val bang: Bang) : Suggestion
}

class SuggestionProvider(
    private val history: HistoryDao,
    private val bookmarks: BookmarkDao,
) {
    suspend fun suggest(input: String, engine: SearchEngine, includeRemote: Boolean): List<Suggestion> {
        val text = input.trim()
        if (text.isEmpty()) return emptyList()
        Bangs.matching(text).takeIf { it.isNotEmpty() }?.let { bangs ->
            return bangs.take(6).map { Suggestion.BangHint(it) }
        }
        return coroutineScope {
            val remote = async { if (includeRemote) remote(text, engine) else emptyList() }
            val marks = withContext(Dispatchers.IO) { bookmarks.search(text) }
            val visits = withContext(Dispatchers.IO) { history.search(text) }
            val pages = (marks.map { Suggestion.Page(it.url, it.title, true) } +
                visits.map { Suggestion.Page(it.url, it.title, false) })
                .distinctBy { it.url }
                .take(5)
            val queries = remote.await()
                .filterNot { it.equals(text, ignoreCase = true) }
                .take(6)
                .map { Suggestion.Query(it) }
            pages + queries
        }
    }

    private suspend fun remote(text: String, engine: SearchEngine): List<String> = withContext(Dispatchers.IO) {
        val template = engine.suggestUrl ?: return@withContext emptyList()
        runCatching {
            val url = URL(template.replace("%s", URLEncoder.encode(text, "UTF-8")))
            val connection = (url.openConnection() as HttpURLConnection).apply {
                connectTimeout = 2_500
                readTimeout = 2_500
                setRequestProperty("Accept", "application/json")
            }
            try {
                val body = connection.inputStream.bufferedReader().use { it.readText() }
                val list = JSONArray(body).getJSONArray(1)
                (0 until list.length()).map { list.getString(it) }
            } finally {
                connection.disconnect()
            }
        }.getOrDefault(emptyList())
    }
}
