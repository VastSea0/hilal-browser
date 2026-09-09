package com.vastsea.hilal.model

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import org.mozilla.geckoview.GeckoSession

class BrowserTab(
    val id: String,
    initialUrl: String = "about:newtab",
    initialTitle: String = "Yeni Sekme",
    var workspaceId: String,
    val isPrivate: Boolean = false,
    val session: GeckoSession? = null
) {
    var url by mutableStateOf(initialUrl)
    var title by mutableStateOf(initialTitle)
    var isLoading by mutableStateOf(false)
    var progress by mutableIntStateOf(0)
    var canGoBack by mutableStateOf(false)
    var canGoForward by mutableStateOf(false)
}
