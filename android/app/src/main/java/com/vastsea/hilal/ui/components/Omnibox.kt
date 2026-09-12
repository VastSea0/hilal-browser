@file:OptIn(ExperimentalMaterial3ExpressiveApi::class)

package com.vastsea.hilal.ui.components

import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
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
    onSwipePreviousTab: (() -> Unit)? = null,
    onSwipeNextTab: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    var isEditing by remember { mutableStateOf(false) }
    var searchText by remember(currentUrl) { mutableStateOf(if (currentUrl == "about:newtab") "" else currentUrl) }
    val focusRequester = remember { FocusRequester() }
    val haptics = rememberHilalHaptics()

    LaunchedEffect(currentUrl) {
        if (currentUrl != "about:newtab") {
            searchText = currentUrl
            isEditing = false
        }
    }

    BackHandler(enabled = isEditing) {
        isEditing = false
        searchText = if (currentUrl == "about:newtab") "" else currentUrl
    }

    val matchingBangs = remember(searchText) {
        if (searchText.startsWith("!")) HilalBangsEngine.getSuggestions(searchText) else emptyList()
    }

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

    Column(modifier = modifier.fillMaxWidth()) {
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
                        .padding(
                            horizontal = if (isFloating) 16.dp else 10.dp,
                            vertical = if (isFloating) 8.dp else 4.dp
                        ),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // M3 Expressive Omnibox Container with Bouncy Interaction
                    Surface(
                        color = MaterialTheme.colorScheme.surfaceContainerHigh,
                        shape = if (isFloating) ShapeCache.smoothPill else ShapeCache.smooth16,
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp)
                            .then(swipeGestureModifier)
                            .then(
                                if (!isEditing) {
                                    Modifier.bouncyClickable(
                                        pressedScale = 0.97f,
                                        hapticType = HilalHapticType.Tap,
                                        onClick = { isEditing = true }
                                    )
                                } else Modifier
                            )
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(horizontal = 16.dp)
                        ) {
                            if (isPrivate) {
                                Surface(
                                    shape = ShapeCache.smoothPill,
                                    color = MaterialTheme.colorScheme.tertiaryContainer,
                                    modifier = Modifier.padding(end = 8.dp)
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.VisibilityOff,
                                            contentDescription = stringResource(R.string.private_mode),
                                            tint = MaterialTheme.colorScheme.onTertiaryContainer,
                                            modifier = Modifier.size(14.dp)
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
                                    tint = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(10.dp))
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
                                            val resolved = HilalBangsEngine.resolveUrl(searchText)
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
                                if (searchText.isNotEmpty()) {
                                    Box(
                                        modifier = Modifier
                                            .size(28.dp)
                                            .bouncyClickable(
                                                pressedScale = 0.82f,
                                                hapticType = HilalHapticType.Tap,
                                                onClick = { searchText = "" }
                                            ),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            Icons.Default.Clear,
                                            contentDescription = stringResource(R.string.clear),
                                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                            modifier = Modifier.size(16.dp)
                                        )
                                    }
                                }
                            } else {
                                Text(
                                    text = if (currentUrl == "about:newtab") stringResource(R.string.search_or_enter_url_short) else currentUrl,
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = if (currentUrl == "about:newtab") MaterialTheme.colorScheme.onSurfaceVariant else MaterialTheme.colorScheme.onSurface,
                                    maxLines = 1,
                                    modifier = Modifier.weight(1f)
                                )
                            }
                        }
                    }

                    if (isEditing) {
                        Surface(
                            shape = ShapeCache.smoothPill,
                            color = MaterialTheme.colorScheme.surfaceContainerHigh,
                            modifier = Modifier.bouncyClickable(
                                pressedScale = 0.90f,
                                hapticType = HilalHapticType.Tap,
                                onClick = {
                                    isEditing = false
                                    searchText = if (currentUrl == "about:newtab") "" else currentUrl
                                }
                            )
                        ) {
                            Text(
                                text = stringResource(R.string.cancel),
                                style = MaterialTheme.typography.labelLarge,
                                color = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
                            )
                        }
                    } else {
                        Surface(
                            shape = ShapeCache.smooth14,
                            color = MaterialTheme.colorScheme.surfaceContainerHigh,
                            modifier = Modifier
                                .size(44.dp)
                                .bouncyClickable(
                                    pressedScale = 0.88f,
                                    hapticType = HilalHapticType.Tap,
                                    onClick = onReload
                                )
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    imageVector = Icons.Default.Refresh,
                                    contentDescription = stringResource(R.string.refresh),
                                    tint = MaterialTheme.colorScheme.onSurface,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                        }
                    }
                }

                // Wavy Progress Indicator for Loading
                if (isLoading) {
                    LinearWavyProgressIndicator(
                        progress = { loadingProgress },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 8.dp),
                        color = MaterialTheme.colorScheme.primary,
                        trackColor = MaterialTheme.colorScheme.surfaceContainerHighest
                    )
                }
            }
        }

        // Bangs live autocomplete tray
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
                    .padding(horizontal = 16.dp, vertical = 6.dp)
            ) {
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp),
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
                                    val resolved = HilalBangsEngine.resolveUrl(newText)
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
