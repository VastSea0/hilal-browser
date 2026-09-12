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
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.vastsea.hilal.R
import com.vastsea.hilal.search.HilalBangsEngine
import com.vastsea.hilal.ui.theme.HilalMotion
import com.vastsea.hilal.ui.theme.ShapeCache
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
    val haptic = LocalHapticFeedback.current

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
    val minSwipeDistancePx = with(density) { 60.dp.toPx() }

    val swipeGestureModifier = if (!isEditing) {
        Modifier.pointerInput(Unit) {
            detectHorizontalDragGestures(
                onDragStart = { horizontalDragAmount = 0f },
                onHorizontalDrag = { _, dragAmount ->
                    horizontalDragAmount += dragAmount
                },
                onDragEnd = {
                    if (abs(horizontalDragAmount) >= minSwipeDistancePx) {
                        haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                        if (horizontalDragAmount > 0) {
                            onSwipePreviousTab?.invoke()
                        } else {
                            onSwipeNextTab?.invoke()
                        }
                    }
                    horizontalDragAmount = 0f
                },
                onDragCancel = { horizontalDragAmount = 0f }
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
                    // M3 Expressive Omnibox Container
                    Surface(
                        color = MaterialTheme.colorScheme.surfaceContainerHigh,
                        shape = if (isFloating) ShapeCache.smoothPill else ShapeCache.smooth16,
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp)
                            .then(swipeGestureModifier)
                            .clickable(enabled = !isEditing) {
                                isEditing = true
                            }
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
                                    IconButton(
                                        onClick = { searchText = "" },
                                        modifier = Modifier.size(24.dp)
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
                        TextButton(
                            onClick = {
                                isEditing = false
                                searchText = if (currentUrl == "about:newtab") "" else currentUrl
                            }
                        ) {
                            Text(stringResource(R.string.cancel))
                        }
                    } else {
                        IconButton(
                            onClick = onReload,
                            colors = IconButtonDefaults.filledTonalIconButtonColors()
                        ) {
                            Icon(
                                imageVector = Icons.Default.Refresh,
                                contentDescription = stringResource(R.string.refresh),
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                }

                // Wavy Progress Indicator for Loading
                if (isLoading) {
                    LinearWavyProgressIndicator(
                        progress = { if (loadingProgress > 0f) loadingProgress else 0.4f },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(4.dp)
                            .padding(horizontal = if (isFloating) 16.dp else 0.dp),
                        color = MaterialTheme.colorScheme.primary,
                        trackColor = MaterialTheme.colorScheme.surfaceContainerHighest
                    )
                }
            }
        }

        // Matching Bangs Suggestion Chips
        AnimatedVisibility(
            visible = isEditing && matchingBangs.isNotEmpty(),
            enter = fadeIn(),
            exit = fadeOut()
        ) {
            Surface(
                color = MaterialTheme.colorScheme.surfaceContainerLow,
                modifier = Modifier.fillMaxWidth()
            ) {
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(matchingBangs) { bang ->
                        AssistChip(
                            onClick = {
                                val query = searchText.removePrefix(bang.prefix).trim()
                                val resolved = HilalBangsEngine.resolveUrl("${bang.prefix} $query")
                                isEditing = false
                                onNavigate(resolved)
                            },
                            shape = ShapeCache.smooth10,
                            label = {
                                Text(
                                    text = "${bang.prefix} (${bang.name})",
                                    style = MaterialTheme.typography.labelMedium,
                                    fontWeight = FontWeight.SemiBold
                                )
                            },
                            leadingIcon = {
                                Icon(
                                    Icons.Default.Bolt,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.size(16.dp)
                                )
                            },
                            colors = AssistChipDefaults.assistChipColors(
                                containerColor = MaterialTheme.colorScheme.surfaceContainerHigh
                            )
                        )
                    }
                }
            }
        }
    }
}
