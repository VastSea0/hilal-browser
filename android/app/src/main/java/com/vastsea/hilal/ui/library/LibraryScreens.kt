package com.vastsea.hilal.ui.library

import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import android.text.format.DateUtils
import android.text.format.Formatter
import android.widget.Toast
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.DeleteSweep
import androidx.compose.material.icons.outlined.Description
import androidx.compose.material.icons.outlined.ErrorOutline
import androidx.compose.material.icons.outlined.MoreVert
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ListItemDefaults
import androidx.compose.material3.LoadingIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MediumFlexibleTopAppBar
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SegmentedListItem
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.vastsea.hilal.AppContainer
import com.vastsea.hilal.R
import com.vastsea.hilal.data.DownloadEntry
import com.vastsea.hilal.search.InputResolver
import com.vastsea.hilal.ui.browser.Monogram
import kotlinx.coroutines.launch
import java.util.Calendar

typealias OpenUrl = (url: String, newTab: Boolean, isPrivate: Boolean) -> Unit

@Composable
fun LibraryScaffold(
    title: String,
    onBack: () -> Unit,
    actions: @Composable () -> Unit = {},
    content: @Composable (PaddingValues) -> Unit,
) {
    val scroll = TopAppBarDefaults.exitUntilCollapsedScrollBehavior()
    Scaffold(
        modifier = Modifier.nestedScroll(scroll.nestedScrollConnection),
        containerColor = MaterialTheme.colorScheme.surfaceContainer,
        topBar = {
            MediumFlexibleTopAppBar(
                title = { Text(title) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Outlined.ArrowBack, contentDescription = stringResource(R.string.back))
                    }
                },
                actions = { actions() },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surfaceContainer,
                    scrolledContainerColor = MaterialTheme.colorScheme.surfaceContainer,
                ),
                scrollBehavior = scroll,
            )
        },
        content = content,
    )
}

@Composable
fun EmptyState(text: String, padding: PaddingValues) {
    Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
        Text(text, style = MaterialTheme.typography.bodyLarge, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

/** A titled group of segmented list items, the expressive way to show grouped lists. */
fun <T> LazyListScope.segmentedGroup(
    header: String?,
    items: List<T>,
    key: (T) -> Any,
    row: @Composable (item: T, shapes: androidx.compose.material3.ListItemShapes) -> Unit,
) {
    if (header != null) {
        item(key = "h:$header") {
            Text(
                header,
                style = MaterialTheme.typography.titleSmall,
                color = MaterialTheme.colorScheme.primary,
                modifier = Modifier.padding(start = 28.dp, top = 16.dp, bottom = 8.dp),
            )
        }
    }
    itemsIndexed(items, key = { _, item -> key(item) }) { index, item ->
        row(item, ListItemDefaults.segmentedShapes(index, items.size))
    }
}

@Composable
fun HistoryScreen(container: AppContainer, onBack: () -> Unit, onOpen: OpenUrl) {
    val dao = container.database.history()
    val entries by remember { dao.recent() }.collectAsState(null)
    val scope = rememberCoroutineScope()
    var confirmClear by remember { mutableStateOf(false) }

    LibraryScaffold(
        title = stringResource(R.string.history),
        onBack = onBack,
        actions = {
            IconButton(onClick = { confirmClear = true }) {
                Icon(Icons.Outlined.DeleteSweep, contentDescription = stringResource(R.string.clear_history))
            }
        },
    ) { padding ->
        val list = entries
        when {
            list == null -> Unit
            list.isEmpty() -> EmptyState(stringResource(R.string.history_empty), padding)
            else -> {
                val startOfToday = remember { startOfDay(0) }
                val startOfYesterday = remember { startOfDay(-1) }
                val groups = listOf(
                    stringResource(R.string.today) to list.filter { it.lastVisited >= startOfToday },
                    stringResource(R.string.yesterday) to list.filter { it.lastVisited in startOfYesterday until startOfToday },
                    stringResource(R.string.earlier) to list.filter { it.lastVisited < startOfYesterday },
                ).filter { it.second.isNotEmpty() }
                LazyColumn(
                    contentPadding = PaddingValues(start = 12.dp, end = 12.dp, top = padding.calculateTopPadding(), bottom = padding.calculateBottomPadding() + 24.dp),
                    verticalArrangement = Arrangement.spacedBy(ListItemDefaults.SegmentedGap),
                ) {
                    groups.forEach { (label, items) ->
                        segmentedGroup(label, items, key = { it.id }) { entry, shapes ->
                            PageRow(
                                url = entry.url,
                                title = entry.title,
                                shapes = shapes,
                                onOpen = onOpen,
                                onDelete = { scope.launch { dao.delete(entry.id) } },
                                modifier = Modifier.animateItem(),
                            )
                        }
                    }
                }
            }
        }
    }

    if (confirmClear) {
        ClearHistoryDialog(
            onClear = { since ->
                confirmClear = false
                scope.launch { dao.deleteSince(since) }
            },
            onDismiss = { confirmClear = false },
        )
    }
}

@Composable
private fun ClearHistoryDialog(onClear: (since: Long) -> Unit, onDismiss: () -> Unit) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(stringResource(R.string.clear_history_title)) },
        text = {
            androidx.compose.foundation.layout.Column {
                TextButton(onClick = { onClear(System.currentTimeMillis() - DateUtils.HOUR_IN_MILLIS) }) {
                    Text(stringResource(R.string.clear_history_last_hour))
                }
                TextButton(onClick = { onClear(startOfDay(0)) }) { Text(stringResource(R.string.clear_history_today)) }
                TextButton(onClick = { onClear(0) }) { Text(stringResource(R.string.clear_history_all)) }
            }
        },
        confirmButton = {},
        dismissButton = { TextButton(onClick = onDismiss) { Text(stringResource(R.string.cancel)) } },
    )
}

@Composable
fun BookmarksScreen(container: AppContainer, onBack: () -> Unit, onOpen: OpenUrl) {
    val dao = container.database.bookmarks()
    val bookmarks by remember { dao.all() }.collectAsState(null)
    val scope = rememberCoroutineScope()

    LibraryScaffold(title = stringResource(R.string.bookmarks), onBack = onBack) { padding ->
        val list = bookmarks
        when {
            list == null -> Unit
            list.isEmpty() -> EmptyState(stringResource(R.string.bookmarks_empty), padding)
            else -> LazyColumn(
                contentPadding = PaddingValues(start = 12.dp, end = 12.dp, top = padding.calculateTopPadding() + 8.dp, bottom = padding.calculateBottomPadding() + 24.dp),
                verticalArrangement = Arrangement.spacedBy(ListItemDefaults.SegmentedGap),
            ) {
                segmentedGroup(null, list, key = { it.id }) { bookmark, shapes ->
                    PageRow(
                        url = bookmark.url,
                        title = bookmark.title,
                        shapes = shapes,
                        onOpen = onOpen,
                        onDelete = { scope.launch { dao.deleteUrl(bookmark.url) } },
                        modifier = Modifier.animateItem(),
                    )
                }
            }
        }
    }
}

@Composable
private fun PageRow(
    url: String,
    title: String,
    shapes: androidx.compose.material3.ListItemShapes,
    onOpen: OpenUrl,
    onDelete: () -> Unit,
    modifier: Modifier = Modifier,
) {
    var menu by remember { mutableStateOf(false) }
    val host = InputResolver.host(url)
    SegmentedListItem(
        onClick = { onOpen(url, false, false) },
        onLongClick = { menu = true },
        shapes = shapes,
        modifier = modifier,
        leadingContent = { Monogram(host, Modifier.size(40.dp)) },
        supportingContent = { Text(InputResolver.displayUrl(url), maxLines = 1, overflow = TextOverflow.Ellipsis) },
        trailingContent = {
            Box {
                IconButton(onClick = { menu = true }) {
                    Icon(Icons.Outlined.MoreVert, contentDescription = stringResource(R.string.menu))
                }
                DropdownMenu(expanded = menu, onDismissRequest = { menu = false }) {
                    DropdownMenuItem(text = { Text(stringResource(R.string.open_in_new_tab)) }, onClick = { menu = false; onOpen(url, true, false) })
                    DropdownMenuItem(text = { Text(stringResource(R.string.open_in_private_tab)) }, onClick = { menu = false; onOpen(url, true, true) })
                    DropdownMenuItem(
                        text = { Text(stringResource(R.string.delete)) },
                        leadingIcon = { Icon(Icons.Outlined.Delete, null) },
                        onClick = { menu = false; onDelete() },
                    )
                }
            }
        },
    ) {
        Text(title.ifBlank { host }, maxLines = 1, overflow = TextOverflow.Ellipsis)
    }
}

@Composable
fun DownloadsScreen(container: AppContainer, onBack: () -> Unit) {
    val downloads by remember { container.downloads.downloads }.collectAsState(null)
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    fun open(entry: DownloadEntry) {
        val uri = entry.contentUri?.let(Uri::parse) ?: return
        val intent = Intent(Intent.ACTION_VIEW)
            .setDataAndType(uri, entry.mimeType ?: "*/*")
            .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK)
        try {
            context.startActivity(intent)
        } catch (_: ActivityNotFoundException) {
            Toast.makeText(context, R.string.no_app_to_open, Toast.LENGTH_SHORT).show()
        }
    }

    LibraryScaffold(title = stringResource(R.string.downloads), onBack = onBack) { padding ->
        val list = downloads
        when {
            list == null -> Unit
            list.isEmpty() -> EmptyState(stringResource(R.string.downloads_empty), padding)
            else -> LazyColumn(
                contentPadding = PaddingValues(start = 12.dp, end = 12.dp, top = padding.calculateTopPadding() + 8.dp, bottom = padding.calculateBottomPadding() + 24.dp),
                verticalArrangement = Arrangement.spacedBy(ListItemDefaults.SegmentedGap),
            ) {
                segmentedGroup(null, list, key = { it.id }) { entry, shapes ->
                    SegmentedListItem(
                        onClick = { open(entry) },
                        enabled = entry.status == DownloadEntry.STATUS_DONE,
                        shapes = shapes,
                        modifier = Modifier.animateItem(),
                        leadingContent = {
                            when (entry.status) {
                                DownloadEntry.STATUS_RUNNING -> LoadingIndicator(Modifier.size(40.dp))
                                DownloadEntry.STATUS_FAILED -> Icon(Icons.Outlined.ErrorOutline, null, tint = MaterialTheme.colorScheme.error)
                                else -> Icon(Icons.Outlined.Description, null)
                            }
                        },
                        supportingContent = {
                            Text(
                                when (entry.status) {
                                    DownloadEntry.STATUS_RUNNING -> stringResource(R.string.download_running_status)
                                    DownloadEntry.STATUS_FAILED -> stringResource(R.string.download_failed_status)
                                    else -> Formatter.formatShortFileSize(context, entry.sizeBytes) + " · " +
                                        InputResolver.host(entry.url)
                                },
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis,
                            )
                        },
                        trailingContent = {
                            IconButton(onClick = { scope.launch { container.downloads.delete(entry) } }) {
                                Icon(Icons.Outlined.Delete, contentDescription = stringResource(R.string.delete))
                            }
                        },
                    ) {
                        Text(entry.fileName, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    }
                }
            }
        }
    }
}

private fun startOfDay(offsetDays: Int): Long = Calendar.getInstance().apply {
    add(Calendar.DAY_OF_YEAR, offsetDays)
    set(Calendar.HOUR_OF_DAY, 0)
    set(Calendar.MINUTE, 0)
    set(Calendar.SECOND, 0)
    set(Calendar.MILLISECOND, 0)
}.timeInMillis
