package com.vastsea.hilal

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.scaleOut
import androidx.compose.foundation.background
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
import androidx.compose.ui.platform.LocalInspectionMode
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import com.vastsea.hilal.search.HilalBangsEngine
import com.vastsea.hilal.model.BrowserTab
import com.vastsea.hilal.model.Workspace
import com.vastsea.hilal.ui.components.*
import com.vastsea.hilal.ui.screens.SettingsScreen
import com.vastsea.hilal.ui.theme.HilalTheme
import org.mozilla.geckoview.GeckoRuntime
import org.mozilla.geckoview.GeckoRuntimeSettings
import org.mozilla.geckoview.GeckoSession
import org.mozilla.geckoview.GeckoView
import java.util.UUID

class MainActivity : ComponentActivity() {

    private lateinit var geckoRuntime: GeckoRuntime

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val settings = GeckoRuntimeSettings.Builder()
            .contentBlocking(
                org.mozilla.geckoview.ContentBlocking.Settings.Builder()
                    .antiTracking(org.mozilla.geckoview.ContentBlocking.AntiTracking.DEFAULT)
                    .build()
            )
            .build()

        geckoRuntime = GeckoRuntime.create(this, settings)

        setContent {
            HilalTheme {
                HilalBrowserApp(geckoRuntime = geckoRuntime)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalMaterial3ExpressiveApi::class)
@Composable
fun HilalBrowserApp(
    geckoRuntime: GeckoRuntime? = null
) {
    val isPreview = LocalInspectionMode.current || geckoRuntime == null

    // Workspaces
    val workspaces = remember {
        mutableStateListOf(
            Workspace("default", "Genel Alan"),
            Workspace("work", "İş"),
            Workspace("research", "Araştırma")
        )
    }
    var currentWorkspaceId by remember { mutableStateOf("default") }

    // Multi-Tab state
    val tabs = remember { mutableStateListOf<BrowserTab>() }
    var activeTabId by remember { mutableStateOf("") }

    // Navigation / Overlay sheets
    var showTabsTray by remember { mutableStateOf(false) }
    var showOptionsSheet by remember { mutableStateOf(false) }
    var showSettingsScreen by remember { mutableStateOf(false) }

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
            initialTitle = if (url == "about:newtab") "Yeni Sekme" else "Yükleniyor...",
            workspaceId = workspaceId,
            session = session
        )

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
                }
            }
        }

        session?.contentDelegate = object : GeckoSession.ContentDelegate {
            override fun onTitleChange(session: GeckoSession, title: String?) {
                if (title != null) {
                    tab.title = title
                }
            }
        }

        session?.progressDelegate = object : GeckoSession.ProgressDelegate {
            override fun onPageStart(session: GeckoSession, url: String) {
                tab.isLoading = true
                tab.progress = 10
            }
            override fun onPageStop(session: GeckoSession, success: Boolean) {
                tab.isLoading = false
                tab.progress = 100
            }
            override fun onProgressChange(session: GeckoSession, progress: Int) {
                tab.progress = progress
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

    // Android Hardware / Predictive Back handling
    BackHandler(enabled = showTabsTray || showSettingsScreen || showOptionsSheet || (activeTab?.canGoBack == true)) {
        when {
            showSettingsScreen -> showSettingsScreen = false
            showTabsTray -> showTabsTray = false
            showOptionsSheet -> showOptionsSheet = false
            activeTab?.canGoBack == true -> activeTab.session?.goBack()
        }
    }

    if (showSettingsScreen) {
        SettingsScreen(
            onNavigateBack = { showSettingsScreen = false },
            onClearData = {
                // Clear GeckoRuntime data
                geckoRuntime?.let { runtime ->
                    // Clears cache
                }
            },
            onOpenUrl = { targetUrl ->
                showSettingsScreen = false
                val resolved = HilalBangsEngine.resolveUrl(targetUrl)
                activeTab?.let { tab ->
                    tab.url = resolved
                    tab.session?.loadUri(resolved)
                } ?: createNewTab(url = resolved)
            }
        )
        return
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        topBar = {
            Omnibox(
                currentUrl = activeTab?.url ?: "about:newtab",
                title = activeTab?.title ?: "Hilal Browser",
                isLoading = activeTab?.isLoading ?: false,
                progress = activeTab?.progress ?: 0,
                onNavigate = { resolvedUrl ->
                    activeTab?.let { tab ->
                        tab.url = resolvedUrl
                        tab.session?.loadUri(resolvedUrl)
                    }
                },
                onReload = {
                    activeTab?.session?.reload()
                }
            )
        },
        floatingActionButtonPosition = FabPosition.Center,
        floatingActionButton = {
            HorizontalFloatingToolbar(
                expanded = true,
                shape = CircleShape,
                colors = FloatingToolbarDefaults.standardFloatingToolbarColors(),
                content = {
                    // 1. Back
                    IconButton(
                        onClick = { activeTab?.session?.goBack() },
                        enabled = activeTab?.canGoBack ?: false
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Geri",
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
                            contentDescription = "İleri",
                            tint = if (activeTab?.canGoForward == true) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.38f)
                        )
                    }

                    // 3. New Tab Pill Button
                    FilledIconButton(
                        onClick = {
                            createNewTab(url = "about:newtab")
                        },
                        shape = RoundedCornerShape(20.dp),
                        modifier = Modifier.size(width = 56.dp, height = 42.dp),
                        colors = IconButtonDefaults.filledIconButtonColors(
                            containerColor = MaterialTheme.colorScheme.primary
                        )
                    ) {
                        Icon(
                            imageVector = Icons.Default.Add,
                            contentDescription = "Yeni Sekme",
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
                                contentDescription = "Sekmeler"
                            )
                        }
                    }

                    // 5. Options Menu
                    IconButton(onClick = { showOptionsSheet = true }) {
                        Icon(
                            imageVector = Icons.Default.MoreVert,
                            contentDescription = "Seçenekler"
                        )
                    }
                }
            )
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            if (activeTab == null || activeTab.url == "about:newtab" || activeTab.url == "about:blank") {
                // Minimal M3 Expressive New Tab Home
                NewTabPage(
                    workspaceName = currentWorkspace.name,
                    onOpenUrl = { url ->
                        val resolved = HilalBangsEngine.resolveUrl(url)
                        activeTab?.let { tab ->
                            tab.url = resolved
                            tab.session?.loadUri(resolved)
                        } ?: createNewTab(url = resolved)
                    },
                    onFocusSearch = {
                        // Triggers Omnibox search
                    }
                )
            } else {
                // Pull-to-refresh wrapper around GeckoView
                PullToRefreshBox(
                    isRefreshing = activeTab.isLoading,
                    onRefresh = { activeTab.session?.reload() },
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

            // Morphing loading indicator overlay when page is loading
            AnimatedVisibility(
                visible = activeTab?.isLoading == true && (activeTab.progress < 70),
                enter = fadeIn() + scaleIn(),
                exit = fadeOut() + scaleOut(),
                modifier = Modifier
                    .align(Alignment.TopCenter)
                    .padding(top = 16.dp)
            ) {
                Surface(
                    color = MaterialTheme.colorScheme.surfaceContainerHighest,
                    shape = CircleShape,
                    shadowElevation = 6.dp,
                    tonalElevation = 6.dp,
                    modifier = Modifier.size(44.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        MorphingLoadingIndicator(size = 28)
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
            onCreateWorkspace = { name ->
                val newWs = Workspace(UUID.randomUUID().toString(), name)
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
            onOpenSettings = { showSettingsScreen = true },
            onDismiss = { showOptionsSheet = false }
        )
    }
}
