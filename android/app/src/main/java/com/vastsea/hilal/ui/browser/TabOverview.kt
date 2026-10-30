package com.vastsea.hilal.ui.browser

import androidx.compose.animation.core.Animatable
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.gestures.Orientation
import androidx.compose.foundation.gestures.draggable
import androidx.compose.foundation.gestures.rememberDraggableState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.grid.rememberLazyGridState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.outlined.MoreVert
import androidx.compose.material.icons.outlined.Tab
import androidx.compose.material.icons.outlined.VisibilityOff
import androidx.compose.material3.ButtonGroupDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MediumExtendedFloatingActionButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.ToggleButton
import androidx.compose.material3.ToggleButtonDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.vastsea.hilal.R
import com.vastsea.hilal.browser.Tab
import com.vastsea.hilal.browser.TabState
import com.vastsea.hilal.search.InputResolver
import com.vastsea.hilal.ui.theme.LocalHaptics
import kotlinx.coroutines.launch
import kotlin.math.abs

@Composable
fun TabOverview(
    tabs: List<Tab>,
    selectedId: String?,
    thumbnails: Map<String, ImageBitmap>,
    initialPrivate: Boolean,
    onSelect: (String) -> Unit,
    onClose: (String) -> Unit,
    onCloseAll: (isPrivate: Boolean) -> Unit,
    onNewTab: (isPrivate: Boolean) -> Unit,
    onDismiss: () -> Unit,
) {
    var showPrivate by remember { mutableStateOf(initialPrivate) }
    val visible = tabs.filter { it.current.isPrivate == showPrivate }
    val normalCount = tabs.count { !it.current.isPrivate }
    val privateCount = tabs.size - normalCount
    val grid = rememberLazyGridState()

    LaunchedEffect(showPrivate) {
        val index = visible.indexOfFirst { it.id == selectedId }
        if (index >= 0) grid.scrollToItem(index)
    }

    Surface(color = MaterialTheme.colorScheme.surfaceContainer, modifier = Modifier.fillMaxSize()) {
        Box(Modifier.fillMaxSize()) {
            Column(Modifier.fillMaxSize().windowInsetsPadding(WindowInsets.statusBars)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth().padding(start = 16.dp, end = 4.dp, top = 8.dp, bottom = 4.dp),
                ) {
                    Row(horizontalArrangement = Arrangement.spacedBy(ButtonGroupDefaults.ConnectedSpaceBetween)) {
                        ToggleButton(
                            checked = !showPrivate,
                            onCheckedChange = { showPrivate = false },
                            shapes = ButtonGroupDefaults.connectedLeadingButtonShapes(),
                            icon = { Icon(Icons.Outlined.Tab, null, Modifier.size(ToggleButtonDefaults.IconSize)) },
                        ) { Text("${stringResource(R.string.tabs_normal)} · $normalCount") }
                        ToggleButton(
                            checked = showPrivate,
                            onCheckedChange = { showPrivate = true },
                            shapes = ButtonGroupDefaults.connectedTrailingButtonShapes(),
                            icon = { Icon(Icons.Outlined.VisibilityOff, null, Modifier.size(ToggleButtonDefaults.IconSize)) },
                        ) { Text("${stringResource(R.string.tabs_private)} · $privateCount") }
                    }
                    Spacer(Modifier.weight(1f))
                    OverviewMenu(enabled = visible.isNotEmpty(), onCloseAll = { onCloseAll(showPrivate) })
                    IconButton(onClick = onDismiss, enabled = visible.isNotEmpty()) {
                        Icon(Icons.Outlined.Close, contentDescription = stringResource(R.string.close))
                    }
                }
                if (visible.isEmpty()) {
                    Box(Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                        Text(
                            stringResource(if (showPrivate) R.string.no_private_tabs else R.string.new_tab),
                            style = MaterialTheme.typography.bodyLarge,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                } else {
                    LazyVerticalGrid(
                        state = grid,
                        columns = GridCells.Adaptive(minSize = 156.dp),
                        contentPadding = PaddingValues(start = 12.dp, end = 12.dp, top = 8.dp, bottom = 120.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        modifier = Modifier.weight(1f),
                    ) {
                        items(visible, key = { it.id }) { tab ->
                            TabCard(
                                tab = tab.current,
                                thumbnail = thumbnails[tab.id],
                                selected = tab.id == selectedId,
                                onClick = { onSelect(tab.id) },
                                onClose = { onClose(tab.id) },
                                modifier = Modifier.animateItem(
                                    fadeInSpec = MaterialTheme.motionScheme.defaultEffectsSpec(),
                                    placementSpec = MaterialTheme.motionScheme.defaultSpatialSpec(),
                                    fadeOutSpec = MaterialTheme.motionScheme.fastEffectsSpec(),
                                ),
                            )
                        }
                    }
                }
            }
            MediumExtendedFloatingActionButton(
                text = { Text(stringResource(if (showPrivate) R.string.new_private_tab else R.string.new_tab)) },
                icon = { Icon(Icons.Outlined.Add, contentDescription = null) },
                onClick = { onNewTab(showPrivate) },
                containerColor = if (showPrivate) MaterialTheme.colorScheme.tertiaryContainer else MaterialTheme.colorScheme.primaryContainer,
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .windowInsetsPadding(WindowInsets.navigationBars)
                    .padding(bottom = 20.dp),
            )
        }
    }
}

@Composable
private fun OverviewMenu(enabled: Boolean, onCloseAll: () -> Unit) {
    var open by remember { mutableStateOf(false) }
    Box {
        IconButton(onClick = { open = true }, enabled = enabled) {
            Icon(Icons.Outlined.MoreVert, contentDescription = stringResource(R.string.menu))
        }
        DropdownMenu(expanded = open, onDismissRequest = { open = false }) {
            DropdownMenuItem(
                text = { Text(stringResource(R.string.close_all_tabs)) },
                onClick = {
                    open = false
                    onCloseAll()
                },
            )
        }
    }
}

/** A tab card. Swipe it sideways to close; it follows the finger and fades as it goes. */
@Composable
private fun TabCard(
    tab: TabState,
    thumbnail: ImageBitmap?,
    selected: Boolean,
    onClick: () -> Unit,
    onClose: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val haptics = LocalHaptics.current
    val scope = rememberCoroutineScope()
    val offset = remember { Animatable(0f) }
    var width by remember { mutableStateOf(1f) }
    var armed by remember { mutableStateOf(false) }
    val spatial = MaterialTheme.motionScheme.fastSpatialSpec<Float>()

    Surface(
        onClick = onClick,
        shape = RoundedCornerShape(24.dp),
        color = MaterialTheme.colorScheme.surfaceContainerHighest,
        border = if (selected) BorderStroke(3.dp, if (tab.isPrivate) MaterialTheme.colorScheme.tertiary else MaterialTheme.colorScheme.primary) else null,
        modifier = modifier
            .onSizeChanged { width = it.width.toFloat() }
            .graphicsLayer {
                translationX = offset.value
                alpha = 1f - (abs(offset.value) / width).coerceIn(0f, 1f) * 0.8f
            }
            .draggable(
                orientation = Orientation.Horizontal,
                state = rememberDraggableState { delta ->
                    val next = offset.value + delta
                    scope.launch { offset.snapTo(next) }
                    val past = abs(next) > width * 0.4f
                    if (past && !armed) haptics.threshold()
                    armed = past
                },
                onDragStopped = { velocity ->
                    if (armed || abs(velocity) > 2000f) {
                        val direction = if (offset.value + velocity * 0.05f < 0) -1 else 1
                        offset.animateTo(direction * width * 1.3f, spatial)
                        onClose()
                    } else {
                        offset.animateTo(0f, spatial)
                    }
                    armed = false
                },
            ),
    ) {
        Column {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth().padding(start = 14.dp, end = 2.dp),
            ) {
                Text(
                    tab.title.ifBlank { if (tab.isBlank) stringResource(R.string.new_tab) else InputResolver.host(tab.url) },
                    style = MaterialTheme.typography.labelLarge,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f),
                )
                IconButton(onClick = onClose, modifier = Modifier.size(40.dp)) {
                    Icon(Icons.Outlined.Close, contentDescription = stringResource(R.string.close_tab), modifier = Modifier.size(18.dp))
                }
            }
            Box(
                Modifier
                    .fillMaxWidth()
                    .aspectRatio(0.78f)
                    .padding(start = 6.dp, end = 6.dp, bottom = 6.dp)
            ) {
                Surface(shape = RoundedCornerShape(18.dp), color = MaterialTheme.colorScheme.surface, modifier = Modifier.fillMaxSize()) {
                    if (thumbnail != null) {
                        Image(thumbnail, null, contentScale = ContentScale.Crop, alignment = Alignment.TopCenter, modifier = Modifier.fillMaxSize())
                    } else {
                        TabPlaceholder(tab)
                    }
                }
            }
        }
    }
}

@Composable
fun TabPlaceholder(tab: TabState?) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
        modifier = Modifier.fillMaxSize().padding(12.dp),
    ) {
        val host = tab?.url?.takeUnless { tab.isBlank }?.let(InputResolver::host)
        if (host != null) {
            Monogram(host, Modifier.size(56.dp))
        } else {
            Icon(
                if (tab?.isPrivate == true) Icons.Outlined.VisibilityOff else Icons.Outlined.Tab,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(40.dp),
            )
        }
        Spacer(Modifier.width(0.dp))
    }
}
