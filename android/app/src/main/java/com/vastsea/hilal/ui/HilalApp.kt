package com.vastsea.hilal.ui

import androidx.activity.compose.PredictiveBackHandler
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.TransformOrigin
import androidx.compose.ui.graphics.graphicsLayer
import com.vastsea.hilal.AppContainer
import com.vastsea.hilal.ui.browser.BrowserScreen
import com.vastsea.hilal.ui.library.BookmarksScreen
import com.vastsea.hilal.ui.library.DownloadsScreen
import com.vastsea.hilal.ui.library.HistoryScreen
import com.vastsea.hilal.ui.settings.AddonsScreen
import com.vastsea.hilal.ui.settings.SettingsScreen
import com.vastsea.hilal.ui.theme.HilalTheme
import com.vastsea.hilal.ui.theme.LocalHaptics
import com.vastsea.hilal.ui.theme.rememberHaptics
import kotlinx.coroutines.CancellationException

enum class Screen { History, Bookmarks, Downloads, Addons, Settings }

/**
 * Root of the UI. The browser is always composed underneath so its GeckoView and state survive;
 * secondary screens slide over it and follow the predictive back gesture.
 */
@Composable
fun HilalApp(container: AppContainer, onFullscreenChange: (Boolean) -> Unit) {
    val settings by container.settings.settings.collectAsState()
    HilalTheme(themeMode = settings.themeMode, dynamicColor = settings.dynamicColor) {
        CompositionLocalProvider(LocalHaptics provides rememberHaptics(settings.haptics)) {
            val stack = remember { mutableStateListOf<Screen>() }
            val motion = MaterialTheme.motionScheme
            var backProgress by remember { mutableFloatStateOf(0f) }

            fun open(screen: Screen) = stack.add(screen)
            fun close() {
                if (stack.isNotEmpty()) stack.removeAt(stack.lastIndex)
            }

            fun openInBrowser(url: String, newTab: Boolean, isPrivate: Boolean = false) {
                val tabs = container.tabs
                val current = tabs.selected
                if (newTab || current == null || current.current.isPrivate != isPrivate) {
                    tabs.newTab(url, isPrivate = isPrivate)
                } else {
                    tabs.load(current.id, url)
                }
                stack.clear()
            }

            Box(Modifier.fillMaxSize()) {
                BrowserScreen(container = container, onNavigate = ::open, onFullscreenChange = onFullscreenChange)

                PredictiveBackHandler(enabled = stack.isNotEmpty()) { events ->
                    try {
                        events.collect { backProgress = it.progress }
                        close()
                    } catch (e: CancellationException) {
                        throw e
                    } finally {
                        backProgress = 0f
                    }
                }

                AnimatedContent(
                    targetState = stack.lastOrNull(),
                    transitionSpec = {
                        val spatial = motion.defaultSpatialSpec<androidx.compose.ui.unit.IntOffset>()
                        val effects = motion.defaultEffectsSpec<Float>()
                        if (targetState != null && (initialState == null || stack.size > 1)) {
                            (slideInHorizontally(spatial) { it / 3 } + fadeIn(effects)) togetherWith fadeOut(effects)
                        } else {
                            fadeIn(effects) togetherWith (slideOutHorizontally(spatial) { it / 3 } + fadeOut(effects))
                        }
                    },
                    label = "screens",
                    modifier = Modifier.graphicsLayer {
                        val scale = 1f - 0.1f * backProgress
                        scaleX = scale
                        scaleY = scale
                        transformOrigin = TransformOrigin(1f, 0.5f)
                        shape = androidx.compose.foundation.shape.RoundedCornerShape((32 * backProgress).coerceAtLeast(0f).let { androidx.compose.ui.unit.Dp(it) })
                        clip = backProgress > 0f
                    },
                ) { screen ->
                    when (screen) {
                        null -> Unit
                        Screen.History -> HistoryScreen(container, onBack = ::close, onOpen = { url, newTab, private -> openInBrowser(url, newTab, private) })
                        Screen.Bookmarks -> BookmarksScreen(container, onBack = ::close, onOpen = { url, newTab, private -> openInBrowser(url, newTab, private) })
                        Screen.Downloads -> DownloadsScreen(container, onBack = ::close)
                        Screen.Addons -> AddonsScreen(container, onBack = ::close, onOpen = { url -> openInBrowser(url, newTab = true) })
                        Screen.Settings -> SettingsScreen(container, onBack = ::close, onOpen = { url -> openInBrowser(url, newTab = true) })
                    }
                }
            }
        }
    }
}
