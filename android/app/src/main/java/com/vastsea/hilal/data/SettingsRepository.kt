package com.vastsea.hilal.data

import android.content.Context
import android.content.SharedPreferences
import androidx.compose.runtime.Immutable
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

enum class ThemeMode { System, Light, Dark }

@Immutable
data class Settings(
    val searchEngine: String = "DuckDuckGo",
    val searchSuggestions: Boolean = true,
    val themeMode: ThemeMode = ThemeMode.System,
    val dynamicColor: Boolean = true,
    val darkWebsites: Boolean = false,
    val haptics: Boolean = true,
    val telemetry: Boolean = true,
)

/**
 * App settings, kept in the same SharedPreferences file and keys as Hilal 1.x so upgrades keep
 * the user's search engine, website theme and telemetry choice.
 */
class SettingsRepository(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("hilal_app_prefs", Context.MODE_PRIVATE)
    private val _settings = MutableStateFlow(read())
    val settings: StateFlow<Settings> = _settings.asStateFlow()
    val current: Settings get() = _settings.value

    fun update(transform: (Settings) -> Settings) {
        val next = transform(_settings.value)
        prefs.edit()
            .putString(KEY_SEARCH_ENGINE, next.searchEngine)
            .putBoolean(KEY_SUGGESTIONS, next.searchSuggestions)
            .putInt(KEY_THEME, next.themeMode.ordinal)
            .putBoolean(KEY_DYNAMIC_COLOR, next.dynamicColor)
            .putBoolean(KEY_DARK_WEBSITES, next.darkWebsites)
            .putBoolean(KEY_HAPTICS, next.haptics)
            .putBoolean(KEY_TELEMETRY, next.telemetry)
            .apply()
        _settings.value = next
    }

    private fun read() = Settings(
        searchEngine = prefs.getString(KEY_SEARCH_ENGINE, null) ?: "DuckDuckGo",
        searchSuggestions = prefs.getBoolean(KEY_SUGGESTIONS, true),
        themeMode = ThemeMode.entries.getOrElse(prefs.getInt(KEY_THEME, 0)) { ThemeMode.System },
        dynamicColor = prefs.getBoolean(KEY_DYNAMIC_COLOR, true),
        darkWebsites = prefs.getBoolean(KEY_DARK_WEBSITES, false),
        haptics = prefs.getBoolean(KEY_HAPTICS, true),
        telemetry = prefs.getBoolean(KEY_TELEMETRY, true),
    )

    private companion object {
        const val KEY_SEARCH_ENGINE = "default_search_engine"
        const val KEY_SUGGESTIONS = "search_suggestions"
        const val KEY_THEME = "theme_mode"
        const val KEY_DYNAMIC_COLOR = "dynamic_color"
        const val KEY_DARK_WEBSITES = "dark_websites"
        const val KEY_HAPTICS = "haptics"
        const val KEY_TELEMETRY = "anonymous_telemetry_enabled"
    }
}
