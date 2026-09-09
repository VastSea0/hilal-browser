package com.vastsea.hilal

import android.content.res.Configuration
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.scaleOut
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalInspectionMode
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.tooling.preview.Devices
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.viewinterop.AndroidView
import com.vastsea.hilal.model.BookmarkItem
import com.vastsea.hilal.model.BrowserTab
import com.vastsea.hilal.model.HistoryItem
import com.vastsea.hilal.model.Workspace
import com.vastsea.hilal.search.HilalBangsEngine
import com.vastsea.hilal.ui.components.*
import com.vastsea.hilal.ui.screens.BangsScreen
import com.vastsea.hilal.ui.screens.BookmarksScreen
import com.vastsea.hilal.ui.screens.HistoryScreen
import com.vastsea.hilal.ui.screens.SettingsScreen
import com.vastsea.hilal.ui.theme.HilalTheme
import org.mozilla.geckoview.ContentBlocking
import org.mozilla.geckoview.GeckoRuntime
import org.mozilla.geckoview.GeckoRuntimeSettings
import org.mozilla.geckoview.GeckoSession
import org.mozilla.geckoview.GeckoView
import java.util.Locale
import java.util.UUID

class MainActivity : ComponentActivity() {

    private lateinit var geckoRuntime: GeckoRuntime

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val settings = GeckoRuntimeSettings.Builder()
            .contentBlocking(
                ContentBlocking.Settings.Builder()
                    .antiTracking(ContentBlocking.AntiTracking.STRICT)
                    .build()
            )
            .build()

        geckoRuntime = GeckoRuntime.create(this, settings)

        setContent {
            var themeMode by remember { mutableIntStateOf(0) } // 0: System, 1: Light, 2: Dark
            var currentLanguage by remember { mutableIntStateOf(0) } // 0: System, 1: Turkish, 2: English

            val context = LocalContext.current
            val localizedContext = remember(currentLanguage, context) {
                val locale = when (currentLanguage) {
                    1 -> Locale("tr")
                    2 -> Locale("en")
                    else -> Locale.getDefault()
                }
                val config = Configuration(context.resources.configuration).apply {
                    setLocale(locale)
                    setLayoutDirection(locale)
                }
                context.createConfigurationContext(config)
            }

            val isDark = when (themeMode) {
                1 -> false
                2 -> true
                else -> isSystemInDarkTheme()
            }

            CompositionLocalProvider(LocalContext provides localizedContext) {
                HilalTheme(darkTheme = isDark) {
                    HilalBrowserApp(
                        geckoRuntime = geckoRuntime,
                        themeMode = themeMode,
                        onThemeChange = { themeMode = it },
                        currentLanguage = currentLanguage,
                        onLanguageChange = { currentLanguage = it }
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalMaterial3ExpressiveApi::class, ExperimentalFoundationApi::class)
@Composable
fun HilalBrowserApp(
    geckoRuntime: GeckoRuntime? = null,
    themeMode: Int = 0,
    onThemeChange: (Int) -> Unit = {},
    currentLanguage: Int = 0,
    onLanguageChange: (Int) -> Unit = {}
) {
    val isPreview = LocalInspectionMode.current || geckoRuntime == null

    val defaultWsName = stringResource(R.string.default_workspace_name)
    val workWsName = stringResource(R.string.work_workspace_name)
    val researchWsName = stringResource(R.string.research_workspace_name)
    val newTabDefaultTitle = stringResource(R.string.new_tab)
    val loadingDefaultTitle = stringResource(R.string.loading)

    // Workspaces
    val workspaces = remember {
        mutableStateListOf(
            Workspace("default", defaultWsName, "🌐"),
            Workspace("work", workWsName, "💼"),
            Workspace("research", researchWsName, "🔬")
        )
    }
    var currentWorkspaceId by remember { mutableStateOf("default") }

    // Multi-Tab state
    val tabs = remember { mutableStateListOf<BrowserTab>() }
    var activeTabId by remember { mutableStateOf("") }

    // History & Bookmarks state
    val historyItems = remember { mutableStateListOf<HistoryItem>() }
    val bookmarkItems = remember { mutableStateListOf<BookmarkItem>() }

    // UI Styles & Toggles
    var urlBarStyle by remember { mutableIntStateOf(0) } // 0: Floating, 1: Docked
    var toolbarStyle by remember { mutableIntStateOf(0) } // 0: Floating, 1: Docked
    var hideOnScroll by remember { mutableStateOf(true) }
    var darkWebsites by remember { mutableStateOf(false) }
    var defaultSearchEngine by remember { mutableStateOf("DuckDuckGo") }

    // Hide-on-scroll state
    var isBarsVisible by remember { mutableStateOf(true) }

    // Apply dark mode to GeckoView
    val isDark = when (themeMode) {
        1 -> false
        2 -> true
        else -> isSystemInDarkTheme()
    }

    LaunchedEffect(isDark, darkWebsites) {
        val scheme = if (isDark || darkWebsites) {
            GeckoRuntimeSettings.COLOR_SCHEME_DARK
        } else {
            GeckoRuntimeSettings.COLOR_SCHEME_LIGHT
        }
        geckoRuntime?.settings?.setPreferredColorScheme(scheme)
    }

    // Privacy Level (0: Standard, 1: Strict, 2: Hilal Ultra)
    var privacyLevel by remember { mutableIntStateOf(1) }

    fun applyPrivacyLevel(level: Int) {
        privacyLevel = level
        geckoRuntime?.settings?.contentBlocking?.let { cb ->
            when (level) {
                0 -> {
                    cb.setEnhancedTrackingProtectionLevel(ContentBlocking.EtpLevel.DEFAULT)
                    cb.setAntiTracking(ContentBlocking.AntiTracking.DEFAULT)
                    cb.setCookieBehavior(ContentBlocking.CookieBehavior.ACCEPT_NON_TRACKERS)
                    cb.setStrictSocialTrackingProtection(false)
                    cb.setCookiePurging(false)
                    cb.setQueryParameterStrippingEnabled(false)
                }
                1 -> {
                    cb.setEnhancedTrackingProtectionLevel(ContentBlocking.EtpLevel.STRICT)
                    cb.setAntiTracking(ContentBlocking.AntiTracking.STRICT)
                    cb.setCookieBehavior(ContentBlocking.CookieBehavior.ACCEPT_FIRST_PARTY_AND_ISOLATE_OTHERS)
                    cb.setStrictSocialTrackingProtection(true)
                    cb.setCookiePurging(true)
                    cb.setQueryParameterStrippingEnabled(true)
                }
                else -> {
                    cb.setEnhancedTrackingProtectionLevel(ContentBlocking.EtpLevel.STRICT)
                    cb.setAntiTracking(ContentBlocking.AntiTracking.STRICT)
                    cb.setCookieBehavior(ContentBlocking.CookieBehavior.ACCEPT_FIRST_PARTY)
                    cb.setStrictSocialTrackingProtection(true)
                    cb.setCookiePurging(true)
                    cb.setQueryParameterStrippingEnabled(true)
                }
            }
        }
    }

    LaunchedEffect(Unit) {
        applyPrivacyLevel(privacyLevel)
    }

    // Navigation / Overlay screens
    var showTabsTray by remember { mutableStateOf(false) }
    var showOptionsSheet by remember { mutableStateOf(false) }
    var showSettingsScreen by remember { mutableStateOf(false) }
    var showBangsScreen by remember { mutableStateOf(false) }
    var showHistoryScreen by remember { mutableStateOf(false) }
    var showBookmarksScreen by remember { mutableStateOf(false) }
    var showNewWorkspaceDialog by remember { mutableStateOf(false) }
    var newWorkspaceNameDialog by remember { mutableStateOf("") }
    var newWorkspaceEmojiDialog by remember { mutableStateOf("🌐") }
    val emojiOptions = listOf("🌐", "💼", "🔬", "📚", "🎨", "🚀", "🎮", "🏠", "💡", "🛡️", "✈️", "☕")

    // Helper: Create a new tab
    fun createNewTab(url: String = "about:newtab", workspaceId: String = currentWorkspaceId): BrowserTab {
        val tabId = UUID.randomUUID().toString()
        val session = if (!isPreview && geckoRuntime != null) {
            val s = GeckoSession()
            s.open(geckoRuntime)
            s
        } else null

        val tab = BrowserTab(
            id = tabId,
            initialUrl = url,
            initialTitle = if (url == "about:newtab") newTabDefaultTitle else loadingDefaultTitle,
            workspaceId = workspaceId,
            session = session
        )

        var lastScrollY = 0

        session?.navigationDelegate = object : GeckoSession.NavigationDelegate {
            override fun onCanGoBack(session: GeckoSession, canGoBack: Boolean) {
                tab.canGoBack = canGoBack
            }
            override fun onCanGoForward(session: GeckoSession, canGoForward: Boolean) {
                tab.canGoForward = canGoForward
            }
            override fun onLocationChange(
                session: GeckoSession,
                url: String?,
                perms: List<GeckoSession.PermissionDelegate.ContentPermission>,
                hasUserGesture: Boolean
            ) {
                if (url != null && url != "about:blank") {
                    tab.url = url
                    if (url != "about:newtab") {
                        historyItems.removeAll { it.url == url }
                        historyItems.add(0, HistoryItem(title = tab.title, url = url))
                    }
                }
            }
        }

        session?.contentDelegate = object : GeckoSession.ContentDelegate {
            override fun onTitleChange(session: GeckoSession, title: String?) {
                if (title != null) {
                    tab.title = title
                    val existing = historyItems.find { it.url == tab.url }
                    if (existing != null) {
                        historyItems.remove(existing)
                        historyItems.add(0, existing.copy(title = title))
                    }
                }
            }
        }

        session?.progressDelegate = object : GeckoSession.ProgressDelegate {
            override fun onPageStart(session: GeckoSession, url: String) {
                tab.isLoading = true
                tab.progress = 10
                isBarsVisible = true
            }
            override fun onPageStop(session: GeckoSession, success: Boolean) {
                tab.isLoading = false
                tab.progress = 100
                if (tab.url != "about:newtab" && tab.url != "about:blank") {
                    historyItems.removeAll { it.url == tab.url }
                    historyItems.add(0, HistoryItem(title = tab.title, url = tab.url))
                }
            }
            override fun onProgressChange(session: GeckoSession, progress: Int) {
                tab.progress = progress
            }
        }

        session?.scrollDelegate = object : GeckoSession.ScrollDelegate {
            override fun onScrollChanged(session: GeckoSession, scrollX: Int, scrollY: Int) {
                if (!hideOnScroll) {
                    isBarsVisible = true
                    return
                }
                val delta = scrollY - lastScrollY
                if (delta > 20 && scrollY > 60) {
                    isBarsVisible = false
                } else if (delta < -20 || scrollY <= 20) {
                    isBarsVisible = true
                }
                lastScrollY = scrollY
            }
        }

        if (url != "about:newtab" && session != null) {
            session.loadUri(url)
        }

        tabs.add(tab)
        activeTabId = tab.id
        return tab
    }

    // Initial tab setup
    LaunchedEffect(Unit) {
        if (tabs.isEmpty()) {
            createNewTab(url = "https://duckduckgo.com")
        }
    }

    val activeTab = tabs.find { it.id == activeTabId } ?: tabs.firstOrNull()
    val currentWorkspace = workspaces.find { it.id == currentWorkspaceId } ?: workspaces.first()
    val tabsInCurrentWorkspace = tabs.filter { it.workspaceId == currentWorkspaceId }

    // Bookmark state for active page
    val isCurrentBookmarked = remember(activeTab?.url, bookmarkItems.size) {
        activeTab != null && bookmarkItems.any { it.url == activeTab.url }
    }

    fun toggleBookmark() {
        val currentUrl = activeTab?.url ?: return
        if (currentUrl == "about:newtab" || currentUrl.isBlank()) return
        val existing = bookmarkItems.find { it.url == currentUrl }
        if (existing != null) {
            bookmarkItems.remove(existing)
        } else {
            bookmarkItems.add(0, BookmarkItem(title = activeTab.title.ifBlank { currentUrl }, url = currentUrl))
        }
    }

    // Android Hardware / Predictive Back handling
    BackHandler(
        enabled = showTabsTray || showSettingsScreen || showBangsScreen || showHistoryScreen || showBookmarksScreen || showOptionsSheet || (activeTab?.canGoBack == true)
    ) {
        when {
            showBangsScreen -> showBangsScreen = false
            showSettingsScreen -> showSettingsScreen = false
            showHistoryScreen -> showHistoryScreen = false
            showBookmarksScreen -> showBookmarksScreen = false
            showTabsTray -> showTabsTray = false
            showOptionsSheet -> showOptionsSheet = false
            activeTab?.canGoBack == true -> activeTab.session?.goBack()
        }
    }

    // Animated bar offsets for hide-on-scroll
    val shouldShowBars = !hideOnScroll || isBarsVisible || activeTab?.url == "about:newtab" || activeTab?.url == "about:blank"
    val topBarOffset by animateDpAsState(
        targetValue = if (shouldShowBars) 0.dp else (-120).dp,
        label = "topBarOffset"
    )
    val bottomBarOffset by animateDpAsState(
        targetValue = if (shouldShowBars) 0.dp else 140.dp,
        label = "bottomBarOffset"
    )

    if (showSettingsScreen) {
        SettingsScreen(
            currentLanguage = currentLanguage,
            onLanguageChange = onLanguageChange,
            themeMode = themeMode,
            onThemeChange = onThemeChange,
            urlBarStyle = urlBarStyle,
            onUrlBarStyleChange = { urlBarStyle = it },
            toolbarStyle = toolbarStyle,
            onToolbarStyleChange = { toolbarStyle = it },
            hideOnScroll = hideOnScroll,
            onHideOnScrollChange = { hideOnScroll = it },
            darkWebsites = darkWebsites,
            onDarkWebsitesChange = { darkWebsites = it },
            privacyLevel = privacyLevel,
            onPrivacyLevelChange = { applyPrivacyLevel(it) },
            defaultSearchEngine = defaultSearchEngine,
            onDefaultSearchEngineChange = { defaultSearchEngine = it },
            onOpenBangs = {
                showSettingsScreen = false
                showBangsScreen = true
            },
            onOpenHistory = {
                showSettingsScreen = false
                showHistoryScreen = true
            },
            onOpenBookmarks = {
                showSettingsScreen = false
                showBookmarksScreen = true
            },
            onNavigateBack = { showSettingsScreen = false },
            onClearData = {
                historyItems.clear()
            },
            onOpenUrl = { targetUrl ->
                showSettingsScreen = false
                val resolved = HilalBangsEngine.resolveUrl(targetUrl, defaultSearchEngine)
                activeTab?.let { tab ->
                    tab.url = resolved
                    tab.session?.loadUri(resolved)
                } ?: createNewTab(url = resolved)
            }
        )
        return
    }

    if (showBangsScreen) {
        BangsScreen(
            onClose = { showBangsScreen = false }
        )
        return
    }

    if (showHistoryScreen) {
        HistoryScreen(
            historyItems = historyItems,
            onNavigateToUrl = { targetUrl ->
                val resolved = HilalBangsEngine.resolveUrl(targetUrl, defaultSearchEngine)
                activeTab?.let { tab ->
                    tab.url = resolved
                    tab.session?.loadUri(resolved)
                } ?: createNewTab(url = resolved)
            },
            onDeleteHistoryItem = { id -> historyItems.removeAll { it.id == id } },
            onClearHistory = { historyItems.clear() },
            onClose = { showHistoryScreen = false }
        )
        return
    }

    if (showBookmarksScreen) {
        BookmarksScreen(
            bookmarkItems = bookmarkItems,
            onNavigateToUrl = { targetUrl ->
                val resolved = HilalBangsEngine.resolveUrl(targetUrl, defaultSearchEngine)
                activeTab?.let { tab ->
                    tab.url = resolved
                    tab.session?.loadUri(resolved)
                } ?: createNewTab(url = resolved)
            },
            onDeleteBookmark = { id -> bookmarkItems.removeAll { it.id == id } },
            onClose = { showBookmarksScreen = false }
        )
        return
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = MaterialTheme.colorScheme.surfaceContainerLowest,
        contentWindowInsets = WindowInsets(0, 0, 0, 0)
    ) { _ ->
        Box(modifier = Modifier.fillMaxSize()) {
            // Full-screen WebView or NewTabPage (no empty gap when bars slide away)
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(
                        top = if (urlBarStyle == 1) {
                            animateDpAsState(if (shouldShowBars) 64.dp else 0.dp, label = "dockedTopPad").value
                        } else 0.dp,
                        bottom = if (toolbarStyle == 1) {
                            animateDpAsState(if (shouldShowBars) 72.dp else 0.dp, label = "dockedBottomPad").value
                        } else 0.dp
                    )
            ) {
                if (activeTab == null || activeTab.url == "about:newtab" || activeTab.url == "about:blank") {
                    // Minimal M3 Expressive New Tab Home
                    NewTabPage(
                        workspaceName = currentWorkspace.name,
                        workspaceEmoji = currentWorkspace.emoji,
                        onOpenUrl = { url ->
                            val resolved = HilalBangsEngine.resolveUrl(url, defaultSearchEngine)
                            activeTab?.let { tab ->
                                tab.url = resolved
                                tab.session?.loadUri(resolved)
                            } ?: createNewTab(url = resolved)
                        },
                        onFocusSearch = {
                            // Omnibox focused
                        }
                    )
                } else {
                    // Pull-to-refresh wrapper around GeckoView
                    PullToRefreshBox(
                        isRefreshing = activeTab.isLoading,
                        onRefresh = { activeTab.session?.reload() },
                        indicator = {}, // Disables PullToRefreshBox default spinner
                        modifier = Modifier.fillMaxSize()
                    ) {
                        if (isPreview) {
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .background(MaterialTheme.colorScheme.surfaceContainerLowest),
                                contentAlignment = Alignment.Center
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    MorphingLoadingIndicator()
                                    Spacer(modifier = Modifier.height(16.dp))
                                    Text(
                                        text = activeTab.url,
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                }
                            }
                        } else {
                            AndroidView(
                                factory = { context ->
                                    GeckoView(context).apply {
                                        activeTab.session?.let { setSession(it) }
                                    }
                                },
                                update = { geckoView ->
                                    activeTab.session?.let { geckoView.setSession(it) }
                                },
                                modifier = Modifier.fillMaxSize()
                            )
                        }
                    }
                }

                // Morphing Loading Indicator overlay
                AnimatedVisibility(
                    visible = activeTab?.isLoading == true,
                    enter = fadeIn() + scaleIn(),
                    exit = fadeOut() + scaleOut(),
                    modifier = Modifier
                        .align(Alignment.TopCenter)
                        .statusBarsPadding()
                        .padding(top = 56.dp)
                ) {
                    MorphingLoadingIndicator()
                }
            }

            // Top Omnibox overlay
            Omnibox(
                currentUrl = activeTab?.url ?: "about:newtab",
                title = activeTab?.title ?: "Hilal",
                isFloating = urlBarStyle == 0,
                onNavigate = { resolvedUrl ->
                    activeTab?.let { tab ->
                        tab.url = resolvedUrl
                        tab.session?.loadUri(resolvedUrl)
                    }
                },
                onReload = {
                    activeTab?.session?.reload()
                },
                modifier = Modifier
                    .align(Alignment.TopCenter)
                    .offset(y = topBarOffset)
            )

            // Bottom Toolbar overlay (Floating or Docked)
            if (toolbarStyle == 0) {
                HorizontalFloatingToolbar(
                    expanded = true,
                    shape = CircleShape,
                    colors = FloatingToolbarDefaults.standardFloatingToolbarColors(),
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .navigationBarsPadding()
                        .padding(bottom = 16.dp)
                        .offset(y = bottomBarOffset),
                    content = {
                        // 1. Back
                        IconButton(
                            onClick = { activeTab?.session?.goBack() },
                            enabled = activeTab?.canGoBack ?: false
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = stringResource(R.string.back),
                                tint = if (activeTab?.canGoBack == true) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.38f)
                            )
                        }

                        // 2. Forward
                        IconButton(
                            onClick = { activeTab?.session?.goForward() },
                            enabled = activeTab?.canGoForward ?: false
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                                contentDescription = stringResource(R.string.forward),
                                tint = if (activeTab?.canGoForward == true) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.38f)
                            )
                        }

                        // 3. New Tab Pill Button with Long-Press for Workspace Creation
                        Box(
                            modifier = Modifier
                                .size(width = 56.dp, height = 42.dp)
                                .clip(RoundedCornerShape(20.dp))
                                .background(MaterialTheme.colorScheme.primary)
                                .combinedClickable(
                                    onClick = { createNewTab(url = "about:newtab") },
                                    onLongClick = { showNewWorkspaceDialog = true }
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Add,
                                contentDescription = stringResource(R.string.new_tab),
                                tint = MaterialTheme.colorScheme.onPrimary
                            )
                        }

                        // 4. Tabs Tray with badge
                        BadgedBox(
                            badge = {
                                Badge(
                                    containerColor = MaterialTheme.colorScheme.primary,
                                    contentColor = MaterialTheme.colorScheme.onPrimary
                                ) {
                                    Text(tabsInCurrentWorkspace.size.toString())
                                }
                            }
                        ) {
                            IconButton(onClick = { showTabsTray = true }) {
                                Icon(
                                    imageVector = Icons.Default.Tab,
                                    contentDescription = stringResource(R.string.tabs)
                                )
                            }
                        }

                        // 5. Options Menu
                        IconButton(onClick = { showOptionsSheet = true }) {
                            Icon(
                                imageVector = Icons.Default.MoreVert,
                                contentDescription = stringResource(R.string.options)
                            )
                        }
                    }
                )
            } else {
                Surface(
                    color = MaterialTheme.colorScheme.surfaceContainer,
                    tonalElevation = 3.dp,
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .fillMaxWidth()
                        .offset(y = bottomBarOffset)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .navigationBarsPadding()
                            .padding(horizontal = 16.dp, vertical = 6.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        IconButton(
                            onClick = { activeTab?.session?.goBack() },
                            enabled = activeTab?.canGoBack ?: false
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = stringResource(R.string.back),
                                tint = if (activeTab?.canGoBack == true) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.38f)
                            )
                        }

                        IconButton(
                            onClick = { activeTab?.session?.goForward() },
                            enabled = activeTab?.canGoForward ?: false
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                                contentDescription = stringResource(R.string.forward),
                                tint = if (activeTab?.canGoForward == true) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.38f)
                            )
                        }

                        Box(
                            modifier = Modifier
                                .size(width = 56.dp, height = 42.dp)
                                .clip(RoundedCornerShape(20.dp))
                                .background(MaterialTheme.colorScheme.primary)
                                .combinedClickable(
                                    onClick = { createNewTab(url = "about:newtab") },
                                    onLongClick = { showNewWorkspaceDialog = true }
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Add,
                                contentDescription = stringResource(R.string.new_tab),
                                tint = MaterialTheme.colorScheme.onPrimary
                            )
                        }

                        BadgedBox(
                            badge = {
                                Badge(
                                    containerColor = MaterialTheme.colorScheme.primary,
                                    contentColor = MaterialTheme.colorScheme.onPrimary
                                ) {
                                    Text(tabsInCurrentWorkspace.size.toString())
                                }
                            }
                        ) {
                            IconButton(onClick = { showTabsTray = true }) {
                                Icon(
                                    imageVector = Icons.Default.Tab,
                                    contentDescription = stringResource(R.string.tabs)
                                )
                            }
                        }

                        IconButton(onClick = { showOptionsSheet = true }) {
                            Icon(
                                imageVector = Icons.Default.MoreVert,
                                contentDescription = stringResource(R.string.options)
                            )
                        }
                    }
                }
            }
        }
    }

    // Tabs Tray Modal Sheet
    if (showTabsTray) {
        TabsTray(
            tabs = tabs,
            activeTabId = activeTabId,
            workspaces = workspaces,
            currentWorkspaceId = currentWorkspaceId,
            onSelectTab = { selectedId ->
                activeTabId = selectedId
            },
            onCloseTab = { closedId ->
                val tabToClose = tabs.find { it.id == closedId }
                tabToClose?.session?.close()
                tabs.remove(tabToClose)
                if (activeTabId == closedId) {
                    activeTabId = tabs.find { it.workspaceId == currentWorkspaceId }?.id
                        ?: tabs.firstOrNull()?.id
                        ?: createNewTab().id
                }
            },
            onNewTab = {
                createNewTab(url = "about:newtab")
            },
            onSelectWorkspace = { wsId ->
                currentWorkspaceId = wsId
                val existingTab = tabs.find { it.workspaceId == wsId }
                if (existingTab != null) {
                    activeTabId = existingTab.id
                } else {
                    createNewTab(url = "about:newtab", workspaceId = wsId)
                }
            },
            onCreateWorkspace = { name, emoji ->
                val newWs = Workspace(UUID.randomUUID().toString(), name, emoji)
                workspaces.add(newWs)
                currentWorkspaceId = newWs.id
                createNewTab(url = "about:newtab", workspaceId = newWs.id)
            },
            onDismiss = { showTabsTray = false }
        )
    }

    // Options Bottom Sheet
    if (showOptionsSheet) {
        OptionsBottomSheet(
            url = activeTab?.url ?: "",
            title = activeTab?.title ?: "",
            canGoBack = activeTab?.canGoBack ?: false,
            canGoForward = activeTab?.canGoForward ?: false,
            isBookmarked = isCurrentBookmarked,
            workspaces = workspaces,
            currentWorkspaceId = currentWorkspaceId,
            onSelectWorkspace = { wsId ->
                currentWorkspaceId = wsId
                val existing = tabs.find { it.workspaceId == wsId }
                if (existing != null) {
                    activeTabId = existing.id
                } else {
                    createNewTab(url = "about:newtab", workspaceId = wsId)
                }
            },
            onReload = { activeTab?.session?.reload() },
            onGoBack = { activeTab?.session?.goBack() },
            onGoForward = { activeTab?.session?.goForward() },
            onToggleBookmark = { toggleBookmark() },
            onOpenBookmarks = { showBookmarksScreen = true },
            onOpenHistory = { showHistoryScreen = true },
            onOpenSettings = { showSettingsScreen = true },
            onDismiss = { showOptionsSheet = false }
        )
    }

    // New Workspace Dialog (From long-press '+' button)
    if (showNewWorkspaceDialog) {
        AlertDialog(
            onDismissRequest = { showNewWorkspaceDialog = false },
            shape = RoundedCornerShape(28.dp),
            title = { Text(stringResource(R.string.new_workspace)) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    OutlinedTextField(
                        value = newWorkspaceNameDialog,
                        onValueChange = { newWorkspaceNameDialog = it },
                        label = { Text(stringResource(R.string.workspace_name_hint)) },
                        leadingIcon = {
                            Box(modifier = Modifier.padding(start = 12.dp, end = 4.dp)) {
                                Text(newWorkspaceEmojiDialog, fontSize = 20.sp)
                            }
                        },
                        singleLine = true,
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.fillMaxWidth()
                    )

                    Text(
                        text = stringResource(R.string.choose_emoji),
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    androidx.compose.foundation.lazy.LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        contentPadding = PaddingValues(vertical = 4.dp)
                    ) {
                        items(emojiOptions.size) { index ->
                            val emoji = emojiOptions[index]
                            val isSelected = emoji == newWorkspaceEmojiDialog
                            Surface(
                                shape = CircleShape,
                                color = if (isSelected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceContainerHigh,
                                border = if (isSelected) androidx.compose.foundation.BorderStroke(2.dp, MaterialTheme.colorScheme.primary) else null,
                                modifier = Modifier
                                    .size(40.dp)
                                    .clip(CircleShape)
                                    .clickable { newWorkspaceEmojiDialog = emoji }
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Text(emoji, fontSize = 20.sp)
                                }
                            }
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (newWorkspaceNameDialog.isNotBlank()) {
                            val newWs = Workspace(
                                UUID.randomUUID().toString(),
                                newWorkspaceNameDialog.trim(),
                                newWorkspaceEmojiDialog
                            )
                            workspaces.add(newWs)
                            currentWorkspaceId = newWs.id
                            createNewTab(url = "about:newtab", workspaceId = newWs.id)
                            newWorkspaceNameDialog = ""
                            newWorkspaceEmojiDialog = "🌐"
                            showNewWorkspaceDialog = false
                        }
                    },
                    shape = CircleShape
                ) {
                    Text(stringResource(R.string.create))
                }
            },
            dismissButton = {
                TextButton(onClick = { showNewWorkspaceDialog = false }) {
                    Text(stringResource(R.string.cancel))
                }
            }
        )
    }
}

@Preview(
    name = "Hilal Browser - Pixel 7 Light",
    device = Devices.PIXEL_7,
    showSystemUi = true
)
@Preview(
    name = "Hilal Browser - Pixel 7 Dark",
    device = Devices.PIXEL_7,
    showSystemUi = true,
    uiMode = Configuration.UI_MODE_NIGHT_YES
)
@Composable
private fun HilalBrowserAppPreview() {
    HilalTheme {
        HilalBrowserApp()
    }
}
