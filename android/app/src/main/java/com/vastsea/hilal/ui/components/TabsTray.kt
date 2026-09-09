package com.vastsea.hilal.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vastsea.hilal.R
import com.vastsea.hilal.model.BrowserTab
import com.vastsea.hilal.model.Workspace
import android.content.res.Configuration
import androidx.compose.ui.tooling.preview.Preview
import com.vastsea.hilal.ui.theme.HilalTheme
import java.util.UUID

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TabsTray(
    tabs: List<BrowserTab>,
    activeTabId: String,
    workspaces: List<Workspace>,
    currentWorkspaceId: String,
    onSelectTab: (String) -> Unit,
    onCloseTab: (String) -> Unit,
    onNewTab: () -> Unit,
    onSelectWorkspace: (String) -> Unit,
    onCreateWorkspace: (String, String) -> Unit,
    onDismiss: () -> Unit
) {
    var showWorkspaceMenu by remember { mutableStateOf(false) }
    var showNewWorkspaceDialog by remember { mutableStateOf(false) }
    var newWorkspaceName by remember { mutableStateOf("") }
    var selectedEmoji by remember { mutableStateOf("🌐") }
    val emojiOptions = listOf("🌐", "💼", "🔬", "📚", "🎨", "🚀", "🎮", "🏠", "💡", "🛡️", "✈️", "☕")

    val currentWorkspace = workspaces.find { it.id == currentWorkspaceId } ?: workspaces.first()
    val filteredTabs = tabs.filter { it.workspaceId == currentWorkspaceId }

    Surface(
        color = MaterialTheme.colorScheme.surface,
        modifier = Modifier.fillMaxSize()
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding()
                .padding(16.dp)
        ) {
            // Top Bar: M3 Expressive Split Button Workspace Switcher + Close Button
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Split Button for Workspace
                Box {
                    Surface(
                        color = MaterialTheme.colorScheme.primaryContainer,
                        shape = CircleShape,
                        modifier = Modifier.height(44.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            // Left part of Split Button: Current Workspace Info
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .clickable { showWorkspaceMenu = true }
                                    .padding(horizontal = 16.dp, vertical = 8.dp)
                            ) {
                                Text(
                                    text = currentWorkspace.emoji,
                                    fontSize = 18.sp
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = currentWorkspace.name,
                                    style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold),
                                    color = MaterialTheme.colorScheme.onPrimaryContainer
                                )
                            }

                            VerticalDivider(
                                modifier = Modifier
                                    .height(24.dp)
                                    .width(1.dp),
                                color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.3f)
                            )

                            // Right part of Split Button: Dropdown Arrow
                            IconButton(
                                onClick = { showWorkspaceMenu = true },
                                modifier = Modifier.size(44.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.ArrowDropDown,
                                    contentDescription = stringResource(R.string.workspaces),
                                    tint = MaterialTheme.colorScheme.onPrimaryContainer
                                )
                            }
                        }
                    }

                    // Workspaces Dropdown Menu
                    DropdownMenu(
                        expanded = showWorkspaceMenu,
                        onDismissRequest = { showWorkspaceMenu = false },
                        shape = RoundedCornerShape(16.dp)
                    ) {
                        workspaces.forEach { ws ->
                            val isSelected = ws.id == currentWorkspaceId
                            DropdownMenuItem(
                                text = {
                                    Text(
                                        text = ws.name,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                                    )
                                },
                                leadingIcon = {
                                    Text(ws.emoji, fontSize = 20.sp)
                                },
                                trailingIcon = if (isSelected) {
                                    {
                                        Icon(
                                            imageVector = Icons.Default.Check,
                                            contentDescription = null,
                                            tint = MaterialTheme.colorScheme.primary,
                                            modifier = Modifier.size(18.dp)
                                        )
                                    }
                                } else null,
                                onClick = {
                                    onSelectWorkspace(ws.id)
                                    showWorkspaceMenu = false
                                }
                            )
                        }
                        HorizontalDivider()
                        DropdownMenuItem(
                            text = { Text(stringResource(R.string.add_workspace_button)) },
                            leadingIcon = { Icon(Icons.Default.Add, contentDescription = null) },
                            onClick = {
                                showWorkspaceMenu = false
                                showNewWorkspaceDialog = true
                            }
                        )
                    }
                }

                // Close Tabs Tray Button
                IconButton(
                    onClick = onDismiss,
                    colors = IconButtonDefaults.filledTonalIconButtonColors()
                ) {
                    Icon(Icons.Default.Close, contentDescription = stringResource(R.string.close))
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Tab Cards Grid (2 Columns)
            if (filteredTabs.isEmpty()) {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth(),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = stringResource(R.string.tabs_empty),
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            } else {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    items(filteredTabs, key = { it.id }) { tab ->
                        val isActive = tab.id == activeTabId
                        val dismissState = rememberSwipeToDismissBoxState(
                            confirmValueChange = { value ->
                                if (value == SwipeToDismissBoxValue.StartToEnd || value == SwipeToDismissBoxValue.EndToStart) {
                                    onCloseTab(tab.id)
                                    true
                                } else false
                            }
                        )

                        SwipeToDismissBox(
                            state = dismissState,
                            backgroundContent = {
                                Surface(
                                    color = MaterialTheme.colorScheme.errorContainer,
                                    shape = RoundedCornerShape(16.dp),
                                    modifier = Modifier.fillMaxSize()
                                ) {
                                    Box(
                                        modifier = Modifier.fillMaxSize(),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Delete,
                                            contentDescription = stringResource(R.string.delete),
                                            tint = MaterialTheme.colorScheme.onErrorContainer
                                        )
                                    }
                                }
                            }
                        ) {
                            Surface(
                                color = MaterialTheme.colorScheme.surfaceContainerLow,
                                shape = RoundedCornerShape(16.dp),
                                border = if (isActive) BorderStroke(2.dp, MaterialTheme.colorScheme.primary) else null,
                                shadowElevation = if (isActive) 4.dp else 1.dp,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(140.dp)
                                    .clickable {
                                        onSelectTab(tab.id)
                                        onDismiss()
                                    }
                            ) {
                                Column(
                                    modifier = Modifier
                                        .fillMaxSize()
                                        .padding(12.dp)
                                ) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Public,
                                            contentDescription = null,
                                            tint = if (isActive) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
                                            modifier = Modifier.size(16.dp)
                                        )
                                        IconButton(
                                            onClick = { onCloseTab(tab.id) },
                                            modifier = Modifier.size(24.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.Close,
                                                contentDescription = stringResource(R.string.close),
                                                modifier = Modifier.size(14.dp)
                                            )
                                        }
                                    }
                                    Spacer(modifier = Modifier.weight(1f))
                                    Text(
                                        text = tab.title,
                                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold),
                                        color = MaterialTheme.colorScheme.onSurface,
                                        maxLines = 2,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(
                                        text = tab.url,
                                        style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                }
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Bottom Actions: + Yeni Sekme FAB
            Box(
                modifier = Modifier.fillMaxWidth(),
                contentAlignment = Alignment.Center
            ) {
                ExtendedFloatingActionButton(
                    onClick = {
                        onNewTab()
                        onDismiss()
                    },
                    icon = { Icon(Icons.Default.Add, contentDescription = null) },
                    text = { Text(stringResource(R.string.new_tab)) },
                    shape = CircleShape,
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = MaterialTheme.colorScheme.onPrimary
                )
            }
        }
    }

    // New Workspace Dialog
    if (showNewWorkspaceDialog) {
        AlertDialog(
            onDismissRequest = { showNewWorkspaceDialog = false },
            shape = RoundedCornerShape(28.dp),
            title = { Text(stringResource(R.string.new_workspace)) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    OutlinedTextField(
                        value = newWorkspaceName,
                        onValueChange = { newWorkspaceName = it },
                        label = { Text(stringResource(R.string.workspace_name_hint)) },
                        leadingIcon = {
                            Box(modifier = Modifier.padding(start = 12.dp, end = 4.dp)) {
                                Text(selectedEmoji, fontSize = 20.sp)
                            }
                        },
                        singleLine = true,
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.fillMaxWidth()
                    )

                    Text(
                        text = stringResource(R.string.choose_emoji),
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    androidx.compose.foundation.lazy.LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        contentPadding = PaddingValues(vertical = 4.dp)
                    ) {
                        items(emojiOptions.size) { index ->
                            val emoji = emojiOptions[index]
                            val isSelected = emoji == selectedEmoji
                            Surface(
                                shape = CircleShape,
                                color = if (isSelected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceContainerHigh,
                                border = if (isSelected) BorderStroke(2.dp, MaterialTheme.colorScheme.primary) else null,
                                modifier = Modifier
                                    .size(40.dp)
                                    .clickable { selectedEmoji = emoji }
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Text(emoji, fontSize = 20.sp)
                                }
                            }
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (newWorkspaceName.isNotBlank()) {
                            onCreateWorkspace(newWorkspaceName.trim(), selectedEmoji)
                            newWorkspaceName = ""
                            selectedEmoji = "🌐"
                            showNewWorkspaceDialog = false
                        }
                    },
                    shape = CircleShape
                ) {
                    Text(stringResource(R.string.create))
                }
            },
            dismissButton = {
                TextButton(onClick = { showNewWorkspaceDialog = false }) {
                    Text(stringResource(R.string.cancel))
                }
            }
        )
    }
}

@Preview(showBackground = true, name = "Tabs Tray Light")
@Preview(showBackground = true, uiMode = Configuration.UI_MODE_NIGHT_YES, name = "Tabs Tray Dark")
@Composable
private fun TabsTrayPreview() {
    HilalTheme {
        TabsTray(
            tabs = listOf(
                BrowserTab("1", "https://duckduckgo.com", "DuckDuckGo — Gizlilik Odaklı Arama Motoru", "default"),
                BrowserTab("2", "https://github.com", "GitHub: Let's build from here", "default"),
                BrowserTab("3", "https://news.ycombinator.com", "Hacker News", "default")
            ),
            activeTabId = "1",
            workspaces = listOf(
                Workspace("default", "Genel", "🌐"),
                Workspace("work", "İş & Çalışma", "💼")
            ),
            currentWorkspaceId = "default",
            onSelectTab = {},
            onCloseTab = {},
            onNewTab = {},
            onSelectWorkspace = {},
            onCreateWorkspace = { _, _ -> },
            onDismiss = {}
        )
    }
}
