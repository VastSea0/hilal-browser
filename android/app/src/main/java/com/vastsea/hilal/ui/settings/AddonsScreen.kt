package com.vastsea.hilal.ui.settings

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Extension
import androidx.compose.material.icons.outlined.MoreVert
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ListItemDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.SegmentedListItem
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.vastsea.hilal.AppContainer
import com.vastsea.hilal.R
import com.vastsea.hilal.addons.Addon
import com.vastsea.hilal.ui.library.LibraryScaffold
import com.vastsea.hilal.ui.library.segmentedGroup

private const val AMO_URL = "https://addons.mozilla.org/android/"

@Composable
fun AddonsScreen(container: AppContainer, onBack: () -> Unit, onOpen: (String) -> Unit) {
    val controller = container.addons
    val addons by controller.addons.collectAsState()
    LaunchedEffect(Unit) { controller.refresh() }
    val installedLabel = stringResource(R.string.addons_installed)

    LibraryScaffold(title = stringResource(R.string.addons), onBack = onBack) { padding ->
        LazyColumn(
            contentPadding = PaddingValues(start = 12.dp, end = 12.dp, top = padding.calculateTopPadding(), bottom = padding.calculateBottomPadding() + 24.dp),
            verticalArrangement = Arrangement.spacedBy(ListItemDefaults.SegmentedGap),
        ) {
            segmentedGroup(installedLabel, addons, key = { it.id }) { addon, shapes ->
                AddonRow(
                    addon = addon,
                    shapes = shapes,
                    onToggle = { controller.setEnabled(addon, it) },
                    onOptions = {
                        controller.openOptions(addon)
                        onBack()
                    },
                    onRemove = { controller.uninstall(addon) },
                )
            }
            item {
                Spacer(Modifier.height(16.dp))
                SegmentedListItem(
                    onClick = { onOpen(AMO_URL) },
                    shapes = ListItemDefaults.segmentedShapes(0, 1),
                    leadingContent = { Icon(Icons.Outlined.Search, null) },
                ) { Text(stringResource(R.string.addons_get_more)) }
            }
        }
    }
}

@Composable
private fun AddonRow(
    addon: Addon,
    shapes: androidx.compose.material3.ListItemShapes,
    onToggle: (Boolean) -> Unit,
    onOptions: () -> Unit,
    onRemove: () -> Unit,
) {
    var menu by remember { mutableStateOf(false) }
    SegmentedListItem(
        checked = addon.enabled,
        onCheckedChange = onToggle,
        shapes = shapes,
        leadingContent = {
            val icon = remember(addon.icon) { addon.icon?.asImageBitmap() }
            if (icon != null) Image(icon, null, Modifier.size(40.dp))
            else Icon(Icons.Outlined.Extension, null, Modifier.size(40.dp))
        },
        supportingContent = { Text(addon.description, maxLines = 2, overflow = TextOverflow.Ellipsis) },
        trailingContent = {
            androidx.compose.foundation.layout.Row {
                Switch(checked = addon.enabled, onCheckedChange = null)
                Box {
                    IconButton(onClick = { menu = true }) { Icon(Icons.Outlined.MoreVert, stringResource(R.string.menu)) }
                    DropdownMenu(expanded = menu, onDismissRequest = { menu = false }) {
                        if (addon.optionsUrl != null) {
                            DropdownMenuItem(text = { Text(stringResource(R.string.addon_options)) }, onClick = { menu = false; onOptions() })
                        }
                        DropdownMenuItem(text = { Text(stringResource(R.string.addon_remove)) }, onClick = { menu = false; onRemove() })
                    }
                }
            }
        },
    ) {
        Text(addon.name, maxLines = 1, overflow = TextOverflow.Ellipsis)
    }
}

/** Asks before an add-on gets new permissions (install, update or optional request). */
@Composable
fun AddonPermissionHost(container: AppContainer) {
    val request by container.addons.permissionRequest.collectAsState()
    val current = request ?: return
    val allSites = current.origins.any { it == "<all_urls>" || it.startsWith("*://*/") }
    val sites = current.origins.filterNot { it == "<all_urls>" || it.startsWith("*://*/") }
        .map { it.substringAfter("://").substringBefore('/').removePrefix("*.") }
        .distinct()
    AlertDialog(
        onDismissRequest = { current.answer(false) },
        icon = { Icon(Icons.Outlined.Extension, null) },
        title = { Text(stringResource(R.string.addon_permission_title, current.addonName)) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                if (current.permissions.isNotEmpty() || current.origins.isNotEmpty()) {
                    Text(stringResource(R.string.addon_permission_body))
                }
                if (allSites) Text("• " + stringResource(R.string.addon_permission_all_sites), style = MaterialTheme.typography.bodyMedium)
                else if (sites.isNotEmpty()) Text("• " + stringResource(R.string.addon_permission_sites, sites.take(5).joinToString()), style = MaterialTheme.typography.bodyMedium)
                current.permissions.forEach { Text("• $it", style = MaterialTheme.typography.bodyMedium, modifier = Modifier.padding(start = 0.dp)) }
            }
        },
        confirmButton = { TextButton(onClick = { current.answer(true) }) { Text(stringResource(R.string.add)) } },
        dismissButton = { TextButton(onClick = { current.answer(false) }) { Text(stringResource(R.string.cancel)) } },
    )
}
