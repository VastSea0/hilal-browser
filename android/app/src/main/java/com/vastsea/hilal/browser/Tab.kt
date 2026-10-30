package com.vastsea.hilal.browser

import androidx.compose.runtime.Immutable
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import org.mozilla.geckoview.GeckoSession

enum class Security { None, Secure, Insecure }

@Immutable
data class TabState(
    val id: String,
    val url: String = "",
    val title: String = "",
    val progress: Int = 0,
    val isLoading: Boolean = false,
    val canGoBack: Boolean = false,
    val canGoForward: Boolean = false,
    val security: Security = Security.None,
    val isPrivate: Boolean = false,
    val isFullscreen: Boolean = false,
    val lastAccessed: Long = System.currentTimeMillis(),
) {
    val isBlank: Boolean get() = url.isEmpty() || url == ABOUT_BLANK
    val displayTitle: String get() = title.ifBlank { url }

    companion object {
        const val ABOUT_BLANK = "about:blank"
    }
}

/**
 * One browser tab: a GeckoSession plus the UI state derived from its delegates.
 * The session is opened lazily so restored background tabs cost nothing until selected.
 */
class Tab(
    val id: String,
    session: GeckoSession,
    initial: TabState,
    /** Last serialized GeckoSession.SessionState, kept for persistence and lazy restore. */
    var sessionState: String? = null,
) {
    /** Replaced when the content process crashes and the tab is rebuilt. */
    var session: GeckoSession = session
        internal set

    private val _state = MutableStateFlow(initial)
    val state: StateFlow<TabState> = _state.asStateFlow()
    val current: TabState get() = _state.value

    /** URL to load when the session is first opened, used for restored tabs without history. */
    var pendingUrl: String? = null

    internal fun update(transform: (TabState) -> TabState) = _state.update(transform)
}
