@file:OptIn(ExperimentalMaterial3ExpressiveApi::class, ExperimentalFoundationApi::class)

package com.vastsea.hilal.ui.components

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vastsea.hilal.R
import com.vastsea.hilal.search.HilalBangsEngine
import com.vastsea.hilal.ui.theme.*
import kotlin.math.abs

@Composable
fun Omnibox(
    currentUrl: String,
    title: String,
    onNavigate: (String) -> Unit,
    onReload: () -> Unit,
    isFloating: Boolean = true,
    isPrivate: Boolean = false,
    isLoading: Boolean = false,
    loadingProgress: Float = 0f,
    defaultSearchEngine: String = "DuckDuckGo",
    onSwipePreviousTab: (() -> Unit)? = null,
    onSwipeNextTab: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val clipboardManager = remember { context.getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager }
    val urlCopiedMessage = stringResource(R.string.url_copied_msg)

    var isEditing by remember { mutableStateOf(false) }
    var searchText by remember(currentUrl) { mutableStateOf(if (currentUrl == "about:newtab" || currentUrl == "about:blank") "" else currentUrl) }
    val focusRequester = remember { FocusRequester() }
    val haptics = rememberHilalHaptics()

    LaunchedEffect(currentUrl) {
        if (currentUrl != "about:newtab" && currentUrl != "about:blank") {
            searchText = currentUrl
            isEditing = false
        }
    }

    BackHandler(enabled = isEditing) {
        isEditing = false
        searchText = if (currentUrl == "about:newtab" || currentUrl == "about:blank") "" else currentUrl
    }

    val matchingBangs = remember(searchText) {
        if (searchText.startsWith("!")) HilalBangsEngine.getSuggestions(searchText) else emptyList()
    }

    fun copyCurrentUrl(targetUrl: String = currentUrl) {
        if (targetUrl.isNotBlank() && targetUrl != "about:newtab" && targetUrl != "about:blank") {
            clipboardManager?.setPrimaryClip(ClipData.newPlainText("URL", targetUrl))
            haptics.perform(HilalHapticType.Confirm)
            Toast.makeText(context, urlCopiedMessage, Toast.LENGTH_SHORT).show()
        }
    }

    // Horizontal swipe gesture for switching tabs on Omnibox
    var horizontalDragAmount by remember { mutableFloatStateOf(0f) }
    val density = LocalDensity.current
    val minSwipeDistancePx = with(density) { 56.dp.toPx() }
    val tickStepPx = with(density) { 28.dp.toPx() }
    var lastTickBucket by remember { mutableIntStateOf(0) }

    val swipeGestureModifier = if (!isEditing) {
        Modifier.pointerInput(Unit) {
            detectHorizontalDragGestures(
                onDragStart = {
                    horizontalDragAmount = 0f
                    lastTickBucket = 0
                },
                onHorizontalDrag = { _, dragAmount ->
                    horizontalDragAmount += dragAmount
                    val currentBucket = (horizontalDragAmount / tickStepPx).toInt()
                    if (currentBucket != lastTickBucket) {
                        haptics.perform(HilalHapticType.LightTick)
                        lastTickBucket = currentBucket
                    }
                },
                onDragEnd = {
                    if (abs(horizontalDragAmount) >= minSwipeDistancePx) {
                        haptics.perform(HilalHapticType.Confirm)
                        if (horizontalDragAmount > 0) {
                            onSwipePreviousTab?.invoke()
                        } else {
                            onSwipeNextTab?.invoke()
                        }
                    }
                    horizontalDragAmount = 0f
                    lastTickBucket = 0
                },
                onDragCancel = {
                    horizontalDragAmount = 0f
                    lastTickBucket = 0
                }
            )
        }
    } else Modifier

    // Display URL formatting (strip http/https, show clean domain and path)
    val displayUrl = remember(currentUrl) {
        if (currentUrl == "about:newtab" || currentUrl == "about:blank" || currentUrl.isBlank()) {
            ""
        } else {
            currentUrl.removePrefix("https://").removePrefix("http://")
        }
    }

    Column(modifier = modifier.fillMaxWidth()) {
        if (isFloating) {
            // True Floating Toolbar Pill
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .statusBarsPadding()
                    .padding(horizontal = 14.dp, vertical = 6.dp)
            ) {
                Surface(
                    shape = ShapeCache.smoothPill,
                    color = MaterialTheme.colorScheme.surfaceContainerHigh,
                    shadowElevation = 6.dp,
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.35f)),
                    modifier = Modifier
                        .fillMaxWidth()
                        .then(swipeGestureModifier)
                ) {
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp)
                                .padding(horizontal = 12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            // Left Security / Lock / Private Icon
                            if (isPrivate) {
                                Surface(
                                    shape = ShapeCache.smoothPill,
                                    color = MaterialTheme.colorScheme.tertiaryContainer,
                                    modifier = Modifier.padding(end = 4.dp)
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.VisibilityOff,
                                            contentDescription = stringResource(R.string.private_mode),
                                            tint = MaterialTheme.colorScheme.onTertiaryContainer,
                                            modifier = Modifier.size(13.dp)
                                        )
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(
                                            text = stringResource(R.string.private_mode),
                                            style = MaterialTheme.typography.labelSmall,
                                            color = MaterialTheme.colorScheme.onTertiaryContainer
                                        )
                                    }
                                }
                            } else {
                                Icon(
                                    imageVector = if (currentUrl.startsWith("https://")) Icons.Default.Lock else Icons.Default.Security,
                                    contentDescription = stringResource(R.string.security),
                                    tint = if (currentUrl.startsWith("https://")) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.size(18.dp)
                                )
                            }

                            // Center URL or Editable Input Field
                            if (isEditing) {
                                BasicTextField(
                                    value = searchText,
                                    onValueChange = { searchText = it },
                                    singleLine = true,
                                    textStyle = MaterialTheme.typography.bodyMedium.copy(
                                        color = MaterialTheme.colorScheme.onSurface
                                    ),
                                    cursorBrush = SolidColor(MaterialTheme.colorScheme.primary),
                                    keyboardOptions = KeyboardOptions(
                                        keyboardType = KeyboardType.Uri,
                                        imeAction = ImeAction.Search
                                    ),
                                    keyboardActions = KeyboardActions(
                                        onSearch = {
                                            val resolved = HilalBangsEngine.resolveUrl(searchText, defaultSearchEngine)
                                            isEditing = false
                                            onNavigate(resolved)
                                        }
                                    ),
                                    modifier = Modifier
                                        .weight(1f)
                                        .focusRequester(focusRequester)
                                )
                                LaunchedEffect(Unit) {
                                    focusRequester.requestFocus()
                                }

                                // Quick Copy Action Button
                                if (searchText.isNotBlank()) {
                                    IconButton(
                                        onClick = { copyCurrentUrl(searchText) },
                                        modifier = Modifier.size(32.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.ContentCopy,
                                            contentDescription = stringResource(R.string.copy_url),
                                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                            modifier = Modifier.size(16.dp)
                                        )
                                    }

                                    // Clear Button
                                    IconButton(
                                        onClick = {
                                            searchText = ""
                                            haptics.perform(HilalHapticType.Tap)
                                        },
                                        modifier = Modifier.size(32.dp)
                                    ) {
                                        Icon(
                                            Icons.Default.Clear,
                                            contentDescription = stringResource(R.string.clear),
                                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                            modifier = Modifier.size(16.dp)
                                        )
                                    }
                                }

                                // Cancel button
                                TextButton(
                                    onClick = {
                                        isEditing = false
                                        searchText = if (currentUrl == "about:newtab" || currentUrl == "about:blank") "" else currentUrl
                                    },
                                    contentPadding = PaddingValues(horizontal = 8.dp)
                                ) {
                                    Text(
                                        text = stringResource(R.string.cancel),
                                        style = MaterialTheme.typography.labelMedium,
                                        color = MaterialTheme.colorScheme.primary
                                    )
                                }
                            } else {
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .combinedClickable(
                                            onClick = { isEditing = true },
                                            onLongClick = { copyCurrentUrl() }
                                        )
                                        .padding(vertical = 4.dp),
                                    contentAlignment = Alignment.CenterStart
                                ) {
                                    Text(
                                        text = if (displayUrl.isBlank()) stringResource(R.string.search_or_enter_url_short) else displayUrl,
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = if (displayUrl.isBlank()) MaterialTheme.colorScheme.onSurfaceVariant else MaterialTheme.colorScheme.onSurface,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                }

                                // Quick Copy Button
                                if (displayUrl.isNotBlank()) {
                                    IconButton(
                                        onClick = { copyCurrentUrl() },
                                        modifier = Modifier.size(32.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.ContentCopy,
                                            contentDescription = stringResource(R.string.copy_url),
                                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                            modifier = Modifier.size(16.dp)
                                        )
                                    }
                                }

                                // Reload Button
                                IconButton(
                                    onClick = {
                                        haptics.perform(HilalHapticType.Tap)
                                        onReload()
                                    },
                                    modifier = Modifier.size(32.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Refresh,
                                        contentDescription = stringResource(R.string.refresh),
                                        tint = MaterialTheme.colorScheme.onSurface,
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                            }
                        }

                        // Linear Wavy Progress Indicator anchored inside pill
                        if (isLoading) {
                            LinearWavyProgressIndicator(
                                progress = { loadingProgress },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(6.dp)
                                    .clip(ShapeCache.smoothPill),
                                color = MaterialTheme.colorScheme.primary,
                                trackColor = MaterialTheme.colorScheme.surfaceContainerHighest
                            )
                        }
                    }
                }
            }
        } else {
            // Docked Toolbar (Edge-to-edge top bar)
            Surface(
                color = MaterialTheme.colorScheme.surface,
                modifier = Modifier
                    .fillMaxWidth()
                    .statusBarsPadding()
            ) {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 10.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Surface(
                            color = MaterialTheme.colorScheme.surfaceContainerHigh,
                            shape = ShapeCache.smooth16,
                            modifier = Modifier
                                .weight(1f)
                                .height(46.dp)
                                .then(swipeGestureModifier)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(horizontal = 12.dp),
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                if (isPrivate) {
                                    Surface(
                                        shape = ShapeCache.smoothPill,
                                        color = MaterialTheme.colorScheme.tertiaryContainer,
                                        modifier = Modifier.padding(end = 4.dp)
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.VisibilityOff,
                                                contentDescription = stringResource(R.string.private_mode),
                                                tint = MaterialTheme.colorScheme.onTertiaryContainer,
                                                modifier = Modifier.size(12.dp)
                                            )
                                        }
                                    }
                                } else {
                                    Icon(
                                        imageVector = if (currentUrl.startsWith("https://")) Icons.Default.Lock else Icons.Default.Security,
                                        contentDescription = stringResource(R.string.security),
                                        tint = MaterialTheme.colorScheme.primary,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }

                                if (isEditing) {
                                    BasicTextField(
                                        value = searchText,
                                        onValueChange = { searchText = it },
                                        singleLine = true,
                                        textStyle = MaterialTheme.typography.bodyMedium.copy(
                                            color = MaterialTheme.colorScheme.onSurface
                                        ),
                                        cursorBrush = SolidColor(MaterialTheme.colorScheme.primary),
                                        keyboardOptions = KeyboardOptions(
                                            keyboardType = KeyboardType.Uri,
                                            imeAction = ImeAction.Search
                                        ),
                                        keyboardActions = KeyboardActions(
                                            onSearch = {
                                                val resolved = HilalBangsEngine.resolveUrl(searchText, defaultSearchEngine)
                                                isEditing = false
                                                onNavigate(resolved)
                                            }
                                        ),
                                        modifier = Modifier
                                            .weight(1f)
                                            .focusRequester(focusRequester)
                                    )
                                    LaunchedEffect(Unit) {
                                        focusRequester.requestFocus()
                                    }

                                    if (searchText.isNotBlank()) {
                                        IconButton(
                                            onClick = { copyCurrentUrl(searchText) },
                                            modifier = Modifier.size(28.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.ContentCopy,
                                                contentDescription = stringResource(R.string.copy_url),
                                                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                                modifier = Modifier.size(15.dp)
                                            )
                                        }

                                        IconButton(
                                            onClick = { searchText = "" },
                                            modifier = Modifier.size(28.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.Clear,
                                                contentDescription = stringResource(R.string.clear),
                                                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                                modifier = Modifier.size(15.dp)
                                            )
                                        }
                                    }
                                } else {
                                    Box(
                                        modifier = Modifier
                                            .weight(1f)
                                            .combinedClickable(
                                                onClick = { isEditing = true },
                                                onLongClick = { copyCurrentUrl() }
                                            ),
                                        contentAlignment = Alignment.CenterStart
                                    ) {
                                        Text(
                                            text = if (displayUrl.isBlank()) stringResource(R.string.search_or_enter_url_short) else displayUrl,
                                            style = MaterialTheme.typography.bodyMedium,
                                            color = if (displayUrl.isBlank()) MaterialTheme.colorScheme.onSurfaceVariant else MaterialTheme.colorScheme.onSurface,
                                            maxLines = 1,
                                            overflow = TextOverflow.Ellipsis
                                        )
                                    }

                                    if (displayUrl.isNotBlank()) {
                                        IconButton(
                                            onClick = { copyCurrentUrl() },
                                            modifier = Modifier.size(28.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.ContentCopy,
                                                contentDescription = stringResource(R.string.copy_url),
                                                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                                modifier = Modifier.size(15.dp)
                                            )
                                        }
                                    }
                                }
                            }
                        }

                        if (isEditing) {
                            TextButton(
                                onClick = {
                                    isEditing = false
                                    searchText = if (currentUrl == "about:newtab" || currentUrl == "about:blank") "" else currentUrl
                                }
                            ) {
                                Text(
                                    text = stringResource(R.string.cancel),
                                    style = MaterialTheme.typography.labelMedium,
                                    color = MaterialTheme.colorScheme.primary
                                )
                            }
                        } else {
                            IconButton(
                                onClick = {
                                    haptics.perform(HilalHapticType.Tap)
                                    onReload()
                                },
                                modifier = Modifier.size(40.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Refresh,
                                    contentDescription = stringResource(R.string.refresh),
                                    tint = MaterialTheme.colorScheme.onSurface,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                        }
                    }

                    if (isLoading) {
                        LinearWavyProgressIndicator(
                            progress = { loadingProgress },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(6.dp),
                            color = MaterialTheme.colorScheme.primary,
                            trackColor = MaterialTheme.colorScheme.surfaceContainerHighest
                        )
                    }
                }
            }
        }

        // Live Bangs Autocomplete Tray
        AnimatedVisibility(
            visible = isEditing && matchingBangs.isNotEmpty(),
            enter = fadeIn(HilalMotion.FastFadeSpec),
            exit = fadeOut(HilalMotion.FastFadeSpec)
        ) {
            Surface(
                color = MaterialTheme.colorScheme.surfaceContainerHigh,
                shape = ShapeCache.smooth20,
                shadowElevation = 6.dp,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp, vertical = 4.dp)
            ) {
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(matchingBangs) { bang ->
                        Surface(
                            shape = ShapeCache.smoothPill,
                            color = MaterialTheme.colorScheme.secondaryContainer,
                            modifier = Modifier.bouncyClickable(
                                pressedScale = 0.90f,
                                hapticType = HilalHapticType.Confirm,
                                onClick = {
                                    val parts = searchText.split(" ", limit = 2)
                                    val query = if (parts.size > 1) parts[1] else ""
                                    val newText = "!${bang.prefix} $query"
                                    searchText = newText
                                    val resolved = HilalBangsEngine.resolveUrl(newText, defaultSearchEngine)
                                    isEditing = false
                                    onNavigate(resolved)
                                }
                            )
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "!${bang.prefix}",
                                    style = MaterialTheme.typography.labelMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSecondaryContainer
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = bang.name,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSecondaryContainer.copy(alpha = 0.8f)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
