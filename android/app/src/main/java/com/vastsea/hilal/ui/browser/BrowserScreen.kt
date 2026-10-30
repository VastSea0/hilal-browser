package com.vastsea.hilal.ui.browser

import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.scaleOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.SnackbarDuration
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.SnackbarResult
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.layout.offset
import com.vastsea.hilal.AppContainer
import com.vastsea.hilal.R
import com.vastsea.hilal.browser.BrowserEvent
import com.vastsea.hilal.browser.Tab
import com.vastsea.hilal.browser.TabState
import com.vastsea.hilal.ui.Screen
import com.vastsea.hilal.ui.settings.AddonPermissionHost
import com.vastsea.hilal.ui.theme.LocalHaptics
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.launch
import org.mozilla.geckoview.GeckoSession
import kotlin.math.abs
import kotlin.math.roundToInt

private enum class Overlay { None, Editor, Overview, Menu, QuickActions, Find }

@Composable
fun BrowserScreen(
    container: AppContainer,
    onNavigate: (Screen) -> Unit,
    onFullscreenChange: (Boolean) -> Unit,
) {
    val store = container.tabs
    val context = LocalContext.current
    val density = LocalDensity.current
    val scope = rememberCoroutineScope()
    val haptics = LocalHaptics.current
    val currentHaptics by rememberUpdatedState(haptics)
    val motion = MaterialTheme.motionScheme

    val tabs by store.tabs.collectAsState()
    val selectedId by store.selectedId.collectAsState()
    val thumbnails by store.thumbnails.collectAsState()
    val selected: Tab? = tabs.firstOrNull { it.id == selectedId }
    val state: TabState? by remember(selected) { selected?.state ?: flowOf(null) }.collectAsState(selected?.current)
    val settings by container.settings.settings.collectAsState()

    var overlay by rememberSaveable { mutableStateOf(Overlay.None) }
    var editorInitialText by remember { mutableStateOf<String?>(null) }
    val snackbar = remember { SnackbarHostState() }
    val host = rememberGeckoHostState()

    val isPrivate = state?.isPrivate == true
    val sameModeTabs = tabs.filter { it.current.isPrivate == isPrivate }
    val fullscreen = state?.isFullscreen == true

    LaunchedEffect(fullscreen) { onFullscreenChange(fullscreen) }

    // Bar geometry. The bar floats over the page; Gecko is told how much of the page it covers.
    val navInsetPx = WindowInsets.navigationBars.getBottom(density)
    val barMaxPx = with(density) { (BarHeight + BarVerticalPadding * 2).roundToPx() } + navInsetPx
    val barHide = remember { Animatable(0f) }
    val barVisiblePx = { if (fullscreen) 0 else (barMaxPx - barHide.value).roundToInt().coerceAtLeast(0) }

    val hideDistancePx = with(density) { 24.dp.roundToPx() }
    val showDistancePx = with(density) { 12.dp.roundToPx() }

    fun showBar() = scope.launch { barHide.animateTo(0f, motion.defaultSpatialSpec()) }

    // Hide the bar while reading downward, bring it back on any upward scroll.
    DisposableEffect(selected?.session, barMaxPx) {
        val session = selected?.session
        var lastY = 0
        var travel = 0
        session?.scrollDelegate = object : GeckoSession.ScrollDelegate {
            override fun onScrollChanged(session: GeckoSession, scrollX: Int, scrollY: Int) {
                val dy = scrollY - lastY
                lastY = scrollY
                travel = if (dy.sign() == travel.sign()) travel + dy else dy
                val hidden = barHide.value >= barMaxPx - 1
                when {
                    scrollY <= 0 && barHide.value > 0f -> showBar()
                    travel > hideDistancePx && !hidden && overlay == Overlay.None ->
                        scope.launch { barHide.animateTo(barMaxPx.toFloat(), motion.defaultSpatialSpec()) }
                    travel < -showDistancePx && barHide.value > 0f -> showBar()
                }
            }
        }
        onDispose { session?.scrollDelegate = null }
    }
    LaunchedEffect(selectedId, state?.url) { showBar() }

    val swipe = remember {
        TabSwipe(
            scope = scope,
            haptics = { currentHaptics },
            spatialSpec = { motion.fastSpatialSpec() },
            neighbours = {
                val list = store.tabs.value.filter { it.current.isPrivate == (store.selected?.current?.isPrivate == true) }
                val i = list.indexOfFirst { it.id == store.selectedId.value }
                list.getOrNull(i - 1)?.id to list.getOrNull(i + 1)?.id
            },
            onCommit = { id -> store.select(id) },
        )
    }
    val pull = remember {
        OverviewPull(
            scope = scope,
            haptics = { currentHaptics },
            spatialSpec = { motion.defaultSpatialSpec() },
            onOpen = { overlay = Overlay.Overview },
        )
    }
    // While a swipe is committing, keep the incoming tab's screenshot over the page until
    // the newly attached session has had a moment to paint.
    var cover by remember { mutableStateOf<String?>(null) }
    LaunchedEffect(selectedId) {
        if (cover != null) {
            delay(220)
            cover = null
        }
    }

    suspend fun captureSelected() {
        val id = store.selectedId.value ?: return
        if (store.selected?.current?.isBlank == true) return
        host.capture()?.let { store.setThumbnail(id, it) }
    }

    val gestures = remember {
        object : BarGestureHandler {
            override fun onTap() {
                editorInitialText = null
                overlay = Overlay.Editor
            }

            override fun onLongPress() {
                currentHaptics.longPress()
                overlay = Overlay.QuickActions
            }

            override fun onHorizontalDrag(delta: Float) {
                if (abs(swipe.offset.value) < 1f && swipe.revealing == null) {
                    scope.launch { captureSelected() }
                }
                swipe.drag(delta)
            }

            override fun onHorizontalEnd(velocity: Float) {
                swipe.revealing?.let { target ->
                    val willCommit = abs(swipe.offset.value) >= swipe.width * 0.3f || abs(velocity) > 1800f
                    if (willCommit) cover = target
                }
                swipe.end(velocity)
            }

            override fun onVerticalDrag(delta: Float) = pull.drag(delta)
            override fun onVerticalEnd(velocity: Float) {
                pull.end(velocity)
            }
        }
    }

    LaunchedEffect(overlay) {
        if (overlay == Overlay.Overview) captureSelected()
        if (overlay != Overlay.None) showBar()
    }

    // Events from Gecko: external links, downloads, closed tabs.
    LaunchedEffect(Unit) {
        store.events.collect { event ->
            when (event) {
                is BrowserEvent.OpenExternal -> openExternal(context, event.uri) { fallback ->
                    store.selected?.let { store.load(it.id, fallback) }
                } ?: scope.launch { snackbar.showSnackbar(context.getString(R.string.open_in_app_failed)) }
                is BrowserEvent.DownloadStarted ->
                    scope.launch { snackbar.showSnackbar(context.getString(R.string.download_started, event.fileName)) }
                is BrowserEvent.DownloadFailed ->
                    scope.launch { snackbar.showSnackbar(context.getString(R.string.download_failed, event.fileName)) }
                is BrowserEvent.TabClosed -> scope.launch {
                    snackbar.currentSnackbarData?.dismiss()
                    val result = snackbar.showSnackbar(
                        message = context.getString(if (event.isPrivate) R.string.private_tab_closed else R.string.tab_closed),
                        actionLabel = context.getString(R.string.undo),
                        duration = SnackbarDuration.Short,
                    )
                    if (result == SnackbarResult.ActionPerformed) store.undoClose()
                }
            }
        }
    }

    // Back: close overlays first, then leave fullscreen, then go back in the page.
    BackHandler(enabled = overlay != Overlay.None) { overlay = Overlay.None }
    BackHandler(enabled = overlay == Overlay.None && fullscreen) { selected?.session?.exitFullScreen() }
    BackHandler(enabled = overlay == Overlay.None && !fullscreen && state?.canGoBack == true) {
        selected?.session?.goBack()
    }

    BoxWithConstraints(
        Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.surfaceContainer)
    ) {
        val widthPx = constraints.maxWidth.toFloat()
        val gapPx = with(density) { 16.dp.toPx() }
        swipe.width = widthPx
        swipe.gap = gapPx
        pull.distance = with(density) { 140.dp.toPx() }

        val pageModifier = Modifier
            .fillMaxSize()
            .then(if (fullscreen) Modifier else Modifier.windowInsetsPadding(WindowInsets.statusBars))
            .graphicsLayer {
                translationX = swipe.offset.value
                val p = pull.progress
                val s = 1f - 0.07f * p
                scaleX = s
                scaleY = s
                val moving = abs(swipe.offset.value) > 0.5f || p > 0.01f
                clip = moving
                shape = RoundedCornerShape((28 * (if (p > 0f) p.coerceAtMost(1f) else (abs(swipe.offset.value) / widthPx * 6f).coerceAtMost(1f))).dp)
            }

        Box(pageModifier.background(MaterialTheme.colorScheme.surface)) {
            GeckoHost(
                state = host,
                session = selected?.session,
                toolbarMaxHeightPx = if (fullscreen) 0 else barMaxPx,
                toolbarVisibleHeightPx = barVisiblePx,
                modifier = Modifier.fillMaxSize(),
            )
            if (state?.isBlank == true) {
                StartPage(
                    container = container,
                    isPrivate = isPrivate,
                    bottomPadding = with(density) { barMaxPx.toDp() },
                    onOpen = { url -> selected?.let { store.load(it.id, url) } },
                )
            }
            cover?.let { id ->
                thumbnails[id]?.let { bitmap ->
                    Image(bitmap, null, contentScale = ContentScale.Crop, alignment = Alignment.TopCenter, modifier = Modifier.fillMaxSize())
                }
            }
        }

        // The tab sliding in next to the page during a swipe.
        swipe.revealing?.let { id ->
            val direction = if (swipe.offset.value < 0) 1 else -1
            val neighbour = tabs.firstOrNull { it.id == id }
            Box(
                Modifier
                    .fillMaxSize()
                    .windowInsetsPadding(WindowInsets.statusBars)
                    .graphicsLayer { translationX = swipe.offset.value + direction * (widthPx + gapPx) }
                    .clip(RoundedCornerShape(28.dp))
            ) {
                TabPreview(neighbour?.current, thumbnails[id])
            }
        }

        if (!fullscreen) {
            AddressBar(
                tab = state,
                tabCount = sameModeTabs.size,
                gestures = gestures,
                onTabsClick = { overlay = Overlay.Overview },
                onMenuClick = { overlay = Overlay.Menu },
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .offset { IntOffset(0, (barHide.value + pull.offset.value * 0.35f).roundToInt()) }
                    .windowInsetsPadding(WindowInsets.navigationBars),
            )
        }

        SnackbarHost(
            snackbar,
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .windowInsetsPadding(WindowInsets.navigationBars)
                .padding(bottom = BarHeight + BarVerticalPadding * 2),
        )

        AnimatedVisibility(
            visible = overlay == Overlay.Find,
            enter = slideInVertically(motion.defaultSpatialSpec()) { it } + fadeIn(motion.fastEffectsSpec()),
            exit = slideOutVertically(motion.fastSpatialSpec()) { it } + fadeOut(motion.fastEffectsSpec()),
            modifier = Modifier.align(Alignment.BottomCenter),
        ) {
            selected?.let { FindBar(session = it.session, onClose = { overlay = Overlay.None }) }
        }

        AnimatedVisibility(
            visible = overlay == Overlay.Overview,
            enter = fadeIn(motion.defaultEffectsSpec()) + scaleIn(motion.defaultSpatialSpec(), initialScale = 1.08f),
            exit = fadeOut(motion.fastEffectsSpec()) + scaleOut(motion.fastSpatialSpec(), targetScale = 1.08f),
        ) {
            TabOverview(
                tabs = tabs,
                selectedId = selectedId,
                thumbnails = thumbnails,
                initialPrivate = isPrivate,
                onSelect = { id ->
                    store.select(id)
                    overlay = Overlay.None
                },
                onClose = store::close,
                onCloseAll = store::closeAll,
                onNewTab = { private ->
                    store.newTab(isPrivate = private)
                    overlay = Overlay.Editor
                },
                onDismiss = { overlay = Overlay.None },
            )
        }

        AnimatedVisibility(
            visible = overlay == Overlay.Editor,
            enter = fadeIn(motion.fastEffectsSpec()) + slideInVertically(motion.defaultSpatialSpec()) { it / 6 },
            exit = fadeOut(motion.fastEffectsSpec()) + slideOutVertically(motion.fastSpatialSpec()) { it / 6 },
        ) {
            AddressEditor(
                container = container,
                currentUrl = state?.url?.takeUnless { state?.isBlank == true }.orEmpty(),
                initialText = editorInitialText,
                isPrivate = isPrivate,
                onSubmit = { url ->
                    overlay = Overlay.None
                    val tab = store.selected ?: store.newTab(isPrivate = isPrivate)
                    store.load(tab.id, url)
                },
                onDismiss = { overlay = Overlay.None },
            )
        }

        if (overlay == Overlay.Menu) {
            PageMenu(
                container = container,
                state = state,
                onBack = { selected?.session?.goBack() },
                onForward = { selected?.session?.goForward() },
                onReload = { if (state?.isLoading == true) selected?.session?.stop() else selected?.session?.reload() },
                onShare = { state?.let { shareUrl(context, it.url, it.title) } },
                onFind = { overlay = Overlay.Find },
                onNewTab = { private ->
                    store.newTab(isPrivate = private)
                    overlay = Overlay.Editor
                },
                onNavigate = { screen ->
                    overlay = Overlay.None
                    onNavigate(screen)
                },
                onDismiss = { if (overlay == Overlay.Menu) overlay = Overlay.None },
            )
        }

        if (overlay == Overlay.QuickActions) {
            QuickActionsSheet(
                url = state?.url?.takeUnless { state?.isBlank == true },
                onPasteAndGo = { text ->
                    overlay = Overlay.None
                    val engine = com.vastsea.hilal.search.SearchEngines.byName(settings.searchEngine)
                    selected?.let { store.load(it.id, com.vastsea.hilal.search.InputResolver.resolve(text, engine)) }
                },
                onCopied = { scope.launch { snackbar.showSnackbar(context.getString(R.string.link_copied)) } },
                onShare = { state?.let { shareUrl(context, it.url, it.title) } },
                onEdit = { text ->
                    editorInitialText = text
                    overlay = Overlay.Editor
                },
                onDismiss = { if (overlay == Overlay.QuickActions) overlay = Overlay.None },
            )
        }

        PageRequestHost(container = container, selectedTabId = selectedId)
        AddonPermissionHost(container = container)
    }
}

@Composable
private fun TabPreview(tab: TabState?, thumbnail: androidx.compose.ui.graphics.ImageBitmap?) {
    Surface(color = MaterialTheme.colorScheme.surface, modifier = Modifier.fillMaxSize()) {
        if (thumbnail != null) {
            Image(thumbnail, null, contentScale = ContentScale.Crop, alignment = Alignment.TopCenter, modifier = Modifier.fillMaxSize())
        } else {
            TabPlaceholder(tab)
        }
    }
}

private fun Int.sign() = if (this > 0) 1 else if (this < 0) -1 else 0

/**
 * Hands a non-web link (tel:, mailto:, intent:, market: …) to Android. For intent: links that
 * no app can handle, falls back to their browser_fallback_url in the page. Returns null if
 * nothing could open it.
 */
private fun openExternal(context: android.content.Context, uri: Uri, loadFallback: (String) -> Unit): Unit? {
    val intent = if (uri.scheme == "intent") {
        runCatching { Intent.parseUri(uri.toString(), Intent.URI_INTENT_SCHEME) }.getOrNull()?.apply {
            addCategory(Intent.CATEGORY_BROWSABLE)
            component = null
            selector = null
        }
    } else {
        Intent(Intent.ACTION_VIEW, uri).addCategory(Intent.CATEGORY_BROWSABLE)
    } ?: return null
    return try {
        context.startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    } catch (_: ActivityNotFoundException) {
        intent.getStringExtra("browser_fallback_url")?.takeIf { it.startsWith("http") }?.let(loadFallback)
    }
}

fun shareUrl(context: android.content.Context, url: String, title: String) {
    val send = Intent(Intent.ACTION_SEND).apply {
        type = "text/plain"
        putExtra(Intent.EXTRA_TEXT, url)
        if (title.isNotBlank()) putExtra(Intent.EXTRA_SUBJECT, title)
    }
    context.startActivity(Intent.createChooser(send, null).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
}
