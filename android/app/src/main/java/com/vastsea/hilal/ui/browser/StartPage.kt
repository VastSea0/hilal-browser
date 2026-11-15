package com.vastsea.hilal.ui.browser

import android.graphics.BitmapFactory
import android.os.Build
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.ArrowDownward
import androidx.compose.material.icons.outlined.ArrowUpward
import androidx.compose.material.icons.outlined.BookmarkBorder
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.Download
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material.icons.outlined.History
import androidx.compose.material.icons.outlined.PushPin
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material.icons.outlined.SystemUpdate
import androidx.compose.material.icons.outlined.Tune
import androidx.compose.material.icons.outlined.VisibilityOff
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LocalContentColor
import androidx.compose.material3.MaterialShapes
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.toShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.vastsea.hilal.AppContainer
import com.vastsea.hilal.R
import com.vastsea.hilal.data.AmbientPreset
import com.vastsea.hilal.data.HeaderStyle
import com.vastsea.hilal.data.PinnedShortcut
import com.vastsea.hilal.data.TileShapeStyle
import com.vastsea.hilal.data.TileSize
import com.vastsea.hilal.live.LocalizedText
import com.vastsea.hilal.live.Notice
import com.vastsea.hilal.search.InputResolver
import com.vastsea.hilal.ui.Screen
import com.vastsea.hilal.ui.glass.GlassAmbientCanvas
import com.vastsea.hilal.ui.glass.GlassSpring
import com.vastsea.hilal.ui.glass.glassContentColor
import com.vastsea.hilal.ui.glass.isLiquidGlassActive
import com.vastsea.hilal.ui.glass.lightweightLiquidGlass
import com.vastsea.hilal.ui.glass.liquidGlassRim
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext
import java.io.File
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

private data class Site(val url: String, val title: String)

private fun AmbientPreset.colors(): Pair<Color, Color>? = when (this) {
    AmbientPreset.None -> null
    AmbientPreset.Aurora -> Color(0xFF00C9A7) to Color(0xFF845EC2)
    AmbientPreset.Dusk -> Color(0xFF845EC2) to Color(0xFFFF6F91)
    AmbientPreset.Midnight -> Color(0xFF1A237E) to Color(0xFF0D47A1)
    AmbientPreset.Sunset -> Color(0xFFFF9671) to Color(0xFFFFC75F)
    AmbientPreset.Emerald -> Color(0xFF00897B) to Color(0xFF26A69A)
    AmbientPreset.CottonCandy -> Color(0xFFFFB6C1) to Color(0xFF80DEEA)
}

/**
 * Shown for empty tabs: customizable wallpaper, header, shortcuts, most visited sites and bookmarks.
 */
@Composable
fun StartPage(
    container: AppContainer,
    isPrivate: Boolean,
    bottomPadding: Dp,
    onOpen: (String) -> Unit,
    onNavigate: (Screen) -> Unit = {},
    onOpenSearch: () -> Unit = {},
) {
    val config by container.newTab.config.collectAsState()
    val frequent by remember { container.database.history().topSites() }.collectAsState(emptyList())
    val bookmarks by remember { container.database.bookmarks().all() }.collectAsState(emptyList())

    val sites = remember(frequent, config.hiddenFrequentUrls) {
        frequent
            .filter { it.url !in config.hiddenFrequentUrls }
            .map { Site(it.url, it.title) }
    }
    val marks = remember(bookmarks) { bookmarks.take(8).map { Site(it.url, it.title) } }
    val shortcuts = config.pinnedShortcuts

    val live by container.live.config.collectAsState()
    val dismissed by container.live.dismissed.collectAsState()
    val apkTitle = stringResource(R.string.live_apk_update_title)
    val apkBody = live.apkUpdate?.let { stringResource(R.string.live_apk_update_body, it.versionName) }
    val notices = remember(live, dismissed, apkBody) {
        val apk = live.apkUpdate?.let { release ->
            Notice("apk-${release.versionCode}", LocalizedText(mapOf("en" to apkTitle)), apkBody?.let { LocalizedText(mapOf("en" to it)) }, release.url)
        }
        (listOfNotNull(apk) + live.notices).filter { it.id !in dismissed }
    }

    val wallpaperBitmap by produceState<ImageBitmap?>(initialValue = null, key1 = config.customWallpaperPath) {
        value = withContext(Dispatchers.IO) {
            val path = config.customWallpaperPath
            if (path != null && File(path).exists()) {
                try {
                    BitmapFactory.decodeFile(path)?.asImageBitmap()
                } catch (e: Exception) {
                    null
                }
            } else {
                null
            }
        }
    }

    var showCustomizeSheet by remember { mutableStateOf(false) }
    var addingShortcut by remember { mutableStateOf(false) }
    var editingShortcut by remember { mutableStateOf<PinnedShortcut?>(null) }
    var shortcutActionTarget by remember { mutableStateOf<PinnedShortcut?>(null) }
    var frequentActionTarget by remember { mutableStateOf<Site?>(null) }

    val glass = isLiquidGlassActive()
    val presetColors = if (isPrivate) null else config.ambientPreset.colors()

    val minCellSize = when (config.tileSize) {
        TileSize.Compact -> 72.dp
        TileSize.Medium -> 88.dp
        TileSize.Large -> 104.dp
    }
    val tileIconSize = when (config.tileSize) {
        TileSize.Compact -> 44.dp
        TileSize.Medium -> 56.dp
        TileSize.Large -> 68.dp
    }

    val contentColor = when {
        glass || wallpaperBitmap != null || presetColors != null -> glassContentColor()
        else -> MaterialTheme.colorScheme.onSurface
    }

    val grid: @Composable () -> Unit = {
        LazyVerticalGrid(
            columns = GridCells.Adaptive(minSize = minCellSize),
            contentPadding = PaddingValues(start = 20.dp, end = 20.dp, top = 20.dp, bottom = bottomPadding + 32.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            // Header bar actions (customize icon)
            item(span = { GridItemSpan(maxLineSpan) }) {
                Row(
                    horizontalArrangement = Arrangement.End,
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 4.dp),
                ) {
                    if (!isPrivate) {
                        IconButton(onClick = { showCustomizeSheet = true }) {
                            Icon(
                                Icons.Outlined.Tune,
                                contentDescription = stringResource(R.string.customize_new_tab),
                                tint = contentColor.copy(alpha = 0.72f),
                            )
                        }
                    }
                }
            }

            // Header Style
            item(span = { GridItemSpan(maxLineSpan) }) {
                if (isPrivate) {
                    PrivateHeader()
                } else {
                    when (config.headerStyle) {
                        HeaderStyle.LogoGreeting -> LogoHeader(config.customGreeting)
                        HeaderStyle.ClockDate -> ClockHeader()
                        HeaderStyle.Minimal -> MinimalHeader()
                        HeaderStyle.Hidden -> Spacer(Modifier.height(12.dp))
                    }
                }
            }

            // On-page Search Box
            if (!isPrivate && config.showSearchBar) {
                item(span = { GridItemSpan(maxLineSpan) }) {
                    StartSearchBar(onClick = onOpenSearch)
                }
            }

            // Quick Access Chips
            if (!isPrivate && config.showQuickAccess) {
                item(span = { GridItemSpan(maxLineSpan) }) {
                    QuickAccessRow(
                        onBookmarks = { onNavigate(Screen.Bookmarks) },
                        onHistory = { onNavigate(Screen.History) },
                        onDownloads = { onNavigate(Screen.Downloads) },
                        onCustomize = { showCustomizeSheet = true },
                    )
                }
            }

            // Updates & Notices
            if (!isPrivate && config.showNotices && notices.isNotEmpty()) {
                items(notices, key = { "n" + it.id }, span = { GridItemSpan(maxLineSpan) }) { notice ->
                    NoticeCard(
                        notice = notice,
                        onOpen = { notice.url?.let(onOpen) },
                        onDismiss = { container.live.dismiss(notice.id) },
                    )
                }
            }

            // Pinned Shortcuts
            if (!isPrivate && config.showShortcuts) {
                item(span = { GridItemSpan(maxLineSpan) }) {
                    SectionHeader(
                        title = stringResource(R.string.newtab_section_shortcuts),
                        actionIcon = Icons.Outlined.Add,
                        actionDescription = stringResource(R.string.newtab_add_shortcut),
                        onAction = { addingShortcut = true },
                    )
                }
                items(shortcuts, key = { "s" + it.id }) { shortcut ->
                    ShortcutTile(
                        shortcut = shortcut,
                        shapeStyle = config.tileShapeStyle,
                        iconSize = tileIconSize,
                        showLabel = config.showTileLabels,
                        onClick = { onOpen(shortcut.url) },
                        onLongClick = { shortcutActionTarget = shortcut },
                    )
                }
                item {
                    AddShortcutTile(
                        shapeStyle = config.tileShapeStyle,
                        iconSize = tileIconSize,
                        showLabel = config.showTileLabels,
                        onClick = { addingShortcut = true },
                    )
                }
            }

            // Most Visited / Frequent Sites
            if (!isPrivate && config.showFrequent && sites.isNotEmpty()) {
                item(span = { GridItemSpan(maxLineSpan) }) {
                    SectionTitle(stringResource(R.string.start_frequent))
                }
                items(sites, key = { "f" + it.url }) { site ->
                    SiteTile(
                        site = site,
                        shapeStyle = config.tileShapeStyle,
                        iconSize = tileIconSize,
                        showLabel = config.showTileLabels,
                        onClick = { onOpen(site.url) },
                        onLongClick = { frequentActionTarget = site },
                    )
                }
            }

            // Bookmarks
            if (!isPrivate && config.showBookmarks && marks.isNotEmpty()) {
                item(span = { GridItemSpan(maxLineSpan) }) {
                    SectionTitle(stringResource(R.string.start_bookmarks))
                }
                items(marks, key = { "b" + it.url }) { site ->
                    SiteTile(
                        site = site,
                        shapeStyle = config.tileShapeStyle,
                        iconSize = tileIconSize,
                        showLabel = config.showTileLabels,
                        onClick = { onOpen(site.url) },
                        onLongClick = {},
                    )
                }
            }
        }
    }

    Box(Modifier.fillMaxSize()) {
        // Wallpaper / Ambience background layer
        if (wallpaperBitmap != null && !isPrivate) {
            Image(
                bitmap = wallpaperBitmap!!,
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .fillMaxSize()
                    .then(
                        if (config.wallpaperBlurDp > 0.01f && Build.VERSION.SDK_INT >= 31) {
                            Modifier.blur(config.wallpaperBlurDp.dp)
                        } else {
                            Modifier
                        }
                    ),
            )
            if (config.wallpaperDim > 0.01f) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Color.Black.copy(alpha = config.wallpaperDim)),
                )
            }
        } else if (presetColors != null && !isPrivate) {
            GlassAmbientCanvas(
                accentColor = presetColors.first,
                secondaryColor = presetColors.second,
            )
        } else if (glass) {
            GlassAmbientCanvas(
                accentColor = if (isPrivate) MaterialTheme.colorScheme.tertiary else MaterialTheme.colorScheme.primary,
                secondaryColor = if (isPrivate) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.secondary,
            )
        } else {
            Surface(color = MaterialTheme.colorScheme.surface, modifier = Modifier.fillMaxSize()) {}
        }

        CompositionLocalProvider(LocalContentColor provides contentColor) {
            grid()
        }
    }

    // Shortcut actions dialog
    shortcutActionTarget?.let { target ->
        AlertDialog(
            onDismissRequest = { shortcutActionTarget = null },
            title = { Text(target.title) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    TextButton(
                        onClick = {
                            shortcutActionTarget = null
                            editingShortcut = target
                        },
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                            Icon(Icons.Outlined.Edit, null, Modifier.size(18.dp))
                            Spacer(Modifier.width(12.dp))
                            Text(stringResource(R.string.newtab_edit_shortcut))
                        }
                    }
                    TextButton(
                        onClick = {
                            container.newTab.moveShortcut(target.id, -1)
                            shortcutActionTarget = null
                        },
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                            Icon(Icons.Outlined.ArrowUpward, null, Modifier.size(18.dp))
                            Spacer(Modifier.width(12.dp))
                            Text(stringResource(R.string.newtab_move_left))
                        }
                    }
                    TextButton(
                        onClick = {
                            container.newTab.moveShortcut(target.id, 1)
                            shortcutActionTarget = null
                        },
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                            Icon(Icons.Outlined.ArrowDownward, null, Modifier.size(18.dp))
                            Spacer(Modifier.width(12.dp))
                            Text(stringResource(R.string.newtab_move_right))
                        }
                    }
                    TextButton(
                        onClick = {
                            container.newTab.removeShortcut(target.id)
                            shortcutActionTarget = null
                        },
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                            Icon(Icons.Outlined.Delete, null, Modifier.size(18.dp), tint = MaterialTheme.colorScheme.error)
                            Spacer(Modifier.width(12.dp))
                            Text(stringResource(R.string.newtab_delete_shortcut), color = MaterialTheme.colorScheme.error)
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { shortcutActionTarget = null }) {
                    Text(stringResource(R.string.cancel))
                }
            },
        )
    }

    // Frequent site actions dialog
    frequentActionTarget?.let { target ->
        AlertDialog(
            onDismissRequest = { frequentActionTarget = null },
            title = { Text(target.title.ifBlank { InputResolver.host(target.url) }) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    TextButton(
                        onClick = {
                            container.newTab.addShortcut(target.title.ifBlank { InputResolver.host(target.url) }, target.url)
                            frequentActionTarget = null
                        },
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                            Icon(Icons.Outlined.PushPin, null, Modifier.size(18.dp))
                            Spacer(Modifier.width(12.dp))
                            Text(stringResource(R.string.newtab_pin_frequent))
                        }
                    }
                    TextButton(
                        onClick = {
                            container.newTab.hideFrequent(target.url)
                            frequentActionTarget = null
                        },
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                            Icon(Icons.Outlined.VisibilityOff, null, Modifier.size(18.dp))
                            Spacer(Modifier.width(12.dp))
                            Text(stringResource(R.string.newtab_hide_frequent))
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { frequentActionTarget = null }) {
                    Text(stringResource(R.string.cancel))
                }
            },
        )
    }

    // Add shortcut dialog
    if (addingShortcut) {
        ShortcutDialog(
            title = stringResource(R.string.newtab_add_shortcut),
            initialTitle = "",
            initialUrl = "",
            onConfirm = { name, url ->
                container.newTab.addShortcut(name, url)
                addingShortcut = false
            },
            onDismiss = { addingShortcut = false },
        )
    }

    // Edit shortcut dialog
    editingShortcut?.let { shortcut ->
        ShortcutDialog(
            title = stringResource(R.string.newtab_edit_shortcut),
            initialTitle = shortcut.title,
            initialUrl = shortcut.url,
            onConfirm = { name, url ->
                container.newTab.editShortcut(shortcut.id, name, url)
                editingShortcut = null
            },
            onDismiss = { editingShortcut = null },
        )
    }

    // Customize sheet
    if (showCustomizeSheet) {
        CustomizeNewTabSheet(
            container = container,
            onDismiss = { showCustomizeSheet = false },
        )
    }
}

@Composable
private fun StartSearchBar(onClick: () -> Unit) {
    val glass = isLiquidGlassActive()
    val shape = CircleShape
    val content: @Composable () -> Unit = {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 18.dp, vertical = 12.dp),
        ) {
            Icon(
                Icons.Outlined.Search,
                contentDescription = null,
                tint = if (glass) glassContentColor().copy(alpha = 0.72f) else MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(20.dp),
            )
            Spacer(Modifier.width(12.dp))
            Text(
                stringResource(R.string.address_placeholder),
                style = MaterialTheme.typography.bodyMedium,
                color = if (glass) glassContentColor().copy(alpha = 0.72f) else MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.weight(1f),
            )
        }
    }

    if (glass) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 4.dp, vertical = 4.dp)
                .lightweightLiquidGlass(shape, MaterialTheme.colorScheme.surfaceContainerHigh)
                .clickable(onClick = onClick),
        ) {
            content()
        }
    } else {
        Surface(
            shape = shape,
            color = MaterialTheme.colorScheme.surfaceContainerHigh,
            tonalElevation = 2.dp,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 4.dp, vertical = 4.dp)
                .clip(shape)
                .clickable(onClick = onClick),
        ) {
            content()
        }
    }
}

@Composable
private fun QuickAccessRow(
    onBookmarks: () -> Unit,
    onHistory: () -> Unit,
    onDownloads: () -> Unit,
    onCustomize: () -> Unit,
) {
    val glass = isLiquidGlassActive()
    Row(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState())
            .padding(vertical = 4.dp),
    ) {
        QuickAccessChip(Icons.Outlined.BookmarkBorder, stringResource(R.string.bookmarks), glass, onBookmarks)
        QuickAccessChip(Icons.Outlined.History, stringResource(R.string.history), glass, onHistory)
        QuickAccessChip(Icons.Outlined.Download, stringResource(R.string.downloads), glass, onDownloads)
        QuickAccessChip(Icons.Outlined.Tune, stringResource(R.string.customize_new_tab), glass, onCustomize)
    }
}

@Composable
private fun QuickAccessChip(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    glass: Boolean,
    onClick: () -> Unit,
) {
    val shape = RoundedCornerShape(16.dp)
    val content: @Composable () -> Unit = {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
        ) {
            Icon(
                icon,
                contentDescription = null,
                modifier = Modifier.size(16.dp),
                tint = if (glass) glassContentColor() else MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.width(8.dp))
            Text(
                label,
                style = MaterialTheme.typography.labelMedium,
                color = if (glass) glassContentColor() else MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }

    if (glass) {
        Box(
            modifier = Modifier
                .lightweightLiquidGlass(shape, MaterialTheme.colorScheme.surfaceContainer)
                .clickable(onClick = onClick),
        ) {
            content()
        }
    } else {
        Surface(
            shape = shape,
            color = MaterialTheme.colorScheme.surfaceContainer,
            modifier = Modifier
                .clip(shape)
                .clickable(onClick = onClick),
        ) {
            content()
        }
    }
}

@Composable
private fun NoticeCard(notice: Notice, onOpen: () -> Unit, onDismiss: () -> Unit) {
    val glass = isLiquidGlassActive()
    val shape = RoundedCornerShape(24.dp)
    val content: @Composable () -> Unit = {
        Row(verticalAlignment = Alignment.Top, modifier = Modifier.padding(start = 20.dp, top = 8.dp, end = 4.dp, bottom = 16.dp)) {
            Column(Modifier.weight(1f).padding(top = 8.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    if (notice.id.startsWith("apk-")) {
                        Icon(Icons.Outlined.SystemUpdate, null, Modifier.size(20.dp).padding(end = 4.dp))
                    }
                    Text(notice.title.get(), style = MaterialTheme.typography.titleMedium)
                }
                notice.body?.let {
                    Spacer(Modifier.height(4.dp))
                    Text(it.get(), style = MaterialTheme.typography.bodyMedium)
                }
            }
            IconButton(onClick = onDismiss) {
                Icon(Icons.Outlined.Close, contentDescription = stringResource(R.string.close))
            }
        }
    }

    if (glass) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .lightweightLiquidGlass(shape, MaterialTheme.colorScheme.secondaryContainer)
                .then(if (notice.url != null) Modifier.clickable(onClick = onOpen) else Modifier),
        ) {
            CompositionLocalProvider(LocalContentColor provides glassContentColor()) {
                content()
            }
        }
    } else {
        Surface(
            shape = shape,
            color = MaterialTheme.colorScheme.secondaryContainer,
            modifier = Modifier
                .fillMaxWidth()
                .clip(shape)
                .then(if (notice.url != null) Modifier.clickable(onClick = onOpen) else Modifier),
        ) {
            content()
        }
    }
}

@Composable
private fun LogoHeader(greeting: String) {
    val shape = MaterialShapes.Cookie9Sided.toShape()
    val displayText = if (greeting.isNotBlank()) greeting else stringResource(R.string.start_greeting)
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.fillMaxWidth().padding(top = 16.dp, bottom = 16.dp),
    ) {
        Surface(
            shape = shape,
            color = MaterialTheme.colorScheme.primaryContainer,
            modifier = Modifier.size(80.dp).liquidGlassRim(shape),
        ) {
            Box(contentAlignment = Alignment.Center) {
                Image(
                    painterResource(R.drawable.ic_hilal_logo),
                    contentDescription = null,
                    modifier = Modifier.size(50.dp),
                )
            }
        }
        Spacer(Modifier.height(16.dp))
        Text(
            displayText,
            style = MaterialTheme.typography.headlineMediumEmphasized,
            color = if (isLiquidGlassActive()) glassContentColor() else MaterialTheme.colorScheme.onSurface,
            textAlign = TextAlign.Center,
        )
    }
}

@Composable
private fun ClockHeader() {
    var currentTime by remember { mutableStateOf(Calendar.getInstance()) }
    LaunchedEffect(Unit) {
        while (true) {
            currentTime = Calendar.getInstance()
            val millisUntilNextMinute = 60000L - (System.currentTimeMillis() % 60000L)
            delay(millisUntilNextMinute.coerceAtLeast(1000L))
        }
    }
    val timeFormat = remember { SimpleDateFormat("HH:mm", Locale.getDefault()) }
    val dateFormat = remember { SimpleDateFormat("EEEE, d MMMM", Locale.getDefault()) }

    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.fillMaxWidth().padding(top = 24.dp, bottom = 16.dp),
    ) {
        Text(
            timeFormat.format(currentTime.time),
            style = MaterialTheme.typography.displayLarge.copy(fontWeight = FontWeight.Bold),
            color = if (isLiquidGlassActive()) glassContentColor() else MaterialTheme.colorScheme.onSurface,
            textAlign = TextAlign.Center,
        )
        Spacer(Modifier.height(4.dp))
        Text(
            dateFormat.format(currentTime.time),
            style = MaterialTheme.typography.titleMedium,
            color = if (isLiquidGlassActive()) glassContentColor().copy(alpha = 0.8f) else MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
        )
    }
}

@Composable
private fun MinimalHeader() {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center,
        modifier = Modifier.fillMaxWidth().padding(top = 12.dp, bottom = 8.dp),
    ) {
        Image(
            painterResource(R.drawable.ic_hilal_logo),
            contentDescription = null,
            modifier = Modifier.size(28.dp),
        )
    }
}

@Composable
private fun PrivateHeader() {
    val shape = MaterialShapes.Ghostish.toShape()
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.fillMaxWidth().padding(top = 24.dp, bottom = 20.dp, start = 8.dp, end = 8.dp),
    ) {
        Surface(
            shape = shape,
            color = MaterialTheme.colorScheme.tertiaryContainer,
            modifier = Modifier.size(80.dp).liquidGlassRim(shape),
        ) {
            Box(contentAlignment = Alignment.Center) {
                Icon(
                    Icons.Outlined.VisibilityOff,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.onTertiaryContainer,
                    modifier = Modifier.size(36.dp),
                )
            }
        }
        Spacer(Modifier.height(16.dp))
        Text(
            stringResource(R.string.start_private_title),
            style = MaterialTheme.typography.headlineMediumEmphasized,
        )
        Spacer(Modifier.height(8.dp))
        Text(
            stringResource(R.string.start_private_body),
            style = MaterialTheme.typography.bodyMedium,
            color = if (isLiquidGlassActive()) glassContentColor().copy(alpha = 0.72f) else MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
        )
    }
}

@Composable
private fun SectionTitle(text: String) {
    Text(
        text,
        style = MaterialTheme.typography.titleSmall,
        color = MaterialTheme.colorScheme.primary,
        modifier = Modifier.padding(start = 4.dp, top = 8.dp),
    )
}

@Composable
private fun SectionHeader(
    title: String,
    actionIcon: androidx.compose.ui.graphics.vector.ImageVector,
    actionDescription: String,
    onAction: () -> Unit,
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween,
        modifier = Modifier.fillMaxWidth().padding(start = 4.dp, end = 4.dp, top = 8.dp),
    ) {
        Text(
            title,
            style = MaterialTheme.typography.titleSmall,
            color = MaterialTheme.colorScheme.primary,
        )
        IconButton(onClick = onAction, modifier = Modifier.size(28.dp)) {
            Icon(actionIcon, contentDescription = actionDescription, Modifier.size(18.dp), tint = MaterialTheme.colorScheme.primary)
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun ShortcutTile(
    shortcut: PinnedShortcut,
    shapeStyle: TileShapeStyle,
    iconSize: Dp,
    showLabel: Boolean,
    onClick: () -> Unit,
    onLongClick: () -> Unit,
) {
    val host = InputResolver.host(shortcut.url)
    val glass = isLiquidGlassActive()
    val shape = resolveTileShape(shapeStyle, host)

    if (glass) {
        val interaction = remember { MutableInteractionSource() }
        val pressed by interaction.collectIsPressedAsState()
        val scale by animateFloatAsState(
            targetValue = if (pressed) 0.94f else 1f,
            animationSpec = GlassSpring,
            label = "shortcutTileScale",
        )
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier
                .graphicsLayer {
                    scaleX = scale
                    scaleY = scale
                }
                .lightweightLiquidGlass(
                    shape = RoundedCornerShape(20.dp),
                    fallbackColor = MaterialTheme.colorScheme.surfaceContainerHigh,
                )
                .combinedClickable(
                    interactionSource = interaction,
                    indication = null,
                    onClick = onClick,
                    onLongClick = onLongClick,
                )
                .padding(horizontal = 4.dp, vertical = 10.dp),
        ) {
            Monogram(host, Modifier.size(iconSize), shape)
            if (showLabel) {
                Spacer(Modifier.height(8.dp))
                Text(
                    shortcut.title.ifBlank { host },
                    style = MaterialTheme.typography.labelMedium,
                    color = glassContentColor(),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.width(iconSize + 20.dp),
                    textAlign = TextAlign.Center,
                )
            }
        }
    } else {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier
                .clip(RoundedCornerShape(20.dp))
                .combinedClickable(
                    onClick = onClick,
                    onLongClick = onLongClick,
                )
                .padding(vertical = 8.dp),
        ) {
            Monogram(host, Modifier.size(iconSize), shape)
            if (showLabel) {
                Spacer(Modifier.height(8.dp))
                Text(
                    shortcut.title.ifBlank { host },
                    style = MaterialTheme.typography.labelMedium,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.width(iconSize + 20.dp),
                    textAlign = TextAlign.Center,
                )
            }
        }
    }
}

@Composable
private fun AddShortcutTile(
    shapeStyle: TileShapeStyle,
    iconSize: Dp,
    showLabel: Boolean,
    onClick: () -> Unit,
) {
    val glass = isLiquidGlassActive()
    val shape = resolveTileShape(shapeStyle, "+")

    val tileContent: @Composable () -> Unit = {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(horizontal = 4.dp, vertical = if (glass) 10.dp else 8.dp),
        ) {
            Surface(
                shape = shape,
                color = MaterialTheme.colorScheme.surfaceContainerHighest,
                modifier = Modifier
                    .size(iconSize)
                    .border(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f), shape),
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        Icons.Outlined.Add,
                        contentDescription = stringResource(R.string.newtab_add_shortcut),
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(24.dp),
                    )
                }
            }
            if (showLabel) {
                Spacer(Modifier.height(8.dp))
                Text(
                    stringResource(R.string.newtab_add_shortcut),
                    style = MaterialTheme.typography.labelMedium,
                    color = if (glass) glassContentColor().copy(alpha = 0.72f) else MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.width(iconSize + 20.dp),
                    textAlign = TextAlign.Center,
                )
            }
        }
    }

    if (glass) {
        val interaction = remember { MutableInteractionSource() }
        val pressed by interaction.collectIsPressedAsState()
        val scale by animateFloatAsState(
            targetValue = if (pressed) 0.94f else 1f,
            animationSpec = GlassSpring,
            label = "addTileScale",
        )
        Box(
            modifier = Modifier
                .graphicsLayer {
                    scaleX = scale
                    scaleY = scale
                }
                .lightweightLiquidGlass(
                    shape = RoundedCornerShape(20.dp),
                    fallbackColor = MaterialTheme.colorScheme.surfaceContainerHigh,
                )
                .clickable(interactionSource = interaction, indication = null, onClick = onClick),
        ) {
            tileContent()
        }
    } else {
        Box(
            modifier = Modifier
                .clip(RoundedCornerShape(20.dp))
                .clickable(onClick = onClick),
        ) {
            tileContent()
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun SiteTile(
    site: Site,
    shapeStyle: TileShapeStyle,
    iconSize: Dp,
    showLabel: Boolean,
    onClick: () -> Unit,
    onLongClick: () -> Unit,
) {
    val host = InputResolver.host(site.url)
    val glass = isLiquidGlassActive()
    val shape = resolveTileShape(shapeStyle, host)

    if (glass) {
        val interaction = remember { MutableInteractionSource() }
        val pressed by interaction.collectIsPressedAsState()
        val scale by animateFloatAsState(
            targetValue = if (pressed) 0.94f else 1f,
            animationSpec = GlassSpring,
            label = "siteTileScale",
        )
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier
                .graphicsLayer {
                    scaleX = scale
                    scaleY = scale
                }
                .lightweightLiquidGlass(
                    shape = RoundedCornerShape(20.dp),
                    fallbackColor = MaterialTheme.colorScheme.surfaceContainerHigh,
                )
                .combinedClickable(
                    interactionSource = interaction,
                    indication = null,
                    onClick = onClick,
                    onLongClick = onLongClick,
                )
                .padding(horizontal = 4.dp, vertical = 10.dp),
        ) {
            Monogram(host, Modifier.size(iconSize), shape)
            if (showLabel) {
                Spacer(Modifier.height(8.dp))
                Text(
                    site.title.ifBlank { host },
                    style = MaterialTheme.typography.labelMedium,
                    color = glassContentColor(),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.width(iconSize + 20.dp),
                    textAlign = TextAlign.Center,
                )
            }
        }
    } else {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier
                .clip(RoundedCornerShape(20.dp))
                .combinedClickable(
                    onClick = onClick,
                    onLongClick = onLongClick,
                )
                .padding(vertical = 8.dp),
        ) {
            Monogram(host, Modifier.size(iconSize), shape)
            if (showLabel) {
                Spacer(Modifier.height(8.dp))
                Text(
                    site.title.ifBlank { host },
                    style = MaterialTheme.typography.labelMedium,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.width(iconSize + 20.dp),
                    textAlign = TextAlign.Center,
                )
            }
        }
    }
}

@Composable
private fun resolveTileShape(shapeStyle: TileShapeStyle, host: String): Shape = when (shapeStyle) {
    TileShapeStyle.Expressive -> {
        val expressiveShapes = listOf(
            MaterialShapes.Cookie6Sided,
            MaterialShapes.Clover4Leaf,
            MaterialShapes.Sunny,
            MaterialShapes.Pill,
            MaterialShapes.Cookie4Sided,
            MaterialShapes.Arch,
        )
        val hash = host.hashCode().let { if (it < 0) -it else it }
        expressiveShapes[hash % expressiveShapes.size].toShape()
    }
    TileShapeStyle.RoundedSquare -> RoundedCornerShape(18.dp)
    TileShapeStyle.Circle -> CircleShape
}

/** A letter on a tinted shape, stable per host, so sites are recognizable without fetching icons. */
@Composable
fun Monogram(
    host: String,
    modifier: Modifier = Modifier,
    shape: Shape = MaterialShapes.Cookie6Sided.toShape(),
) {
    val palette = listOf(
        MaterialTheme.colorScheme.primaryContainer to MaterialTheme.colorScheme.onPrimaryContainer,
        MaterialTheme.colorScheme.secondaryContainer to MaterialTheme.colorScheme.onSecondaryContainer,
        MaterialTheme.colorScheme.tertiaryContainer to MaterialTheme.colorScheme.onTertiaryContainer,
    )
    val hash = host.hashCode().let { if (it < 0) -it else it }
    val (bg, fg) = palette[hash % palette.size]
    Surface(shape = shape, color = bg, modifier = modifier) {
        Box(contentAlignment = Alignment.Center) {
            Text(
                host.firstOrNull { it.isLetterOrDigit() }?.uppercase() ?: "•",
                style = MaterialTheme.typography.titleLarge,
                color = fg,
            )
        }
    }
}
