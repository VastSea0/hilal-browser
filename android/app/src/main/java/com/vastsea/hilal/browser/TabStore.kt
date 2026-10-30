package com.vastsea.hilal.browser

import android.content.Context
import android.graphics.Bitmap
import android.net.Uri
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import com.vastsea.hilal.data.HistoryDao
import com.vastsea.hilal.downloads.DownloadController
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import org.mozilla.geckoview.AllowOrDeny
import org.mozilla.geckoview.GeckoResult
import org.mozilla.geckoview.GeckoRuntime
import org.mozilla.geckoview.GeckoSession
import org.mozilla.geckoview.GeckoSession.ContentDelegate
import org.mozilla.geckoview.GeckoSession.HistoryDelegate
import org.mozilla.geckoview.GeckoSession.NavigationDelegate
import org.mozilla.geckoview.GeckoSession.PermissionDelegate
import org.mozilla.geckoview.GeckoSession.ProgressDelegate
import org.mozilla.geckoview.GeckoSession.PromptDelegate
import org.mozilla.geckoview.GeckoSession.PromptDelegate.PromptResponse
import org.mozilla.geckoview.GeckoSessionSettings
import org.mozilla.geckoview.GeckoWebExecutor
import org.mozilla.geckoview.WebRequest
import org.mozilla.geckoview.WebResponse
import java.io.File
import java.util.UUID

sealed interface BrowserEvent {
    data class OpenExternal(val uri: Uri) : BrowserEvent
    data class DownloadStarted(val fileName: String) : BrowserEvent
    data class DownloadFailed(val fileName: String) : BrowserEvent
    data class TabClosed(val title: String, val isPrivate: Boolean) : BrowserEvent
}

/** Owns every tab, the selected tab, and the page requests waiting for an answer. */
class TabStore(
    private val context: Context,
    private val runtime: GeckoRuntime,
    private val scope: CoroutineScope,
    private val history: HistoryDao,
    private val downloads: DownloadController,
    private val installAddon: (url: String) -> Unit,
) {
    private val _tabs = MutableStateFlow<List<Tab>>(emptyList())
    val tabs: StateFlow<List<Tab>> = _tabs.asStateFlow()

    private val _selectedId = MutableStateFlow<String?>(null)
    val selectedId: StateFlow<String?> = _selectedId.asStateFlow()

    private val _requests = MutableStateFlow<List<PageRequest>>(emptyList())
    val requests: StateFlow<List<PageRequest>> = _requests.asStateFlow()

    private val _thumbnails = MutableStateFlow<Map<String, ImageBitmap>>(emptyMap())
    val thumbnails: StateFlow<Map<String, ImageBitmap>> = _thumbnails.asStateFlow()

    private val _events = MutableSharedFlow<BrowserEvent>(extraBufferCapacity = 8)
    val events: SharedFlow<BrowserEvent> = _events.asSharedFlow()

    private var recentlyClosed: ClosedTab? = null
    private var persistJob: Job? = null
    private val stateFile = File(context.filesDir, "tabs.json")
    private var restored = false

    val selected: Tab? get() = _tabs.value.firstOrNull { it.id == _selectedId.value }

    fun tab(id: String): Tab? = _tabs.value.firstOrNull { it.id == id }

    /** Restores the last session once per process. Leaves one blank tab if nothing was saved. */
    suspend fun restore() {
        if (restored) return
        restored = true
        val saved = withContext(Dispatchers.IO) { readState() }
        if (saved == null || saved.tabs.isEmpty()) {
            newTab()
            return
        }
        val restoredTabs = saved.tabs.map { entry ->
            createTab(
                id = entry.id,
                isPrivate = false,
                initial = TabState(id = entry.id, url = entry.url, title = entry.title, lastAccessed = entry.lastAccessed),
            ).also { tab ->
                tab.sessionState = entry.sessionState
                if (entry.sessionState == null) tab.pendingUrl = entry.url
            }
        }
        _tabs.value = restoredTabs
        select(saved.selectedId?.takeIf { id -> restoredTabs.any { it.id == id } } ?: restoredTabs.last().id)
    }

    fun newTab(
        url: String? = null,
        isPrivate: Boolean = false,
        select: Boolean = true,
        parentId: String? = null,
    ): Tab {
        val id = UUID.randomUUID().toString()
        val tab = createTab(id, isPrivate, TabState(id = id, url = url ?: "", isPrivate = isPrivate))
        tab.pendingUrl = url
        insertTab(tab, parentId)
        if (select) select(tab.id) else if (url != null) ensureOpen(tab)
        schedulePersist()
        return tab
    }

    /**
     * Creates a tab whose session Gecko itself opens and loads, for window.open, target=_blank
     * and extension tabs. The returned session must not be opened by the caller.
     */
    fun adoptSession(url: String?, isPrivate: Boolean, parentId: String?, select: Boolean): GeckoSession {
        val id = UUID.randomUUID().toString()
        val child = createTab(id, isPrivate, TabState(id = id, url = url.orEmpty()))
        insertTab(child, parentId)
        if (select) {
            selected?.session?.setActive(false)
            _selectedId.value = id
        }
        schedulePersist()
        return child.session
    }

    fun select(id: String) {
        val tab = tab(id) ?: return
        val previous = selected
        if (previous?.id != id) previous?.session?.setActive(false)
        ensureOpen(tab)
        tab.session.setActive(true)
        tab.update { it.copy(lastAccessed = System.currentTimeMillis()) }
        _selectedId.value = id
        schedulePersist()
    }

    fun close(id: String) {
        val list = _tabs.value
        val index = list.indexOfFirst { it.id == id }
        if (index < 0) return
        val tab = list[index]
        val remaining = list - tab
        recentlyClosed = ClosedTab(tab.current, tab.sessionState, index)
        val orphaned = _requests.value.filter { it.tabId == id }
        _requests.update { requests -> requests.filterNot { it.tabId == id } }
        orphaned.forEach(PageRequest::dismiss)
        _thumbnails.update { it - id }
        _tabs.value = remaining
        if (_selectedId.value == id) {
            val sameMode = remaining.filter { it.current.isPrivate == tab.current.isPrivate }
            val next = sameMode.getOrNull(index.coerceAtMost(sameMode.lastIndex))
                ?: sameMode.lastOrNull()
                ?: remaining.lastOrNull()
            if (next != null) select(next.id) else _selectedId.value = null
        }
        tab.session.close()
        _events.tryEmit(BrowserEvent.TabClosed(tab.current.displayTitle, tab.current.isPrivate))
        schedulePersist()
    }

    fun undoClose() {
        val closed = recentlyClosed ?: return
        recentlyClosed = null
        val id = UUID.randomUUID().toString()
        val tab = createTab(id, closed.state.isPrivate, closed.state.copy(id = id, isLoading = false, progress = 0))
        tab.sessionState = closed.sessionState
        if (closed.sessionState == null) tab.pendingUrl = closed.state.url
        _tabs.update { list -> list.toMutableList().apply { add(closed.index.coerceIn(0, size), tab) } }
        select(id)
    }

    fun closeAll(isPrivate: Boolean) {
        _tabs.value.filter { it.current.isPrivate == isPrivate }.forEach { close(it.id) }
        recentlyClosed = null
    }

    fun load(id: String, url: String) {
        val tab = tab(id) ?: return
        ensureOpen(tab)
        tab.update { it.copy(url = url) }
        tab.session.loadUri(url)
    }

    fun move(from: Int, to: Int) {
        _tabs.update { list ->
            if (from !in list.indices || to !in list.indices) list
            else list.toMutableList().apply { add(to, removeAt(from)) }
        }
        schedulePersist()
    }

    /** Downloads [url] directly, e.g. "Save image", using the tab's cookies and private mode. */
    fun download(url: String, isPrivate: Boolean, referrer: String?) {
        val request = WebRequest.Builder(url).referrer(referrer).build()
        val flags = if (isPrivate) GeckoWebExecutor.FETCH_FLAGS_PRIVATE else GeckoWebExecutor.FETCH_FLAGS_NONE
        GeckoWebExecutor(runtime).fetch(request, flags).then<Void>({ response ->
            response?.let { saveResponse(it, isPrivate) }
            null
        }, { _ ->
            _events.tryEmit(BrowserEvent.DownloadFailed(Uri.parse(url).lastPathSegment ?: url))
            null
        })
    }

    private fun saveResponse(response: WebResponse, isPrivate: Boolean) {
        scope.launch {
            val name = downloads.save(response, isPrivate)
            _events.tryEmit(
                if (name != null) BrowserEvent.DownloadStarted(name)
                else BrowserEvent.DownloadFailed(Uri.parse(response.uri).lastPathSegment ?: response.uri)
            )
        }
    }

    fun resolve(request: PageRequest) {
        _requests.update { it - request }
    }

    fun setThumbnail(id: String, bitmap: Bitmap) {
        _thumbnails.update { it + (id to bitmap.asImageBitmap()) }
    }

    /** Writes the session now, e.g. when the activity stops. */
    fun persistNow() {
        persistJob?.cancel()
        val snapshot = snapshot()
        scope.launch(Dispatchers.IO) { writeState(snapshot) }
    }

    private fun schedulePersist() {
        persistJob?.cancel()
        persistJob = scope.launch {
            delay(1_000)
            val snapshot = snapshot()
            withContext(Dispatchers.IO) { writeState(snapshot) }
        }
    }

    private fun insertTab(tab: Tab, parentId: String?) {
        _tabs.update { list ->
            val parentIndex = parentId?.let { pid -> list.indexOfFirst { it.id == pid } } ?: -1
            if (parentIndex >= 0) list.toMutableList().apply { add(parentIndex + 1, tab) } else list + tab
        }
    }

    private fun ensureOpen(tab: Tab) {
        if (tab.session.isOpen) return
        tab.session.open(runtime)
        val state = tab.sessionState?.let(GeckoSession.SessionState::fromString)
        val url = tab.pendingUrl
        when {
            state != null -> tab.session.restoreState(state)
            !url.isNullOrEmpty() -> tab.session.loadUri(url)
        }
        tab.pendingUrl = null
    }

    private fun createTab(id: String, isPrivate: Boolean, initial: TabState): Tab {
        val tab = Tab(id, newSession(isPrivate), initial.copy(isPrivate = isPrivate))
        attachDelegates(tab)
        return tab
    }

    private fun newSession(isPrivate: Boolean) = GeckoSession(
        GeckoSessionSettings.Builder()
            .usePrivateMode(isPrivate)
            .useTrackingProtection(true)
            .suspendMediaWhenInactive(false)
            .build()
    )

    private fun attachDelegates(tab: Tab) {
        val session = tab.session
        session.navigationDelegate = NavigationHandler(tab)
        session.progressDelegate = ProgressHandler(tab)
        session.contentDelegate = ContentHandler(tab)
        session.historyDelegate = HistoryHandler(tab)
        session.promptDelegate = PromptHandler(tab)
        session.permissionDelegate = PermissionHandler(tab)
    }

    private fun addRequest(request: PageRequest) {
        _requests.update { it + request }
    }

    private inner class NavigationHandler(private val tab: Tab) : NavigationDelegate {
        override fun onCanGoBack(session: GeckoSession, canGoBack: Boolean) =
            tab.update { it.copy(canGoBack = canGoBack) }

        override fun onCanGoForward(session: GeckoSession, canGoForward: Boolean) =
            tab.update { it.copy(canGoForward = canGoForward) }

        override fun onLocationChange(
            session: GeckoSession,
            url: String?,
            perms: MutableList<PermissionDelegate.ContentPermission>,
            hasUserGesture: Boolean,
        ) {
            tab.update { state ->
                val newUrl = url ?: ""
                state.copy(
                    url = newUrl,
                    security = if (newUrl.startsWith("https://")) state.security else Security.None,
                )
            }
            schedulePersist()
        }

        override fun onLoadRequest(
            session: GeckoSession,
            request: NavigationDelegate.LoadRequest,
        ): GeckoResult<AllowOrDeny>? {
            val uri = Uri.parse(request.uri)
            return when (uri.scheme?.lowercase()) {
                null, "http", "https", "about", "data", "blob", "file", "resource", "moz-extension", "view-source", "javascript" ->
                    GeckoResult.fromValue(AllowOrDeny.ALLOW)
                else -> {
                    _events.tryEmit(BrowserEvent.OpenExternal(uri))
                    GeckoResult.fromValue(AllowOrDeny.DENY)
                }
            }
        }

        override fun onNewSession(session: GeckoSession, uri: String): GeckoResult<GeckoSession> =
            GeckoResult.fromValue(adoptSession(uri, tab.current.isPrivate, tab.id, select = true))
    }

    private inner class ProgressHandler(private val tab: Tab) : ProgressDelegate {
        override fun onPageStart(session: GeckoSession, url: String) =
            tab.update { it.copy(isLoading = true, progress = 5, url = url) }

        override fun onPageStop(session: GeckoSession, success: Boolean) =
            tab.update { it.copy(isLoading = false, progress = 100) }

        override fun onProgressChange(session: GeckoSession, progress: Int) =
            tab.update { it.copy(progress = progress) }

        override fun onSecurityChange(session: GeckoSession, info: ProgressDelegate.SecurityInformation) =
            tab.update {
                it.copy(
                    security = when {
                        info.isSecure && info.mixedModeActive == 0 -> Security.Secure
                        it.url.startsWith("http://") -> Security.Insecure
                        else -> Security.None
                    }
                )
            }

        override fun onSessionStateChange(session: GeckoSession, sessionState: GeckoSession.SessionState) {
            if (tab.current.isPrivate) return
            tab.sessionState = sessionState.toString()
            schedulePersist()
        }
    }

    private inner class ContentHandler(private val tab: Tab) : ContentDelegate {
        override fun onTitleChange(session: GeckoSession, title: String?) {
            tab.update { it.copy(title = title.orEmpty()) }
            val state = tab.current
            if (!state.isPrivate && !title.isNullOrBlank() && state.url.startsWith("http")) {
                scope.launch(Dispatchers.IO) { history.updateTitle(state.url, title) }
            }
        }

        override fun onFullScreen(session: GeckoSession, fullScreen: Boolean) =
            tab.update { it.copy(isFullscreen = fullScreen) }

        override fun onCloseRequest(session: GeckoSession) = close(tab.id)

        override fun onExternalResponse(session: GeckoSession, response: WebResponse) {
            val type = response.headers.entries.firstOrNull { it.key.equals("Content-Type", true) }?.value
            if (type?.startsWith("application/x-xpinstall") == true) {
                response.body?.close()
                installAddon(response.uri)
                return
            }
            saveResponse(response, tab.current.isPrivate)
        }

        override fun onContextMenu(
            session: GeckoSession,
            screenX: Int,
            screenY: Int,
            element: ContentDelegate.ContextElement,
        ) {
            if (element.linkUri == null && element.srcUri == null) return
            addRequest(
                PageRequest.ContextMenu(
                    tabId = tab.id,
                    linkUrl = element.linkUri,
                    srcUrl = element.srcUri,
                    title = element.title ?: element.altText ?: element.textContent,
                    isImage = element.type == ContentDelegate.ContextElement.TYPE_IMAGE,
                    isVideo = element.type == ContentDelegate.ContextElement.TYPE_VIDEO,
                )
            )
        }

        override fun onCrash(session: GeckoSession) = rebuild(tab)

        override fun onKill(session: GeckoSession) = rebuild(tab)
    }

    private fun rebuild(tab: Tab) {
        tab.session.close()
        tab.session = newSession(tab.current.isPrivate)
        attachDelegates(tab)
        tab.update { it.copy(isLoading = false, progress = 0) }
        if (tab.sessionState == null) tab.pendingUrl = tab.current.url
        if (_selectedId.value == tab.id) {
            ensureOpen(tab)
            tab.session.setActive(true)
            // Re-emit the selection so the view attaches the new session.
            _selectedId.value = null
            _selectedId.value = tab.id
        }
    }

    private inner class HistoryHandler(private val tab: Tab) : HistoryDelegate {
        override fun onVisited(
            session: GeckoSession,
            url: String,
            lastVisitedURL: String?,
            flags: Int,
        ): GeckoResult<Boolean>? {
            val topLevel = flags and HistoryDelegate.VISIT_TOP_LEVEL != 0
            val redirectSource = flags and (HistoryDelegate.VISIT_REDIRECT_SOURCE or HistoryDelegate.VISIT_REDIRECT_SOURCE_PERMANENT) != 0
            val error = flags and HistoryDelegate.VISIT_UNRECOVERABLE_ERROR != 0
            if (tab.current.isPrivate || !topLevel || redirectSource || error || !url.startsWith("http")) {
                return GeckoResult.fromValue(false)
            }
            scope.launch(Dispatchers.IO) { history.recordVisit(url, tab.current.title) }
            return GeckoResult.fromValue(true)
        }

        override fun getVisited(session: GeckoSession, urls: Array<out String>): GeckoResult<BooleanArray>? {
            if (tab.current.isPrivate) return null
            val result = GeckoResult<BooleanArray>()
            scope.launch(Dispatchers.IO) {
                val visited = history.visitedAmong(urls.toList()).toSet()
                result.complete(BooleanArray(urls.size) { urls[it] in visited })
            }
            return result
        }
    }

    private inner class PromptHandler(private val tab: Tab) : PromptDelegate {
        private fun <P : PromptDelegate.BasePrompt> enqueue(
            prompt: P,
            build: (GeckoResult<PromptResponse>) -> PageRequest,
        ): GeckoResult<PromptResponse> {
            val result = GeckoResult<PromptResponse>()
            val request = build(result)
            prompt.delegate = object : PromptDelegate.PromptInstanceDelegate {
                override fun onPromptDismiss(prompt: PromptDelegate.BasePrompt) = resolve(request)
            }
            addRequest(request)
            return result
        }

        override fun onAlertPrompt(session: GeckoSession, prompt: PromptDelegate.AlertPrompt) =
            enqueue(prompt) { PageRequest.Alert(tab.id, prompt, it) }

        override fun onButtonPrompt(session: GeckoSession, prompt: PromptDelegate.ButtonPrompt) =
            enqueue(prompt) { PageRequest.Confirm(tab.id, prompt, it) }

        override fun onTextPrompt(session: GeckoSession, prompt: PromptDelegate.TextPrompt) =
            enqueue(prompt) { PageRequest.Text(tab.id, prompt, it) }

        override fun onAuthPrompt(session: GeckoSession, prompt: PromptDelegate.AuthPrompt) =
            enqueue(prompt) { PageRequest.Auth(tab.id, prompt, it) }

        override fun onChoicePrompt(session: GeckoSession, prompt: PromptDelegate.ChoicePrompt) =
            enqueue(prompt) { PageRequest.Choice(tab.id, prompt, it) }

        override fun onBeforeUnloadPrompt(session: GeckoSession, prompt: PromptDelegate.BeforeUnloadPrompt) =
            enqueue(prompt) { PageRequest.Leave(tab.id, prompt, it) }

        override fun onRepostConfirmPrompt(session: GeckoSession, prompt: PromptDelegate.RepostConfirmPrompt) =
            enqueue(prompt) { PageRequest.Repost(tab.id, prompt, it) }

        override fun onPopupPrompt(session: GeckoSession, prompt: PromptDelegate.PopupPrompt) =
            enqueue(prompt) { PageRequest.Popup(tab.id, prompt, it) }

        override fun onFilePrompt(session: GeckoSession, prompt: PromptDelegate.FilePrompt) =
            enqueue(prompt) { PageRequest.File(tab.id, prompt, it) }
    }

    private inner class PermissionHandler(private val tab: Tab) : PermissionDelegate {
        override fun onContentPermissionRequest(
            session: GeckoSession,
            perm: PermissionDelegate.ContentPermission,
        ): GeckoResult<Int>? {
            return when (perm.permission) {
                PermissionDelegate.PERMISSION_GEOLOCATION,
                PermissionDelegate.PERMISSION_DESKTOP_NOTIFICATION,
                PermissionDelegate.PERMISSION_XR,
                PermissionDelegate.PERMISSION_MEDIA_KEY_SYSTEM_ACCESS,
                PermissionDelegate.PERMISSION_STORAGE_ACCESS -> {
                    val result = GeckoResult<Int>()
                    addRequest(PageRequest.Permission(tab.id, Uri.parse(perm.uri).host ?: perm.uri, perm.permission, result))
                    result
                }
                PermissionDelegate.PERMISSION_AUTOPLAY_INAUDIBLE,
                PermissionDelegate.PERMISSION_PERSISTENT_STORAGE ->
                    GeckoResult.fromValue(PermissionDelegate.ContentPermission.VALUE_ALLOW)
                else -> GeckoResult.fromValue(PermissionDelegate.ContentPermission.VALUE_DENY)
            }
        }

        override fun onMediaPermissionRequest(
            session: GeckoSession,
            uri: String,
            video: Array<out PermissionDelegate.MediaSource>?,
            audio: Array<out PermissionDelegate.MediaSource>?,
            callback: PermissionDelegate.MediaCallback,
        ) {
            addRequest(
                PageRequest.Media(
                    tabId = tab.id,
                    host = Uri.parse(uri).host ?: uri,
                    video = video?.firstOrNull(),
                    audio = audio?.firstOrNull(),
                    callback = callback,
                )
            )
        }

        override fun onAndroidPermissionsRequest(
            session: GeckoSession,
            permissions: Array<out String>?,
            callback: PermissionDelegate.Callback,
        ) {
            val needed = permissions.orEmpty().filter {
                androidx.core.content.ContextCompat.checkSelfPermission(context, it) !=
                    android.content.pm.PackageManager.PERMISSION_GRANTED
            }
            if (needed.isEmpty()) callback.grant() else AndroidPermissions.request(needed, callback)
        }
    }

    private fun snapshot(): SavedState {
        val persistent = _tabs.value.filterNot { it.current.isPrivate }
        return SavedState(
            selectedId = _selectedId.value?.takeIf { id -> persistent.any { it.id == id } },
            tabs = persistent.map {
                SavedTab(it.id, it.current.url, it.current.title, it.sessionState, it.current.lastAccessed)
            },
        )
    }

    private fun writeState(state: SavedState) {
        val json = JSONObject().apply {
            put("selected", state.selectedId)
            put("tabs", JSONArray().apply {
                state.tabs.forEach { tab ->
                    put(JSONObject().apply {
                        put("id", tab.id)
                        put("url", tab.url)
                        put("title", tab.title)
                        put("state", tab.sessionState)
                        put("lastAccessed", tab.lastAccessed)
                    })
                }
            })
        }
        val tmp = File(stateFile.parentFile, stateFile.name + ".tmp")
        tmp.writeText(json.toString())
        tmp.renameTo(stateFile)
    }

    private fun readState(): SavedState? = runCatching {
        if (!stateFile.exists()) return null
        val json = JSONObject(stateFile.readText())
        val array = json.getJSONArray("tabs")
        SavedState(
            selectedId = json.optString("selected").takeIf { it.isNotEmpty() },
            tabs = (0 until array.length()).map { i ->
                val o = array.getJSONObject(i)
                SavedTab(
                    id = o.getString("id"),
                    url = o.optString("url"),
                    title = o.optString("title"),
                    sessionState = o.optString("state").takeIf { it.isNotEmpty() && it != "null" },
                    lastAccessed = o.optLong("lastAccessed", System.currentTimeMillis()),
                )
            },
        )
    }.getOrNull()

    private data class SavedTab(val id: String, val url: String, val title: String, val sessionState: String?, val lastAccessed: Long)
    private data class SavedState(val selectedId: String?, val tabs: List<SavedTab>)
    private data class ClosedTab(val state: TabState, val sessionState: String?, val index: Int)
}
