package com.vastsea.hilal.ui.browser

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
import androidx.compose.material.icons.automirrored.outlined.ArrowForward
import androidx.compose.material.icons.outlined.Bookmark
import androidx.compose.material.icons.outlined.BookmarkBorder
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.outlined.ContentCopy
import androidx.compose.material.icons.outlined.ContentPaste
import androidx.compose.material.icons.outlined.Download
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material.icons.outlined.Extension
import androidx.compose.material.icons.outlined.FindInPage
import androidx.compose.material.icons.outlined.History
import androidx.compose.material.icons.outlined.Refresh
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material.icons.outlined.Share
import androidx.compose.material.icons.outlined.Tab
import androidx.compose.material.icons.outlined.VisibilityOff
import androidx.compose.material.icons.outlined.CollectionsBookmark
import androidx.compose.material3.FilledTonalIconButton
import androidx.compose.material3.FilledTonalIconToggleButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.vastsea.hilal.AppContainer
import com.vastsea.hilal.R
import com.vastsea.hilal.browser.TabState
import com.vastsea.hilal.data.Bookmark
import com.vastsea.hilal.search.InputResolver
import com.vastsea.hilal.ui.Screen
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.launch

@Composable
fun PageMenu(
    container: AppContainer,
    state: TabState?,
    onBack: () -> Unit,
    onForward: () -> Unit,
    onReload: () -> Unit,
    onShare: () -> Unit,
    onFind: () -> Unit,
    onNewTab: (isPrivate: Boolean) -> Unit,
    onNavigate: (Screen) -> Unit,
    onDismiss: () -> Unit,
) {
    val sheet = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val scope = rememberCoroutineScope()
    val bookmarks = container.database.bookmarks()
    val url = state?.url?.takeUnless { state.isBlank }
    val isBookmarked by remember(url) { url?.let(bookmarks::isBookmarked) ?: flowOf(false) }.collectAsState(false)

    fun closeThen(action: () -> Unit) {
        scope.launch { sheet.hide() }.invokeOnCompletion {
            onDismiss()
            action()
        }
    }

    ModalBottomSheet(onDismissRequest = onDismiss, sheetState = sheet) {
        Column(Modifier.padding(bottom = 16.dp)) {
            if (url != null) {
                Column(Modifier.padding(horizontal = 24.dp)) {
                    Text(
                        state?.displayTitle.orEmpty(),
                        style = MaterialTheme.typography.titleMedium,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                    Text(
                        InputResolver.displayUrl(url),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
                Spacer(Modifier.height(16.dp))
            }
            Row(
                horizontalArrangement = Arrangement.SpaceEvenly,
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
            ) {
                MenuIconButton(Icons.AutoMirrored.Outlined.ArrowBack, R.string.back, enabled = state?.canGoBack == true) { closeThen(onBack) }
                MenuIconButton(Icons.AutoMirrored.Outlined.ArrowForward, R.string.forward, enabled = state?.canGoForward == true) { closeThen(onForward) }
                MenuIconButton(
                    if (state?.isLoading == true) Icons.Outlined.Close else Icons.Outlined.Refresh,
                    if (state?.isLoading == true) R.string.stop else R.string.reload,
                    enabled = url != null,
                ) { closeThen(onReload) }
                FilledTonalIconToggleButton(
                    checked = isBookmarked,
                    onCheckedChange = { checked ->
                        val current = state ?: return@FilledTonalIconToggleButton
                        scope.launch {
                            if (checked) bookmarks.insert(Bookmark(url = current.url, title = current.title))
                            else bookmarks.deleteUrl(current.url)
                        }
                    },
                    enabled = url != null && state?.isPrivate != true,
                    shapes = IconButtonDefaults.toggleableShapes(),
                    modifier = Modifier.size(56.dp),
                ) {
                    Icon(
                        if (isBookmarked) Icons.Outlined.Bookmark else Icons.Outlined.BookmarkBorder,
                        contentDescription = stringResource(if (isBookmarked) R.string.bookmarked else R.string.bookmark),
                    )
                }
                MenuIconButton(Icons.Outlined.Share, R.string.share, enabled = url != null) { closeThen(onShare) }
            }
            Spacer(Modifier.height(12.dp))
            if (url != null) MenuRow(Icons.Outlined.FindInPage, R.string.find_in_page) { closeThen(onFind) }
            MenuRow(Icons.Outlined.Tab, R.string.new_tab) { closeThen { onNewTab(false) } }
            MenuRow(Icons.Outlined.VisibilityOff, R.string.new_private_tab) { closeThen { onNewTab(true) } }
            MenuRow(Icons.Outlined.History, R.string.history) { closeThen { onNavigate(Screen.History) } }
            MenuRow(Icons.Outlined.CollectionsBookmark, R.string.bookmarks) { closeThen { onNavigate(Screen.Bookmarks) } }
            MenuRow(Icons.Outlined.Download, R.string.downloads) { closeThen { onNavigate(Screen.Downloads) } }
            MenuRow(Icons.Outlined.Extension, R.string.addons) { closeThen { onNavigate(Screen.Addons) } }
            MenuRow(Icons.Outlined.Settings, R.string.settings) { closeThen { onNavigate(Screen.Settings) } }
        }
    }
}

@Composable
private fun MenuIconButton(icon: ImageVector, label: Int, enabled: Boolean, onClick: () -> Unit) {
    FilledTonalIconButton(
        onClick = onClick,
        enabled = enabled,
        shapes = IconButtonDefaults.shapes(),
        modifier = Modifier.size(56.dp),
    ) {
        Icon(icon, contentDescription = stringResource(label))
    }
}

@Composable
fun MenuRow(icon: ImageVector, label: Int, onClick: () -> Unit) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp)
            .clip(RoundedCornerShape(28.dp))
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 14.dp),
    ) {
        Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.width(20.dp))
        Text(stringResource(label), style = MaterialTheme.typography.bodyLarge)
    }
}

/** Long press on the address bar: copy, paste-and-go, share, edit the current address. */
@Composable
fun QuickActionsSheet(
    url: String?,
    onPasteAndGo: (String) -> Unit,
    onCopied: () -> Unit,
    onShare: () -> Unit,
    onEdit: (String) -> Unit,
    onDismiss: () -> Unit,
) {
    val context = LocalContext.current
    val clipboard = remember { context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager }
    val clip = remember {
        clipboard.primaryClip?.takeIf { it.itemCount > 0 }?.getItemAt(0)?.coerceToText(context)?.toString()?.trim()
            ?.takeIf { it.isNotEmpty() && it.length < 2000 }
    }
    val sheet = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val scope = rememberCoroutineScope()
    fun closeThen(action: () -> Unit) {
        scope.launch { sheet.hide() }.invokeOnCompletion {
            onDismiss()
            action()
        }
    }
    ModalBottomSheet(onDismissRequest = onDismiss, sheetState = sheet) {
        Column(Modifier.padding(bottom = 16.dp)) {
            if (clip != null) {
                MenuRow(Icons.Outlined.ContentPaste, R.string.paste_and_go) { closeThen { onPasteAndGo(clip) } }
            }
            if (url != null) {
                MenuRow(Icons.Outlined.ContentCopy, R.string.copy_link) {
                    clipboard.setPrimaryClip(ClipData.newPlainText(url, url))
                    // Android 13+ shows its own confirmation for clipboard writes.
                    closeThen { if (android.os.Build.VERSION.SDK_INT < 33) onCopied() }
                }
                MenuRow(Icons.Outlined.Share, R.string.share) { closeThen(onShare) }
                MenuRow(Icons.Outlined.Edit, R.string.address_edit) { closeThen { onEdit(url) } }
            }
        }
    }
}
