@file:OptIn(ExperimentalMaterial3Api::class, ExperimentalMaterial3ExpressiveApi::class)

package com.vastsea.hilal.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.itemsIndexed
import androidx.compose.foundation.lazy.grid.rememberLazyGridState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vastsea.hilal.R
import com.vastsea.hilal.model.BrowserTab
import com.vastsea.hilal.model.Workspace
import com.vastsea.hilal.ui.theme.*

@Composable
fun TabsTray(
    tabs: List<BrowserTab>,
    activeTabId: String,
    workspaces: List<Workspace>,
    currentWorkspaceId: String,
    onSelectTab: (String) -> Unit,
    onCloseTab: (String) -> Unit,
    onNewTab: () -> Unit,
    onNewPrivateTab: () -> Unit = {},
    onSelectWorkspace: (String) -> Unit,
    onCreateWorkspace: (String, String) -> Unit,
    onDismiss: () -> Unit
) {
    var isPrivateMode by remember { mutableStateOf(tabs.find { it.id == activeTabId }?.isPrivate == true) }
    var showNewWorkspaceDialog by remember { mutableStateOf(false) }
    var newWorkspaceName by remember { mutableStateOf("") }
    var selectedEmoji by remember { mutableStateOf("🌐") }
    val emojiOptions = listOf("🌐", "💼", "🔬", "📚", "🎨", "🚀", "🎮", "🏠", "💡", "🛡️", "✈️", "☕")
    val haptics = rememberHilalHaptics()

    val currentWorkspace = workspaces.find { it.id == currentWorkspaceId } ?: workspaces.first()
    val regularTabs = tabs.filter { !it.isPrivate && it.workspaceId == currentWorkspaceId }
    val privateTabs = tabs.filter { it.isPrivate }
    val displayTabs = if (isPrivateMode) privateTabs else regularTabs

    val gridState = rememberLazyGridState()

    Surface(
        color = MaterialTheme.colorScheme.surface,
        modifier = Modifier.fillMaxSize()
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding()
                .padding(horizontal = 16.dp, vertical = 12.dp)
        ) {
            // Header: "Sekme Kasası" (Tab Vault) + Close Button
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = stringResource(R.string.tab_vault),
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Surface(
                        shape = ShapeCache.smoothPill,
                        color = if (isPrivateMode) MaterialTheme.colorScheme.tertiaryContainer else MaterialTheme.colorScheme.primaryContainer
                    ) {
                        Text(
                            text = "${displayTabs.size}",
                            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                            color = if (isPrivateMode) MaterialTheme.colorScheme.onTertiaryContainer else MaterialTheme.colorScheme.onPrimaryContainer,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                        )
                    }
                }

                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .bouncyClickable(
                            pressedScale = 0.86f,
                            hapticType = HilalHapticType.Tap,
                            onClick = onDismiss
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Surface(
                        shape = ShapeCache.smooth12,
                        color = MaterialTheme.colorScheme.surfaceContainerHigh,
                        modifier = Modifier.fillMaxSize()
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = stringResource(R.string.close),
                                tint = MaterialTheme.colorScheme.onSurface,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Workspaces Strip (Only in Normal Tabs mode)
            if (!isPrivateMode) {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(workspaces, key = { it.id }) { ws ->
                        val isSelected = ws.id == currentWorkspaceId
                        val wsTabCount = tabs.count { !it.isPrivate && it.workspaceId == ws.id }
                        val containerColor by animateColorAsState(
                            targetValue = if (isSelected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceContainerHigh,
                            animationSpec = HilalMotion.FastColorSpec,
                            label = "wsColor"
                        )
                        Surface(
                            shape = ShapeCache.smooth14,
                            color = containerColor,
                            border = if (isSelected) BorderStroke(1.5.dp, MaterialTheme.colorScheme.primary) else null,
                            modifier = Modifier.bouncyClickable(
                                pressedScale = 0.90f,
                                hapticType = HilalHapticType.Confirm,
                                onClick = { onSelectWorkspace(ws.id) }
                            )
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 7.dp)
                            ) {
                                Text(text = ws.emoji, fontSize = 16.sp)
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = ws.name,
                                    style = MaterialTheme.typography.labelLarge,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                    color = if (isSelected) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurface
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "($wsTabCount)",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = if (isSelected) MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.7f) else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }

                    item {
                        Surface(
                            shape = ShapeCache.smooth14,
                            color = MaterialTheme.colorScheme.surfaceContainerHighest,
                            modifier = Modifier.bouncyClickable(
                                pressedScale = 0.88f,
                                hapticType = HilalHapticType.Tap,
                                onClick = { showNewWorkspaceDialog = true }
                            )
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 7.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Add,
                                    contentDescription = stringResource(R.string.new_workspace),
                                    tint = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }
                    }
                }
                Spacer(modifier = Modifier.height(10.dp))
            }

            // Normal / Private Mode Pill Switcher
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Surface(
                    shape = ShapeCache.smoothPill,
                    color = if (!isPrivateMode) MaterialTheme.colorScheme.secondaryContainer else MaterialTheme.colorScheme.surfaceContainerHigh,
                    modifier = Modifier
                        .weight(1f)
                        .bouncyClickable(
                            pressedScale = 0.94f,
                            hapticType = HilalHapticType.Confirm,
                            onClick = { isPrivateMode = false }
                        )
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Tab,
                            contentDescription = null,
                            tint = if (!isPrivateMode) MaterialTheme.colorScheme.onSecondaryContainer else MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "${stringResource(R.string.normal_tabs)} (${regularTabs.size})",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = if (!isPrivateMode) FontWeight.Bold else FontWeight.Normal,
                            color = if (!isPrivateMode) MaterialTheme.colorScheme.onSecondaryContainer else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                Surface(
                    shape = ShapeCache.smoothPill,
                    color = if (isPrivateMode) MaterialTheme.colorScheme.tertiaryContainer else MaterialTheme.colorScheme.surfaceContainerHigh,
                    modifier = Modifier
                        .weight(1f)
                        .bouncyClickable(
                            pressedScale = 0.94f,
                            hapticType = HilalHapticType.Confirm,
                            onClick = { isPrivateMode = true }
                        )
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.VisibilityOff,
                            contentDescription = null,
                            tint = if (isPrivateMode) MaterialTheme.colorScheme.onTertiaryContainer else MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "${stringResource(R.string.private_tabs)} (${privateTabs.size})",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = if (isPrivateMode) FontWeight.Bold else FontWeight.Normal,
                            color = if (isPrivateMode) MaterialTheme.colorScheme.onTertiaryContainer else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Candy Browser-Style Vault Grid with Tactile Coverflow Depth
            if (displayTabs.isEmpty()) {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            imageVector = if (isPrivateMode) Icons.Default.VisibilityOff else Icons.Default.Tab,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f),
                            modifier = Modifier.size(54.dp)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = if (isPrivateMode) stringResource(R.string.private_tabs_empty) else stringResource(R.string.tabs_empty),
                            style = MaterialTheme.typography.bodyLarge,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            } else {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    state = gridState,
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    itemsIndexed(displayTabs, key = { _, tab -> tab.id }) { index, tab ->
                        val isActive = tab.id == activeTabId
                        val isEven = index % 2 == 0
                        val tiltAngle = if (isActive) 0f else if (isEven) -1.2f else 1.2f

                        val dismissState = rememberSwipeToDismissBoxState(
                            confirmValueChange = { value ->
                                if (value == SwipeToDismissBoxValue.StartToEnd || value == SwipeToDismissBoxValue.EndToStart) {
                                    haptics.perform(HilalHapticType.Reject)
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
                                    shape = ShapeCache.smooth20,
                                    modifier = Modifier.fillMaxSize()
                                ) {
                                    Box(
                                        modifier = Modifier.fillMaxSize(),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Delete,
                                            contentDescription = stringResource(R.string.delete),
                                            tint = MaterialTheme.colorScheme.onErrorContainer,
                                            modifier = Modifier.size(24.dp)
                                        )
                                    }
                                }
                            }
                        ) {
                            // Coverflow & Depth Transformation Layer
                            Surface(
                                shape = ShapeCache.smooth20,
                                color = if (isActive) MaterialTheme.colorScheme.surfaceContainerHighest else MaterialTheme.colorScheme.surfaceContainerHigh,
                                border = if (isActive) {
                                    BorderStroke(2.dp, if (isPrivateMode) MaterialTheme.colorScheme.tertiary else MaterialTheme.colorScheme.primary)
                                } else null,
                                shadowElevation = if (isActive) 6.dp else 2.dp,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(175.dp)
                                    .graphicsLayer {
                                        rotationZ = tiltAngle
                                        scaleX = if (isActive) 1.02f else 0.98f
                                        scaleY = if (isActive) 1.02f else 0.98f
                                    }
                                    .bouncyClickable(
                                        pressedScale = 0.93f,
                                        hapticType = HilalHapticType.Confirm,
                                        onClick = {
                                            onSelectTab(tab.id)
                                            onDismiss()
                                        }
                                    )
                            ) {
                                Column(modifier = Modifier.fillMaxSize()) {
                                    // Card Header: Site Info + Close Action
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .background(
                                                if (isPrivateMode) MaterialTheme.colorScheme.tertiaryContainer.copy(alpha = 0.45f)
                                                else MaterialTheme.colorScheme.surfaceContainerLow
                                            )
                                            .padding(horizontal = 10.dp, vertical = 6.dp)
                                    ) {
                                        Row(
                                            verticalAlignment = Alignment.CenterVertically,
                                            modifier = Modifier.weight(1f)
                                        ) {
                                            Icon(
                                                imageVector = if (tab.isPrivate) Icons.Default.VisibilityOff else Icons.Default.Language,
                                                contentDescription = null,
                                                tint = if (tab.isPrivate) MaterialTheme.colorScheme.tertiary else MaterialTheme.colorScheme.primary,
                                                modifier = Modifier.size(15.dp)
                                            )
                                            Spacer(modifier = Modifier.width(6.dp))
                                            Text(
                                                text = if (tab.title.isNotBlank()) tab.title else stringResource(R.string.new_tab),
                                                style = MaterialTheme.typography.labelMedium,
                                                fontWeight = FontWeight.SemiBold,
                                                maxLines = 1,
                                                overflow = TextOverflow.Ellipsis,
                                                color = MaterialTheme.colorScheme.onSurface
                                            )
                                        }

                                        Box(
                                            modifier = Modifier
                                                .size(24.dp)
                                                .bouncyClickable(
                                                    pressedScale = 0.80f,
                                                    hapticType = HilalHapticType.Reject,
                                                    onClick = { onCloseTab(tab.id) }
                                                ),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.Close,
                                                contentDescription = stringResource(R.string.close),
                                                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                                modifier = Modifier.size(14.dp)
                                            )
                                        }
                                    }

                                    // Card Body Preview
                                    Box(
                                        modifier = Modifier
                                            .fillMaxSize()
                                            .padding(8.dp),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Surface(
                                            shape = ShapeCache.smooth12,
                                            color = MaterialTheme.colorScheme.surface,
                                            modifier = Modifier.fillMaxSize()
                                        ) {
                                            Column(
                                                modifier = Modifier
                                                    .fillMaxSize()
                                                    .padding(8.dp),
                                                verticalArrangement = Arrangement.Center,
                                                horizontalAlignment = Alignment.CenterHorizontally
                                            ) {
                                                Icon(
                                                    imageVector = if (tab.url.startsWith("https://")) Icons.Default.Lock else Icons.Default.Public,
                                                    contentDescription = null,
                                                    tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f),
                                                    modifier = Modifier.size(26.dp)
                                                )
                                                Spacer(modifier = Modifier.height(6.dp))
                                                Text(
                                                    text = tab.url.removePrefix("https://").removePrefix("http://").removePrefix("about:"),
                                                    style = MaterialTheme.typography.bodySmall,
                                                    maxLines = 1,
                                                    overflow = TextOverflow.Ellipsis,
                                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Bottom Floating Actions Strip
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                if (displayTabs.isNotEmpty()) {
                    OutlinedButton(
                        onClick = {
                            haptics.perform(HilalHapticType.Reject)
                            displayTabs.forEach { onCloseTab(it.id) }
                        },
                        shape = ShapeCache.smoothPill,
                        modifier = Modifier
                            .weight(1f)
                            .bouncyClickable(
                                pressedScale = 0.92f,
                                hapticType = HilalHapticType.Reject,
                                onClick = {
                                    displayTabs.forEach { onCloseTab(it.id) }
                                }
                            )
                    ) {
                        Icon(Icons.Default.DeleteSweep, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = if (isPrivateMode) stringResource(R.string.close_all_private_tabs) else stringResource(R.string.close_all_tabs),
                            style = MaterialTheme.typography.labelMedium,
                            maxLines = 1
                        )
                    }
                }

                Button(
                    onClick = {
                        if (isPrivateMode) onNewPrivateTab() else onNewTab()
                        onDismiss()
                    },
                    shape = ShapeCache.smoothPill,
                    colors = if (isPrivateMode) ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.tertiary) else ButtonDefaults.buttonColors(),
                    modifier = Modifier
                        .weight(1f)
                        .bouncyClickable(
                            pressedScale = 0.92f,
                            hapticType = HilalHapticType.Tap,
                            onClick = {
                                if (isPrivateMode) onNewPrivateTab() else onNewTab()
                                onDismiss()
                            }
                        )
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = if (isPrivateMode) stringResource(R.string.new_private_tab) else stringResource(R.string.new_tab),
                        style = MaterialTheme.typography.labelMedium
                    )
                }
            }
        }

        // Dialog for New Workspace
        if (showNewWorkspaceDialog) {
            AlertDialog(
                onDismissRequest = { showNewWorkspaceDialog = false },
                shape = ShapeCache.smooth28,
                title = {
                    Text(
                        text = stringResource(R.string.new_workspace),
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                },
                text = {
                    Column(modifier = Modifier.fillMaxWidth()) {
                        OutlinedTextField(
                            value = newWorkspaceName,
                            onValueChange = { newWorkspaceName = it },
                            label = { Text(stringResource(R.string.workspace_name_hint)) },
                            singleLine = true,
                            shape = ShapeCache.smooth14,
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = stringResource(R.string.choose_emoji),
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(8.dp))

                        LazyRow(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            items(emojiOptions) { emoji ->
                                val isEmojiSelected = emoji == selectedEmoji
                                Surface(
                                    shape = ShapeCache.smooth12,
                                    color = if (isEmojiSelected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceContainerHigh,
                                    border = if (isEmojiSelected) BorderStroke(1.5.dp, MaterialTheme.colorScheme.primary) else null,
                                    modifier = Modifier
                                        .size(44.dp)
                                        .bouncyClickable(
                                            pressedScale = 0.84f,
                                            hapticType = HilalHapticType.LightTick,
                                            onClick = { selectedEmoji = emoji }
                                        )
                                ) {
                                    Box(contentAlignment = Alignment.Center) {
                                        Text(text = emoji, fontSize = 20.sp)
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
                                showNewWorkspaceDialog = false
                            }
                        },
                        shape = ShapeCache.smoothPill,
                        enabled = newWorkspaceName.isNotBlank()
                    ) {
                        Text(stringResource(R.string.create))
                    }
                },
                dismissButton = {
                    TextButton(
                        onClick = { showNewWorkspaceDialog = false },
                        shape = ShapeCache.smoothPill
                    ) {
                        Text(stringResource(R.string.cancel))
                    }
                }
            )
        }
    }
}
