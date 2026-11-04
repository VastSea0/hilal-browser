package com.vastsea.hilal.ui.browser

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.Circle
import androidx.compose.material.icons.outlined.Code
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material.icons.outlined.Flight
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.School
import androidx.compose.material.icons.outlined.ShoppingBag
import androidx.compose.material.icons.outlined.SportsEsports
import androidx.compose.material.icons.outlined.StarOutline
import androidx.compose.material.icons.outlined.Work
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconToggleButton
import androidx.compose.material3.ListItem
import androidx.compose.material3.ListItemDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.vastsea.hilal.R
import com.vastsea.hilal.browser.Workspace
import com.vastsea.hilal.browser.WorkspaceColor
import com.vastsea.hilal.browser.WorkspaceIcon

/** What the editor sheet hands back for a new or changed workspace. */
data class WorkspaceEdit(
    val name: String,
    val icon: WorkspaceIcon,
    val color: WorkspaceColor,
    val isolated: Boolean,
)

val WorkspaceColor.color: Color get() = Color(argb)

val WorkspaceIcon.vector: ImageVector
    get() = when (this) {
        WorkspaceIcon.Circle -> Icons.Outlined.Circle
        WorkspaceIcon.Home -> Icons.Outlined.Home
        WorkspaceIcon.Work -> Icons.Outlined.Work
        WorkspaceIcon.School -> Icons.Outlined.School
        WorkspaceIcon.Shopping -> Icons.Outlined.ShoppingBag
        WorkspaceIcon.Code -> Icons.Outlined.Code
        WorkspaceIcon.Travel -> Icons.Outlined.Flight
        WorkspaceIcon.Games -> Icons.Outlined.SportsEsports
        WorkspaceIcon.Heart -> Icons.Outlined.FavoriteBorder
        WorkspaceIcon.Star -> Icons.Outlined.StarOutline
    }

/**
 * The row of workspaces above the normal tabs. Tapping a workspace switches to it; tapping the
 * active one again opens its editor.
 */
@Composable
fun WorkspaceStrip(
    workspaces: List<Workspace>,
    activeId: String,
    tabCounts: Map<String, Int>,
    onSwitch: (String) -> Unit,
    onEdit: (Workspace) -> Unit,
    onAdd: () -> Unit,
    modifier: Modifier = Modifier,
) {
    LazyRow(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        contentPadding = PaddingValues(horizontal = 12.dp),
        modifier = modifier.fillMaxWidth(),
    ) {
        items(workspaces, key = { it.id }) { workspace ->
            val active = workspace.id == activeId
            FilterChip(
                selected = active,
                onClick = { if (active) onEdit(workspace) else onSwitch(workspace.id) },
                label = { Text("${workspace.name} · ${tabCounts[workspace.id] ?: 0}") },
                leadingIcon = {
                    Icon(
                        workspace.icon.vector,
                        contentDescription = null,
                        tint = workspace.color.color,
                        modifier = Modifier.size(FilterChipDefaults.IconSize),
                    )
                },
                trailingIcon = if (active) {
                    {
                        Icon(
                            Icons.Outlined.Edit,
                            contentDescription = stringResource(R.string.workspace_edit),
                            modifier = Modifier.size(FilterChipDefaults.IconSize),
                        )
                    }
                } else null,
                modifier = Modifier.animateItem(),
            )
        }
        item(key = "add") {
            FilterChip(
                selected = false,
                onClick = onAdd,
                label = { Text(stringResource(R.string.workspace_new)) },
                leadingIcon = { Icon(Icons.Outlined.Add, null, Modifier.size(FilterChipDefaults.IconSize)) },
            )
        }
    }
}

/** Creates a workspace when [workspace] is null, otherwise edits it. */
@Composable
fun WorkspaceEditorSheet(
    workspace: Workspace?,
    onSave: (WorkspaceEdit) -> Unit,
    onDelete: () -> Unit,
    onDismiss: () -> Unit,
) {
    val sheet = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    var name by remember { mutableStateOf(workspace?.name.orEmpty()) }
    var icon by remember { mutableStateOf(workspace?.icon ?: WorkspaceIcon.Circle) }
    var color by remember { mutableStateOf(workspace?.color ?: WorkspaceColor.entries.random()) }
    var isolated by remember { mutableStateOf(workspace?.isolated ?: true) }
    var confirmDelete by remember { mutableStateOf(false) }
    val isDefault = workspace?.id == Workspace.DEFAULT_ID

    ModalBottomSheet(onDismissRequest = onDismiss, sheetState = sheet) {
        Column(
            verticalArrangement = Arrangement.spacedBy(16.dp),
            modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp).navigationBarsPadding(),
        ) {
            Text(
                stringResource(if (workspace == null) R.string.workspace_new else R.string.workspace_edit),
                style = MaterialTheme.typography.titleLarge,
            )
            OutlinedTextField(
                value = name,
                onValueChange = { name = it.take(40) },
                label = { Text(stringResource(R.string.workspace_name)) },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
            )
            FlowRow(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                WorkspaceIcon.entries.forEach { option ->
                    IconToggleButton(checked = option == icon, onCheckedChange = { icon = option }) {
                        Icon(option.vector, contentDescription = option.name, tint = if (option == icon) color.color else MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
            Row(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.horizontalScroll(rememberScrollState()),
            ) {
                WorkspaceColor.entries.forEach { option ->
                    Box(
                        Modifier
                            .size(36.dp)
                            .background(option.color, CircleShape)
                            .then(
                                if (option == color) Modifier.border(3.dp, MaterialTheme.colorScheme.onSurface, CircleShape)
                                else Modifier
                            )
                            .clickable { color = option },
                    )
                }
            }
            if (!isDefault) {
                ListItem(
                    headlineContent = { Text(stringResource(R.string.workspace_isolated)) },
                    supportingContent = {
                        Text(
                            stringResource(
                                if (workspace != null && workspace.isolated) R.string.workspace_isolated_off_warning
                                else R.string.workspace_isolated_summary
                            )
                        )
                    },
                    trailingContent = { Switch(checked = isolated, onCheckedChange = { isolated = it }) },
                    colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                    modifier = Modifier.clickable { isolated = !isolated },
                )
            }
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp)) {
                if (workspace != null && !isDefault) {
                    TextButton(onClick = { confirmDelete = true }) {
                        Text(stringResource(R.string.workspace_delete), color = MaterialTheme.colorScheme.error)
                    }
                }
                Spacer(Modifier.weight(1f))
                TextButton(onClick = onDismiss) { Text(stringResource(R.string.cancel)) }
                Button(
                    enabled = name.isNotBlank(),
                    onClick = { onSave(WorkspaceEdit(name.trim(), icon, color, isolated && !isDefault)) },
                ) { Text(stringResource(R.string.save)) }
            }
        }
    }

    if (confirmDelete) {
        AlertDialog(
            onDismissRequest = { confirmDelete = false },
            title = { Text(stringResource(R.string.workspace_delete_title, workspace?.name.orEmpty())) },
            text = { Text(stringResource(R.string.workspace_delete_body)) },
            confirmButton = {
                TextButton(onClick = {
                    confirmDelete = false
                    onDelete()
                }) { Text(stringResource(R.string.workspace_delete), color = MaterialTheme.colorScheme.error) }
            },
            dismissButton = { TextButton(onClick = { confirmDelete = false }) { Text(stringResource(R.string.cancel)) } },
        )
    }
}
