package com.vastsea.hilal.data

import android.content.Context
import android.content.SharedPreferences
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import androidx.compose.runtime.Immutable
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.io.InputStream
import java.util.UUID

enum class HeaderStyle { LogoGreeting, ClockDate, Minimal, Hidden }
enum class AmbientPreset { None, Aurora, Dusk, Midnight, Sunset, Emerald, CottonCandy }
enum class TileShapeStyle { Expressive, RoundedSquare, Circle }
enum class TileSize { Compact, Medium, Large }

@Immutable
data class PinnedShortcut(
    val id: String = UUID.randomUUID().toString(),
    val title: String,
    val url: String,
)

@Immutable
data class NewTabConfig(
    val headerStyle: HeaderStyle = HeaderStyle.LogoGreeting,
    val customGreeting: String = "",
    val ambientPreset: AmbientPreset = AmbientPreset.None,
    val customWallpaperPath: String? = null,
    val wallpaperDim: Float = 0.2f,
    val wallpaperBlurDp: Float = 0f,
    val tileShapeStyle: TileShapeStyle = TileShapeStyle.Expressive,
    val tileSize: TileSize = TileSize.Medium,
    val showTileLabels: Boolean = true,
    val showSearchBar: Boolean = false,
    val showShortcuts: Boolean = true,
    val showFrequent: Boolean = true,
    val showBookmarks: Boolean = true,
    val showQuickAccess: Boolean = true,
    val showNotices: Boolean = true,
    val pinnedShortcuts: List<PinnedShortcut> = defaultShortcuts,
    val hiddenFrequentUrls: Set<String> = emptySet(),
) {
    companion object {
        val defaultShortcuts = listOf(
            PinnedShortcut(title = "Wikipedia", url = "https://www.wikipedia.org/"),
            PinnedShortcut(title = "YouTube", url = "https://www.youtube.com/"),
            PinnedShortcut(title = "Reddit", url = "https://www.reddit.com/"),
            PinnedShortcut(title = "GitHub", url = "https://github.com/"),
        )
    }
}

class NewTabRepository(val context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("hilal_newtab_prefs", Context.MODE_PRIVATE)
    private val _config = MutableStateFlow(read())
    val config: StateFlow<NewTabConfig> = _config.asStateFlow()
    val current: NewTabConfig get() = _config.value

    fun update(transform: (NewTabConfig) -> NewTabConfig) {
        val next = transform(_config.value)
        save(next)
        _config.value = next
    }

    fun addShortcut(title: String, url: String) {
        val cleanUrl = if (!url.startsWith("http://") && !url.startsWith("https://")) "https://$url" else url
        update { cfg ->
            cfg.copy(pinnedShortcuts = cfg.pinnedShortcuts + PinnedShortcut(title = title.ifBlank { cleanUrl }, url = cleanUrl))
        }
    }

    fun editShortcut(id: String, title: String, url: String) {
        val cleanUrl = if (!url.startsWith("http://") && !url.startsWith("https://")) "https://$url" else url
        update { cfg ->
            cfg.copy(
                pinnedShortcuts = cfg.pinnedShortcuts.map {
                    if (it.id == id) it.copy(title = title.ifBlank { cleanUrl }, url = cleanUrl) else it
                }
            )
        }
    }

    fun removeShortcut(id: String) {
        update { cfg ->
            cfg.copy(pinnedShortcuts = cfg.pinnedShortcuts.filterNot { it.id == id })
        }
    }

    fun moveShortcut(id: String, direction: Int) {
        update { cfg ->
            val list = cfg.pinnedShortcuts.toMutableList()
            val index = list.indexOfFirst { it.id == id }
            if (index < 0) return@update cfg
            val target = (index + direction).coerceIn(0, list.lastIndex)
            if (target != index) {
                val item = list.removeAt(index)
                list.add(target, item)
            }
            cfg.copy(pinnedShortcuts = list)
        }
    }

    fun hideFrequent(url: String) {
        update { cfg ->
            cfg.copy(hiddenFrequentUrls = cfg.hiddenFrequentUrls + url)
        }
    }

    fun unhideAllFrequent() {
        update { cfg ->
            cfg.copy(hiddenFrequentUrls = emptySet())
        }
    }

    fun setCustomWallpaper(inputStream: InputStream): Boolean {
        return try {
            val file = File(context.filesDir, "newtab_wallpaper.jpg")
            file.outputStream().use { out ->
                inputStream.copyTo(out)
            }
            update { it.copy(customWallpaperPath = file.absolutePath) }
            true
        } catch (e: Exception) {
            false
        }
    }

    fun clearCustomWallpaper() {
        try {
            val file = File(context.filesDir, "newtab_wallpaper.jpg")
            if (file.exists()) file.delete()
        } catch (_: Exception) {}
        update { it.copy(customWallpaperPath = null) }
    }

    fun loadCustomWallpaperBitmap(): Bitmap? {
        val path = current.customWallpaperPath ?: return null
        val file = File(path)
        if (!file.exists()) return null
        return try {
            BitmapFactory.decodeFile(file.absolutePath)
        } catch (_: Throwable) {
            null
        }
    }

    fun resetToDefaults() {
        clearCustomWallpaper()
        val defaultCfg = NewTabConfig()
        save(defaultCfg)
        _config.value = defaultCfg
    }

    private fun save(cfg: NewTabConfig) {
        val shortcutsJson = JSONArray().apply {
            cfg.pinnedShortcuts.forEach { s ->
                put(JSONObject().apply {
                    put("id", s.id)
                    put("title", s.title)
                    put("url", s.url)
                })
            }
        }.toString()

        prefs.edit()
            .putInt(KEY_HEADER_STYLE, cfg.headerStyle.ordinal)
            .putString(KEY_CUSTOM_GREETING, cfg.customGreeting)
            .putInt(KEY_AMBIENT_PRESET, cfg.ambientPreset.ordinal)
            .putString(KEY_WALLPAPER_PATH, cfg.customWallpaperPath)
            .putFloat(KEY_WALLPAPER_DIM, cfg.wallpaperDim)
            .putFloat(KEY_WALLPAPER_BLUR, cfg.wallpaperBlurDp)
            .putInt(KEY_TILE_SHAPE, cfg.tileShapeStyle.ordinal)
            .putInt(KEY_TILE_SIZE, cfg.tileSize.ordinal)
            .putBoolean(KEY_SHOW_LABELS, cfg.showTileLabels)
            .putBoolean(KEY_SHOW_SEARCH, cfg.showSearchBar)
            .putBoolean(KEY_SHOW_SHORTCUTS, cfg.showShortcuts)
            .putBoolean(KEY_SHOW_FREQUENT, cfg.showFrequent)
            .putBoolean(KEY_SHOW_BOOKMARKS, cfg.showBookmarks)
            .putBoolean(KEY_SHOW_QUICK_ACCESS, cfg.showQuickAccess)
            .putBoolean(KEY_SHOW_NOTICES, cfg.showNotices)
            .putString(KEY_PINNED_SHORTCUTS, shortcutsJson)
            .putStringSet(KEY_HIDDEN_FREQUENT, cfg.hiddenFrequentUrls)
            .apply()
    }

    private fun read(): NewTabConfig {
        val shortcutsList = try {
            val raw = prefs.getString(KEY_PINNED_SHORTCUTS, null)
            if (raw != null) {
                val array = JSONArray(raw)
                val list = mutableListOf<PinnedShortcut>()
                for (i in 0 until array.length()) {
                    val obj = array.getJSONObject(i)
                    list.add(
                        PinnedShortcut(
                            id = obj.optString("id", UUID.randomUUID().toString()),
                            title = obj.optString("title", ""),
                            url = obj.optString("url", ""),
                        )
                    )
                }
                list
            } else {
                NewTabConfig.defaultShortcuts
            }
        } catch (_: Exception) {
            NewTabConfig.defaultShortcuts
        }

        return NewTabConfig(
            headerStyle = HeaderStyle.entries.getOrElse(prefs.getInt(KEY_HEADER_STYLE, 0)) { HeaderStyle.LogoGreeting },
            customGreeting = prefs.getString(KEY_CUSTOM_GREETING, "") ?: "",
            ambientPreset = AmbientPreset.entries.getOrElse(prefs.getInt(KEY_AMBIENT_PRESET, 0)) { AmbientPreset.None },
            customWallpaperPath = prefs.getString(KEY_WALLPAPER_PATH, null)?.takeIf { File(it).exists() },
            wallpaperDim = prefs.getFloat(KEY_WALLPAPER_DIM, 0.2f),
            wallpaperBlurDp = prefs.getFloat(KEY_WALLPAPER_BLUR, 0f),
            tileShapeStyle = TileShapeStyle.entries.getOrElse(prefs.getInt(KEY_TILE_SHAPE, 0)) { TileShapeStyle.Expressive },
            tileSize = TileSize.entries.getOrElse(prefs.getInt(KEY_TILE_SIZE, 1)) { TileSize.Medium },
            showTileLabels = prefs.getBoolean(KEY_SHOW_LABELS, true),
            showSearchBar = prefs.getBoolean(KEY_SHOW_SEARCH, false),
            showShortcuts = prefs.getBoolean(KEY_SHOW_SHORTCUTS, true),
            showFrequent = prefs.getBoolean(KEY_SHOW_FREQUENT, true),
            showBookmarks = prefs.getBoolean(KEY_SHOW_BOOKMARKS, true),
            showQuickAccess = prefs.getBoolean(KEY_SHOW_QUICK_ACCESS, true),
            showNotices = prefs.getBoolean(KEY_SHOW_NOTICES, true),
            pinnedShortcuts = shortcutsList,
            hiddenFrequentUrls = prefs.getStringSet(KEY_HIDDEN_FREQUENT, emptySet()) ?: emptySet(),
        )
    }

    private companion object {
        const val KEY_HEADER_STYLE = "header_style"
        const val KEY_CUSTOM_GREETING = "custom_greeting"
        const val KEY_AMBIENT_PRESET = "ambient_preset"
        const val KEY_WALLPAPER_PATH = "wallpaper_path"
        const val KEY_WALLPAPER_DIM = "wallpaper_dim"
        const val KEY_WALLPAPER_BLUR = "wallpaper_blur"
        const val KEY_TILE_SHAPE = "tile_shape"
        const val KEY_TILE_SIZE = "tile_size"
        const val KEY_SHOW_LABELS = "show_labels"
        const val KEY_SHOW_SEARCH = "show_search"
        const val KEY_SHOW_SHORTCUTS = "show_shortcuts"
        const val KEY_SHOW_FREQUENT = "show_frequent"
        const val KEY_SHOW_BOOKMARKS = "show_bookmarks"
        const val KEY_SHOW_QUICK_ACCESS = "show_quick_access"
        const val KEY_SHOW_NOTICES = "show_notices"
        const val KEY_PINNED_SHORTCUTS = "pinned_shortcuts_json"
        const val KEY_HIDDEN_FREQUENT = "hidden_frequent_set"
    }
}
