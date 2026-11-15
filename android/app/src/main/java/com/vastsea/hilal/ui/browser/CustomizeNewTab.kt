package com.vastsea.hilal.ui.browser

import android.graphics.Bitmap
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.ArrowDownward
import androidx.compose.material.icons.outlined.ArrowUpward
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material.icons.outlined.Image
import androidx.compose.material.icons.outlined.Palette
import androidx.compose.material.icons.outlined.RestartAlt
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonGroupDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ListItem
import androidx.compose.material3.ListItemDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Slider
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.ToggleButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.vastsea.hilal.AppContainer
import com.vastsea.hilal.R
import com.vastsea.hilal.data.AmbientPreset
import com.vastsea.hilal.data.HeaderStyle
import com.vastsea.hilal.data.NewTabConfig
import com.vastsea.hilal.data.PinnedShortcut
import com.vastsea.hilal.data.TileShapeStyle
import com.vastsea.hilal.data.TileSize
import com.vastsea.hilal.ui.glass.GlassBottomDrawer
import com.vastsea.hilal.ui.glass.GlassSegmentedControl
import com.vastsea.hilal.ui.glass.glassContentColor
import com.vastsea.hilal.ui.glass.isLiquidGlassActive
import com.vastsea.hilal.ui.glass.lightweightLiquidGlass
import com.vastsea.hilal.ui.library.LibraryScaffold
import kotlinx.coroutines.launch
import kotlin.math.roundToInt

@Composable
fun CustomizeNewTabScreen(container: AppContainer, onBack: () -> Unit) {
    LibraryScaffold(
        title = stringResource(R.string.customize_new_tab),
        onBack = onBack,
    ) { padding ->
        CustomizeNewTabBody(
            container = container,
            contentPadding = padding,
        )
    }
}

@Composable
fun CustomizeNewTabSheet(container: AppContainer, onDismiss: () -> Unit) {
    val glass = isLiquidGlassActive()
    val title = stringResource(R.string.customize_new_tab)

    if (glass) {
        GlassBottomDrawer(
            onDismiss = onDismiss,
            title = title,
        ) {
            CustomizeNewTabBody(
                container = container,
                contentPadding = PaddingValues(bottom = 24.dp),
                isInsideDrawer = true,
            )
        }
    } else {
        val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
        ModalBottomSheet(
            onDismissRequest = onDismiss,
            sheetState = sheetState,
        ) {
            Column(Modifier.fillMaxWidth().navigationBarsPadding()) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp, vertical = 8.dp),
                ) {
                    Text(title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Spacer(Modifier.weight(1f))
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Outlined.Close, contentDescription = stringResource(R.string.close))
                    }
                }
                CustomizeNewTabBody(
                    container = container,
                    contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 24.dp),
                    isInsideDrawer = true,
                )
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun CustomizeNewTabBody(
    container: AppContainer,
    contentPadding: PaddingValues,
    isInsideDrawer: Boolean = false,
) {
    val repo = container.newTab
    val config by repo.config.collectAsState()
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val glass = isLiquidGlassActive()

    var editingShortcut by remember { mutableStateOf<PinnedShortcut?>(null) }
    var addingShortcut by remember { mutableStateOf(false) }
    var wallpaperBitmap by remember(config.customWallpaperPath) {
        mutableStateOf(repo.loadCustomWallpaperBitmap())
    }

    val imagePicker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
        if (uri != null) {
            scope.launch {
                context.contentResolver.openInputStream(uri)?.use { stream ->
                    repo.setCustomWallpaper(stream)
                    wallpaperBitmap = repo.loadCustomWallpaperBitmap()
                }
            }
        }
    }

    @Composable
    fun HeaderSection() {
        SectionHeader(stringResource(R.string.newtab_header_style))
        val headerLabels = listOf(
            stringResource(R.string.newtab_header_logo),
            stringResource(R.string.newtab_header_clock),
            stringResource(R.string.newtab_header_minimal),
            stringResource(R.string.newtab_header_hidden),
        )
        HeaderSegmented(
            labels = headerLabels,
            selectedIndex = config.headerStyle.ordinal,
            onSelect = { index ->
                repo.update { it.copy(headerStyle = HeaderStyle.entries[index]) }
            },
            glass = glass,
        )

        if (config.headerStyle == HeaderStyle.LogoGreeting) {
            Spacer(Modifier.height(10.dp))
            OutlinedTextField(
                value = config.customGreeting,
                onValueChange = { repo.update { c -> c.copy(customGreeting = it.take(60)) } },
                label = { Text(stringResource(R.string.newtab_custom_greeting)) },
                placeholder = { Text(stringResource(R.string.newtab_custom_greeting_hint)) },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }

    @Composable
    fun WallpaperSection() {
        SectionHeader(stringResource(R.string.newtab_wallpaper))

        // Ambient preset chips
        Text(
            stringResource(R.string.newtab_ambient),
            style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.height(6.dp))
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxWidth(),
        ) {
            AmbientPreset.entries.forEach { preset ->
                val selected = config.ambientPreset == preset
                FilterChip(
                    selected = selected,
                    onClick = { repo.update { it.copy(ambientPreset = preset) } },
                    label = { Text(ambientPresetLabel(preset)) },
                )
            }
        }

        Spacer(Modifier.height(14.dp))
        Text(
            stringResource(R.string.newtab_wallpaper_custom),
            style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.height(6.dp))

        Row(verticalAlignment = Alignment.CenterVertically) {
            if (wallpaperBitmap != null) {
                Box(
                    modifier = Modifier
                        .size(width = 64.dp, height = 48.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(8.dp)),
                ) {
                    Image(
                        bitmap = wallpaperBitmap!!.asImageBitmap(),
                        contentDescription = null,
                        modifier = Modifier.fillMaxSize(),
                    )
                }
                Spacer(Modifier.width(12.dp))
                OutlinedButton(onClick = { imagePicker.launch("image/*") }) {
                    Text(stringResource(R.string.newtab_wallpaper_pick))
                }
                Spacer(Modifier.width(8.dp))
                TextButton(onClick = {
                    repo.clearCustomWallpaper()
                    wallpaperBitmap = null
                }) {
                    Text(stringResource(R.string.newtab_wallpaper_remove), color = MaterialTheme.colorScheme.error)
                }
            } else {
                OutlinedButton(onClick = { imagePicker.launch("image/*") }) {
                    Icon(Icons.Outlined.Image, null, Modifier.size(18.dp))
                    Spacer(Modifier.width(8.dp))
                    Text(stringResource(R.string.newtab_wallpaper_pick))
                }
            }
        }

        // Dim slider
        Spacer(Modifier.height(8.dp))
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text(stringResource(R.string.newtab_wallpaper_dim), style = MaterialTheme.typography.bodyMedium)
            Text("${(config.wallpaperDim * 100).roundToInt()}%", style = MaterialTheme.typography.labelMedium)
        }
        Slider(
            value = config.wallpaperDim,
            onValueChange = { repo.update { c -> c.copy(wallpaperDim = it) } },
            valueRange = 0f..0.85f,
        )

        // Blur slider
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text(stringResource(R.string.newtab_wallpaper_blur), style = MaterialTheme.typography.bodyMedium)
            Text("${config.wallpaperBlurDp.roundToInt()} dp", style = MaterialTheme.typography.labelMedium)
        }
        Slider(
            value = config.wallpaperBlurDp,
            onValueChange = { repo.update { c -> c.copy(wallpaperBlurDp = it) } },
            valueRange = 0f..30f,
        )
    }

    @Composable
    fun SectionsToggleSection() {
        SectionHeader(stringResource(R.string.newtab_sections))
        ToggleRow(
            title = stringResource(R.string.newtab_section_shortcuts),
            checked = config.showShortcuts,
            onChange = { repo.update { c -> c.copy(showShortcuts = it) } },
        )
        ToggleRow(
            title = stringResource(R.string.newtab_section_frequent),
            checked = config.showFrequent,
            onChange = { repo.update { c -> c.copy(showFrequent = it) } },
        )
        ToggleRow(
            title = stringResource(R.string.newtab_section_bookmarks),
            checked = config.showBookmarks,
            onChange = { repo.update { c -> c.copy(showBookmarks = it) } },
        )
        ToggleRow(
            title = stringResource(R.string.newtab_section_quick_access),
            checked = config.showQuickAccess,
            onChange = { repo.update { c -> c.copy(showQuickAccess = it) } },
        )
        ToggleRow(
            title = stringResource(R.string.newtab_section_search),
            checked = config.showSearchBar,
            onChange = { repo.update { c -> c.copy(showSearchBar = it) } },
        )
        ToggleRow(
            title = stringResource(R.string.newtab_section_notices),
            checked = config.showNotices,
            onChange = { repo.update { c -> c.copy(showNotices = it) } },
        )

        if (config.hiddenFrequentUrls.isNotEmpty()) {
            Spacer(Modifier.height(6.dp))
            OutlinedButton(
                onClick = { repo.unhideAllFrequent() },
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text(stringResource(R.string.newtab_unhide_frequent_all))
            }
        }
    }

    @Composable
    fun TileAppearanceSection() {
        SectionHeader(stringResource(R.string.newtab_tiles))

        Text(
            stringResource(R.string.newtab_tile_shape),
            style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.height(6.dp))
        val shapeLabels = listOf(
            stringResource(R.string.newtab_shape_expressive),
            stringResource(R.string.newtab_shape_rounded_square),
            stringResource(R.string.newtab_shape_circle),
        )
        HeaderSegmented(
            labels = shapeLabels,
            selectedIndex = config.tileShapeStyle.ordinal,
            onSelect = { index ->
                repo.update { it.copy(tileShapeStyle = TileShapeStyle.entries[index]) }
            },
            glass = glass,
        )

        Spacer(Modifier.height(14.dp))
        Text(
            stringResource(R.string.newtab_tile_size),
            style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.height(6.dp))
        val sizeLabels = listOf(
            stringResource(R.string.newtab_size_compact),
            stringResource(R.string.newtab_size_medium),
            stringResource(R.string.newtab_size_large),
        )
        HeaderSegmented(
            labels = sizeLabels,
            selectedIndex = config.tileSize.ordinal,
            onSelect = { index ->
                repo.update { it.copy(tileSize = TileSize.entries[index]) }
            },
            glass = glass,
        )

        Spacer(Modifier.height(10.dp))
        ToggleRow(
            title = stringResource(R.string.newtab_show_labels),
            checked = config.showTileLabels,
            onChange = { repo.update { c -> c.copy(showTileLabels = it) } },
        )
    }

    @Composable
    fun PinnedShortcutsSection() {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier.fillMaxWidth(),
        ) {
            SectionHeader(stringResource(R.string.newtab_section_shortcuts))
            TextButton(onClick = { addingShortcut = true }) {
                Icon(Icons.Outlined.Add, null, Modifier.size(18.dp))
                Spacer(Modifier.width(4.dp))
                Text(stringResource(R.string.newtab_add_shortcut))
            }
        }
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            config.pinnedShortcuts.forEachIndexed { index, shortcut ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerHigh),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 14.dp, vertical = 8.dp),
                    ) {
                        Column(Modifier.weight(1f)) {
                            Text(shortcut.title, style = MaterialTheme.typography.titleMedium, maxLines = 1, overflow = TextOverflow.Ellipsis)
                            Text(shortcut.url, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 1, overflow = TextOverflow.Ellipsis)
                        }
                        if (index > 0) {
                            IconButton(onClick = { repo.moveShortcut(shortcut.id, -1) }, modifier = Modifier.size(36.dp)) {
                                Icon(Icons.Outlined.ArrowUpward, stringResource(R.string.newtab_move_left), Modifier.size(18.dp))
                            }
                        }
                        if (index < config.pinnedShortcuts.lastIndex) {
                            IconButton(onClick = { repo.moveShortcut(shortcut.id, 1) }, modifier = Modifier.size(36.dp)) {
                                Icon(Icons.Outlined.ArrowDownward, stringResource(R.string.newtab_move_right), Modifier.size(18.dp))
                            }
                        }
                        IconButton(onClick = { editingShortcut = shortcut }, modifier = Modifier.size(36.dp)) {
                            Icon(Icons.Outlined.Edit, stringResource(R.string.newtab_edit_shortcut), Modifier.size(18.dp))
                        }
                        IconButton(onClick = { repo.removeShortcut(shortcut.id) }, modifier = Modifier.size(36.dp)) {
                            Icon(Icons.Outlined.Delete, stringResource(R.string.newtab_delete_shortcut), Modifier.size(18.dp), tint = MaterialTheme.colorScheme.error)
                        }
                    }
                }
            }
        }
    }

    @Composable
    fun ResetSection() {
        Spacer(Modifier.height(8.dp))
        OutlinedButton(
            onClick = {
                repo.resetToDefaults()
                wallpaperBitmap = null
            },
            modifier = Modifier.fillMaxWidth(),
        ) {
            Icon(Icons.Outlined.RestartAlt, null, Modifier.size(18.dp))
            Spacer(Modifier.width(8.dp))
            Text(stringResource(R.string.newtab_reset_defaults))
        }
    }

    if (isInsideDrawer) {
        val scrollMod = if (glass) Modifier else Modifier.verticalScroll(rememberScrollState())
        Column(
            verticalArrangement = Arrangement.spacedBy(16.dp),
            modifier = Modifier
                .fillMaxWidth()
                .padding(contentPadding)
                .then(scrollMod),
        ) {
            HeaderSection()
            WallpaperSection()
            SectionsToggleSection()
            TileAppearanceSection()
            PinnedShortcutsSection()
            ResetSection()
        }
    } else {
        LazyColumn(
            contentPadding = contentPadding,
            verticalArrangement = Arrangement.spacedBy(16.dp),
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
        ) {
            item { HeaderSection() }
            item { WallpaperSection() }
            item { SectionsToggleSection() }
            item { TileAppearanceSection() }
            item { PinnedShortcutsSection() }
            item { ResetSection() }
        }
    }

    if (addingShortcut) {
        ShortcutDialog(
            title = stringResource(R.string.newtab_add_shortcut),
            initialTitle = "",
            initialUrl = "",
            onConfirm = { name, url ->
                repo.addShortcut(name, url)
                addingShortcut = false
            },
            onDismiss = { addingShortcut = false },
        )
    }

    editingShortcut?.let { shortcut ->
        ShortcutDialog(
            title = stringResource(R.string.newtab_edit_shortcut),
            initialTitle = shortcut.title,
            initialUrl = shortcut.url,
            onConfirm = { name, url ->
                repo.editShortcut(shortcut.id, name, url)
                editingShortcut = null
            },
            onDismiss = { editingShortcut = null },
        )
    }
}

@Composable
private fun SectionHeader(title: String) {
    Text(
        text = title,
        style = MaterialTheme.typography.titleMedium,
        fontWeight = FontWeight.Bold,
        color = MaterialTheme.colorScheme.primary,
        modifier = Modifier.padding(bottom = 6.dp),
    )
}

@Composable
private fun ToggleRow(title: String, checked: Boolean, onChange: (Boolean) -> Unit) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween,
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .clickable { onChange(!checked) }
            .padding(vertical = 8.dp, horizontal = 4.dp),
    ) {
        Text(title, style = MaterialTheme.typography.bodyLarge)
        Switch(checked = checked, onCheckedChange = onChange)
    }
}

@Composable
private fun HeaderSegmented(
    labels: List<String>,
    selectedIndex: Int,
    onSelect: (Int) -> Unit,
    glass: Boolean,
) {
    if (glass) {
        GlassSegmentedControl(
            items = labels,
            selectedIndex = selectedIndex,
            onSelect = onSelect,
            modifier = Modifier.fillMaxWidth(),
        )
    } else {
        Row(
            horizontalArrangement = Arrangement.spacedBy(ButtonGroupDefaults.ConnectedSpaceBetween),
            modifier = Modifier.fillMaxWidth(),
        ) {
            labels.forEachIndexed { index, label ->
                ToggleButton(
                    checked = selectedIndex == index,
                    onCheckedChange = { onSelect(index) },
                    shapes = when (index) {
                        0 -> ButtonGroupDefaults.connectedLeadingButtonShapes()
                        labels.lastIndex -> ButtonGroupDefaults.connectedTrailingButtonShapes()
                        else -> ButtonGroupDefaults.connectedMiddleButtonShapes()
                    },
                    modifier = Modifier.weight(1f),
                ) {
                    Text(label, maxLines = 1, overflow = TextOverflow.Ellipsis)
                }
            }
        }
    }
}

@Composable
internal fun ShortcutDialog(
    title: String,
    initialTitle: String,
    initialUrl: String,
    onConfirm: (name: String, url: String) -> Unit,
    onDismiss: () -> Unit,
) {
    var name by remember { mutableStateOf(initialTitle) }
    var url by remember { mutableStateOf(initialUrl) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text(stringResource(R.string.newtab_shortcut_name)) },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )
                OutlinedTextField(
                    value = url,
                    onValueChange = { url = it },
                    label = { Text(stringResource(R.string.newtab_shortcut_url)) },
                    singleLine = true,
                    placeholder = { Text("https://example.com") },
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { onConfirm(name.trim(), url.trim()) },
                enabled = url.isNotBlank(),
            ) {
                Text(stringResource(R.string.save))
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text(stringResource(R.string.cancel))
            }
        },
    )
}

@Composable
private fun ambientPresetLabel(preset: AmbientPreset): String = when (preset) {
    AmbientPreset.None -> stringResource(R.string.newtab_ambient_none)
    AmbientPreset.Aurora -> stringResource(R.string.newtab_ambient_aurora)
    AmbientPreset.Dusk -> stringResource(R.string.newtab_ambient_dusk)
    AmbientPreset.Midnight -> stringResource(R.string.newtab_ambient_midnight)
    AmbientPreset.Sunset -> stringResource(R.string.newtab_ambient_sunset)
    AmbientPreset.Emerald -> stringResource(R.string.newtab_ambient_emerald)
    AmbientPreset.CottonCandy -> stringResource(R.string.newtab_ambient_cotton_candy)
}
