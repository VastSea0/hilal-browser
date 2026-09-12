@file:OptIn(ExperimentalMaterial3Api::class, ExperimentalMaterial3ExpressiveApi::class, ExperimentalFoundationApi::class)

package com.vastsea.hilal.ui.components

import android.content.Context
import android.content.SharedPreferences
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vastsea.hilal.R
import com.vastsea.hilal.ui.theme.*
import org.json.JSONArray
import org.json.JSONObject

data class Shortcut(
    val id: String,
    val title: String,
    val url: String,
    val isCustom: Boolean = false
)

private val BuiltInShortcuts = listOf(
    Shortcut("g", "Google", "https://www.google.com"),
    Shortcut("yt", "YouTube", "https://www.youtube.com"),
    Shortcut("gh", "GitHub", "https://github.com"),
    Shortcut("wiki", "Wikipedia", "https://wikipedia.org"),
    Shortcut("reddit", "Reddit", "https://reddit.com"),
    Shortcut("ddg", "DuckDuckGo", "https://duckduckgo.com")
)

@Composable
fun NewTabPage(
    workspaceName: String,
    workspaceEmoji: String = "🌐",
    isPrivate: Boolean = false,
    onOpenUrl: (String) -> Unit,
    onFocusSearch: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val haptics = rememberHilalHaptics()
    val prefs = remember { context.getSharedPreferences("hilal_newtab_prefs", Context.MODE_PRIVATE) }

    // Customization states saved in SharedPreferences
    var showShortcuts by remember { mutableStateOf(prefs.getBoolean("show_shortcuts", true)) }
    var showWorkspaceBadge by remember { mutableStateOf(prefs.getBoolean("show_workspace_badge", true)) }

    // Shortcuts state
    val shortcuts = remember { mutableStateListOf<Shortcut>() }

    fun loadShortcuts() {
        shortcuts.clear()
        val customJson = prefs.getString("custom_shortcuts_json", null)
        val list = mutableListOf<Shortcut>()
        list.addAll(BuiltInShortcuts)
        if (!customJson.isNullOrBlank()) {
            try {
                val array = JSONArray(customJson)
                for (i in 0 until array.length()) {
                    val obj = array.getJSONObject(i)
                    list.add(
                        Shortcut(
                            id = obj.optString("id", i.toString()),
                            title = obj.getString("title"),
                            url = obj.getString("url"),
                            isCustom = true
                        )
                    )
                }
            } catch (_: Exception) {}
        }
        shortcuts.addAll(list)
    }

    fun saveCustomShortcuts() {
        val customList = shortcuts.filter { it.isCustom }
        val array = JSONArray()
        for (sc in customList) {
            val obj = JSONObject().apply {
                put("id", sc.id)
                put("title", sc.title)
                put("url", sc.url)
            }
            array.put(obj)
        }
        prefs.edit().putString("custom_shortcuts_json", array.toString()).apply()
    }

    LaunchedEffect(Unit) {
        loadShortcuts()
    }

    // Dialogs
    var showCustomizeSheet by remember { mutableStateOf(false) }
    var showAddShortcutDialog by remember { mutableStateOf(false) }
    var newShortcutTitle by remember { mutableStateOf("") }
    var newShortcutUrl by remember { mutableStateOf("") }
    var shortcutToDelete by remember { mutableStateOf<Shortcut?>(null) }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.surface)
    ) {
        // Top-Right Customize Button
        IconButton(
            onClick = { showCustomizeSheet = true },
            modifier = Modifier
                .align(Alignment.TopEnd)
                .statusBarsPadding()
                .padding(top = 12.dp, end = 12.dp)
        ) {
            Icon(
                imageVector = Icons.Outlined.Tune,
                contentDescription = stringResource(R.string.customize_new_tab),
                tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
                modifier = Modifier.size(22.dp)
            )
        }

        // Minimal Centered Content
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp)
                .statusBarsPadding()
                .navigationBarsPadding(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Spacer(modifier = Modifier.height(32.dp))

            // Minimalist Brand Logo & Identity
            Surface(
                shape = CircleShape,
                color = MaterialTheme.colorScheme.surfaceContainerHigh,
                modifier = Modifier.size(72.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Image(
                        painter = painterResource(id = R.drawable.ic_hilal_logo),
                        contentDescription = stringResource(R.string.app_name),
                        modifier = Modifier
                            .size(52.dp)
                            .clip(CircleShape)
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Workspace or Private Mode Chip
            if (isPrivate) {
                Surface(
                    shape = ShapeCache.smoothPill,
                    color = MaterialTheme.colorScheme.tertiaryContainer
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.VisibilityOff,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onTertiaryContainer,
                            modifier = Modifier.size(15.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = stringResource(R.string.private_mode),
                            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onTertiaryContainer
                        )
                    }
                }
            } else if (showWorkspaceBadge) {
                Surface(
                    shape = ShapeCache.smoothPill,
                    color = MaterialTheme.colorScheme.surfaceContainerHigh
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = workspaceEmoji, fontSize = 14.sp)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = workspaceName,
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            // Minimal Search Bar Trigger Pill
            Surface(
                shape = ShapeCache.smoothPill,
                color = MaterialTheme.colorScheme.surfaceContainerHigh,
                shadowElevation = 2.dp,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
                    .bouncyClickable(
                        pressedScale = 0.98f,
                        hapticType = HilalHapticType.Tap,
                        onClick = onFocusSearch
                    )
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 18.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = stringResource(R.string.search_or_enter_url),
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.8f),
                        maxLines = 1
                    )
                }
            }

            // Customizable Shortcuts Grid
            if (showShortcuts) {
                Spacer(modifier = Modifier.height(28.dp))

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 6.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = stringResource(R.string.shortcuts),
                        style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.SemiBold),
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    IconButton(
                        onClick = { showAddShortcutDialog = true },
                        modifier = Modifier.size(28.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Add,
                            contentDescription = stringResource(R.string.add_shortcut),
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Modern 4-column minimal tile grid
                val chunkedShortcuts = shortcuts.chunked(4)
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    for (row in chunkedShortcuts) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            for (sc in row) {
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .combinedClickable(
                                            onClick = {
                                                haptics.perform(HilalHapticType.Tap)
                                                onOpenUrl(sc.url)
                                            },
                                            onLongClick = {
                                                haptics.perform(HilalHapticType.Reject)
                                                shortcutToDelete = sc
                                            }
                                        ),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Column(
                                        horizontalAlignment = Alignment.CenterHorizontally
                                    ) {
                                        Surface(
                                            shape = ShapeCache.smooth16,
                                            color = MaterialTheme.colorScheme.surfaceContainerHigh,
                                            modifier = Modifier.size(52.dp)
                                        ) {
                                            Box(contentAlignment = Alignment.Center) {
                                                Text(
                                                    text = sc.title.take(1).uppercase(),
                                                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                                    color = MaterialTheme.colorScheme.primary
                                                )
                                            }
                                        }
                                        Spacer(modifier = Modifier.height(6.dp))
                                        Text(
                                            text = sc.title,
                                            style = MaterialTheme.typography.labelSmall,
                                            color = MaterialTheme.colorScheme.onSurface,
                                            maxLines = 1,
                                            overflow = TextOverflow.Ellipsis,
                                            textAlign = TextAlign.Center
                                        )
                                    }
                                }
                            }
                            // Fill remaining slots in row if less than 4
                            for (k in 0 until (4 - row.size)) {
                                Spacer(modifier = Modifier.weight(1f))
                            }
                        }
                    }
                }
            }

            // Private Mode Notice
            if (isPrivate) {
                Spacer(modifier = Modifier.height(28.dp))
                Surface(
                    shape = ShapeCache.smooth20,
                    color = MaterialTheme.colorScheme.surfaceContainerLow,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.VisibilityOff,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.tertiary,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = stringResource(R.string.private_mode_desc),
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(48.dp))
        }
    }

    // Customize New Tab Modal Sheet
    if (showCustomizeSheet) {
        ModalBottomSheet(
            onDismissRequest = { showCustomizeSheet = false },
            shape = ShapeCache.smooth28
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 8.dp)
                    .navigationBarsPadding(),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text(
                    text = stringResource(R.string.customize_new_tab),
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
                )

                // Show Shortcuts toggle
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = stringResource(R.string.show_shortcuts),
                            style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.SemiBold)
                        )
                    }
                    Switch(
                        checked = showShortcuts,
                        onCheckedChange = {
                            showShortcuts = it
                            prefs.edit().putBoolean("show_shortcuts", it).apply()
                        }
                    )
                }

                // Show Workspace Badge toggle
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = stringResource(R.string.show_workspace_badge),
                            style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.SemiBold)
                        )
                    }
                    Switch(
                        checked = showWorkspaceBadge,
                        onCheckedChange = {
                            showWorkspaceBadge = it
                            prefs.edit().putBoolean("show_workspace_badge", it).apply()
                        }
                    )
                }

                Button(
                    onClick = {
                        showCustomizeSheet = false
                        showAddShortcutDialog = true
                    },
                    shape = ShapeCache.smoothPill,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(stringResource(R.string.add_shortcut))
                }

                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }

    // Add Shortcut Dialog
    if (showAddShortcutDialog) {
        AlertDialog(
            onDismissRequest = { showAddShortcutDialog = false },
            title = {
                Text(
                    stringResource(R.string.add_shortcut),
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    OutlinedTextField(
                        value = newShortcutTitle,
                        onValueChange = { newShortcutTitle = it },
                        label = { Text(stringResource(R.string.shortcut_title)) },
                        singleLine = true,
                        shape = ShapeCache.smooth14,
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = newShortcutUrl,
                        onValueChange = { newShortcutUrl = it },
                        label = { Text(stringResource(R.string.shortcut_url)) },
                        placeholder = { Text("https://example.com") },
                        singleLine = true,
                        shape = ShapeCache.smooth14,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (newShortcutTitle.isNotBlank() && newShortcutUrl.isNotBlank()) {
                            var validUrl = newShortcutUrl.trim()
                            if (!validUrl.startsWith("http://") && !validUrl.startsWith("https://")) {
                                validUrl = "https://$validUrl"
                            }
                            shortcuts.add(
                                Shortcut(
                                    id = System.currentTimeMillis().toString(),
                                    title = newShortcutTitle.trim(),
                                    url = validUrl,
                                    isCustom = true
                                )
                            )
                            saveCustomShortcuts()
                            newShortcutTitle = ""
                            newShortcutUrl = ""
                            showAddShortcutDialog = false
                        }
                    },
                    shape = ShapeCache.smoothPill,
                    enabled = newShortcutTitle.isNotBlank() && newShortcutUrl.isNotBlank()
                ) {
                    Text(stringResource(R.string.save))
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddShortcutDialog = false }) {
                    Text(stringResource(R.string.cancel))
                }
            },
            shape = ShapeCache.smooth28,
            containerColor = MaterialTheme.colorScheme.surfaceContainerHigh
        )
    }

    // Delete Shortcut Confirmation Dialog
    shortcutToDelete?.let { sc ->
        AlertDialog(
            onDismissRequest = { shortcutToDelete = null },
            title = { Text(stringResource(R.string.delete)) },
            text = { Text("${sc.title} silinsin mi?") },
            confirmButton = {
                Button(
                    onClick = {
                        shortcuts.remove(sc)
                        saveCustomShortcuts()
                        shortcutToDelete = null
                    },
                    shape = ShapeCache.smoothPill,
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                ) {
                    Text(stringResource(R.string.delete))
                }
            },
            dismissButton = {
                TextButton(onClick = { shortcutToDelete = null }) {
                    Text(stringResource(R.string.cancel))
                }
            },
            shape = ShapeCache.smooth28,
            containerColor = MaterialTheme.colorScheme.surfaceContainerHigh
        )
    }
}
