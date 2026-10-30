package com.vastsea.hilal.ui.settings

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.layout.heightIn
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.ButtonGroupDefaults
import androidx.compose.material3.ListItemDefaults
import androidx.compose.material3.ListItemShapes
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.RadioButton
import androidx.compose.material3.SegmentedListItem
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.ToggleButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import com.vastsea.hilal.AppContainer
import com.vastsea.hilal.BuildConfig
import com.vastsea.hilal.R
import com.vastsea.hilal.data.ThemeMode
import com.vastsea.hilal.search.SearchEngines
import com.vastsea.hilal.ui.library.LibraryScaffold

private const val SOURCE_URL = "https://github.com/vastsea0/hilal-browser"

@Composable
fun SettingsScreen(container: AppContainer, onBack: () -> Unit, onOpen: (String) -> Unit) {
    val repo = container.settings
    val settings by repo.settings.collectAsState()
    var pickEngine by remember { mutableStateOf(false) }

    LibraryScaffold(title = stringResource(R.string.settings), onBack = onBack) { padding ->
        LazyColumn(
            contentPadding = PaddingValues(start = 12.dp, end = 12.dp, top = padding.calculateTopPadding(), bottom = padding.calculateBottomPadding() + 24.dp),
            verticalArrangement = Arrangement.spacedBy(ListItemDefaults.SegmentedGap),
        ) {
            section(R.string.settings_general)
            item {
                Item(shapes = ListItemDefaults.segmentedShapes(0, 2), title = stringResource(R.string.settings_search_engine), summary = settings.searchEngine, onClick = { pickEngine = true })
            }
            item {
                SwitchItem(
                    shapes = ListItemDefaults.segmentedShapes(1, 2),
                    title = stringResource(R.string.settings_search_suggestions),
                    summary = stringResource(R.string.settings_search_suggestions_summary),
                    checked = settings.searchSuggestions,
                    onChange = { value -> repo.update { it.copy(searchSuggestions = value) } },
                )
            }

            section(R.string.settings_appearance)
            item {
                SegmentedListItem(onClick = {}, shapes = ListItemDefaults.segmentedShapes(0, 4), supportingContent = {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(ButtonGroupDefaults.ConnectedSpaceBetween),
                        modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                    ) {
                        ThemeMode.entries.forEachIndexed { index, mode ->
                            ToggleButton(
                                checked = settings.themeMode == mode,
                                onCheckedChange = { repo.update { it.copy(themeMode = mode) } },
                                shapes = when (index) {
                                    0 -> ButtonGroupDefaults.connectedLeadingButtonShapes()
                                    ThemeMode.entries.lastIndex -> ButtonGroupDefaults.connectedTrailingButtonShapes()
                                    else -> ButtonGroupDefaults.connectedMiddleButtonShapes()
                                },
                                modifier = Modifier.weight(1f),
                            ) {
                                Text(
                                    stringResource(
                                        when (mode) {
                                            ThemeMode.System -> R.string.theme_system
                                            ThemeMode.Light -> R.string.theme_light
                                            ThemeMode.Dark -> R.string.theme_dark
                                        }
                                    )
                                )
                            }
                        }
                    }
                }) { Text(stringResource(R.string.settings_theme)) }
            }
            item {
                SwitchItem(
                    shapes = ListItemDefaults.segmentedShapes(1, 4),
                    title = stringResource(R.string.settings_dynamic_color),
                    summary = stringResource(R.string.settings_dynamic_color_summary),
                    checked = settings.dynamicColor,
                    enabled = android.os.Build.VERSION.SDK_INT >= 31,
                    onChange = { value -> repo.update { it.copy(dynamicColor = value) } },
                )
            }
            item {
                SwitchItem(
                    shapes = ListItemDefaults.segmentedShapes(2, 4),
                    title = stringResource(R.string.settings_dark_websites),
                    summary = stringResource(R.string.settings_dark_websites_summary),
                    checked = settings.darkWebsites,
                    onChange = { value -> repo.update { it.copy(darkWebsites = value) } },
                )
            }
            item {
                SwitchItem(
                    shapes = ListItemDefaults.segmentedShapes(3, 4),
                    title = stringResource(R.string.settings_haptics),
                    summary = stringResource(R.string.settings_haptics_summary),
                    checked = settings.haptics,
                    onChange = { value -> repo.update { it.copy(haptics = value) } },
                )
            }

            section(R.string.settings_privacy)
            item {
                SwitchItem(
                    shapes = ListItemDefaults.segmentedShapes(0, 1),
                    title = stringResource(R.string.settings_telemetry),
                    summary = stringResource(R.string.settings_telemetry_summary),
                    checked = settings.telemetry,
                    onChange = { value -> repo.update { it.copy(telemetry = value) } },
                )
            }

            section(R.string.settings_about)
            item {
                Item(
                    shapes = ListItemDefaults.segmentedShapes(0, 2),
                    title = stringResource(R.string.app_name),
                    summary = stringResource(R.string.settings_version, BuildConfig.VERSION_NAME),
                    onClick = {},
                )
            }
            item {
                Item(
                    shapes = ListItemDefaults.segmentedShapes(1, 2),
                    title = stringResource(R.string.settings_source),
                    summary = SOURCE_URL.removePrefix("https://"),
                    onClick = { onOpen(SOURCE_URL) },
                )
            }
        }
    }

    if (pickEngine) {
        AlertDialog(
            onDismissRequest = { pickEngine = false },
            title = { Text(stringResource(R.string.settings_search_engine)) },
            text = {
                Column {
                    SearchEngines.all.forEach { engine ->
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .fillMaxWidth()
                                .heightIn(min = 48.dp)
                                .selectable(
                                    selected = settings.searchEngine == engine.name,
                                    role = Role.RadioButton,
                                    onClick = {
                                        repo.update { it.copy(searchEngine = engine.name) }
                                        pickEngine = false
                                    },
                                ),
                        ) {
                            RadioButton(selected = settings.searchEngine == engine.name, onClick = null)
                            Text(engine.name, modifier = Modifier.padding(start = 16.dp))
                        }
                    }
                }
            },
            confirmButton = { TextButton(onClick = { pickEngine = false }) { Text(stringResource(R.string.cancel)) } },
        )
    }
}

private fun androidx.compose.foundation.lazy.LazyListScope.section(title: Int) {
    item(key = "s:$title") {
        Text(
            stringResource(title),
            style = MaterialTheme.typography.titleSmall,
            color = MaterialTheme.colorScheme.primary,
            modifier = Modifier.padding(start = 16.dp, top = 20.dp, bottom = 8.dp),
        )
    }
}

@Composable
private fun Item(shapes: ListItemShapes, title: String, summary: String?, onClick: () -> Unit) {
    SegmentedListItem(
        onClick = onClick,
        shapes = shapes,
        supportingContent = textSlot(summary),
    ) { Text(title) }
}

private fun textSlot(text: String?): (@Composable () -> Unit)? =
    if (text.isNullOrBlank()) null else { { Text(text) } }

@Composable
private fun SwitchItem(
    shapes: ListItemShapes,
    title: String,
    summary: String?,
    checked: Boolean,
    enabled: Boolean = true,
    onChange: (Boolean) -> Unit,
) {
    SegmentedListItem(
        checked = checked,
        onCheckedChange = onChange,
        enabled = enabled,
        shapes = shapes,
        supportingContent = textSlot(summary),
        trailingContent = { Switch(checked = checked, onCheckedChange = null, enabled = enabled) },
    ) { Text(title) }
}
