@file:OptIn(ExperimentalMaterial3ExpressiveApi::class, ExperimentalFoundationApi::class)

package com.vastsea.hilal.ui.components

import android.app.Activity
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.ContextWrapper
import android.content.Intent
import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.animateContentSize
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.spring
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
import androidx.compose.material.icons.automirrored.filled.ArrowBack
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.TextRange
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.vastsea.hilal.R
import com.vastsea.hilal.search.HilalBangsEngine
import com.vastsea.hilal.ui.theme.*
import kotlin.math.abs

private fun Context.findActivity(): Activity? {
    var ctx = this
    while (ctx is ContextWrapper) {
        if (ctx is Activity) return ctx
        ctx = ctx.baseContext
    }
    return null
}

@Composable
fun Omnibox(
    currentUrl: String,
    title: String,
    onNavigate: (String) -> Unit,
    onReload: () -> Unit,
    onStop: (() -> Unit)? = null,
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
    val keyboardController = LocalSoftwareKeyboardController.current
    val clipboardManager = remember { context.getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager }
    val urlCopiedMessage = stringResource(R.string.url_copied_msg)
    val focusRequester = remember { FocusRequester() }
    val haptics = rememberHilalHaptics()

    var isEditing by remember { mutableStateOf(false) }

    fun normalizeUrlText(url: String): String =
        if (url == "about:newtab" || url == "about:blank") "" else url

    var textFieldValue by remember {
        val initial = normalizeUrlText(currentUrl)
        mutableStateOf(TextFieldValue(text = initial, selection = TextRange(0, initial.length)))
    }

    LaunchedEffect(currentUrl) {
        if (!isEditing) {
            val updated = normalizeUrlText(currentUrl)
            textFieldValue = TextFieldValue(text = updated, selection = TextRange(0, updated.length))
        }
    }

    fun startEditing() {
        val currentText = normalizeUrlText(currentUrl)
        textFieldValue = TextFieldValue(text = currentText, selection = TextRange(0, currentText.length))
        isEditing = true
        haptics.perform(HilalHapticType.Tap)
    }

    fun stopEditing() {
        isEditing = false
        val currentText = normalizeUrlText(currentUrl)
        textFieldValue = TextFieldValue(text = currentText, selection = TextRange(0, currentText.length))
        keyboardController?.hide()
    }

    fun commitNavigation(queryOrUrl: String) {
        val target = queryOrUrl.trim()
        if (target.isNotBlank()) {
            val resolved = HilalBangsEngine.resolveUrl(target, defaultSearchEngine)
            stopEditing()
            onNavigate(resolved)
        }
    }

    LaunchedEffect(isEditing) {
        if (isEditing) {
            focusRequester.requestFocus()
            keyboardController?.show()
        }
    }

    BackHandler(enabled = isEditing) {
        stopEditing()
    }

    val matchingBangs = remember(textFieldValue.text) {
        if (textFieldValue.text.startsWith("!")) HilalBangsEngine.getSuggestions(textFieldValue.text) else emptyList()
    }

    fun copyCurrentUrl(targetUrl: String = currentUrl) {
        if (targetUrl.isNotBlank() && targetUrl != "about:newtab" && targetUrl != "about:blank") {
            clipboardManager?.setPrimaryClip(ClipData.newPlainText("URL", targetUrl))
            haptics.perform(HilalHapticType.Confirm)
            Toast.makeText(context, urlCopiedMessage, Toast.LENGTH_SHORT).show()
        }
    }

    fun shareCurrentUrl() {
        if (currentUrl.isNotBlank() && currentUrl != "about:newtab" && currentUrl != "about:blank") {
            haptics.perform(HilalHapticType.Tap)
            try {
                val sendIntent = Intent(Intent.ACTION_SEND).apply {
                    type = "text/plain"
                    putExtra(Intent.EXTRA_TEXT, currentUrl)
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                val shareIntent = Intent.createChooser(sendIntent, title.ifBlank { currentUrl }).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                val activity = context.findActivity()
                if (activity != null) {
                    activity.startActivity(shareIntent)
                } else {
                    context.startActivity(shareIntent)
                }
            } catch (_: Exception) {
                copyCurrentUrl(currentUrl)
            }
        }
    }

    // Domain & path breakdown for clean, readable URL syntax display
    val parsedUri = remember(currentUrl) {
        try {
            java.net.URI(currentUrl)
        } catch (_: Exception) { null }
    }
    val domain = remember(parsedUri, currentUrl) {
        if (currentUrl == "about:newtab" || currentUrl == "about:blank" || currentUrl.isBlank()) ""
        else parsedUri?.host?.removePrefix("www.")
            ?: currentUrl.removePrefix("https://").removePrefix("http://").substringBefore("/")
    }
    val pathAndQuery = remember(parsedUri, currentUrl, domain) {
        if (domain.isBlank()) ""
        else {
            val clean = currentUrl.removePrefix("https://").removePrefix("http://").removePrefix("www.")
            clean.removePrefix(domain)
        }
    }
    val faviconUrl = remember(domain) {
        if (domain.isNotBlank()) "https://www.google.com/s2/favicons?domain=$domain&sz=128" else null
    }

    // Clipboard suggestion check when in edit mode
    val clipboardUrl = remember(isEditing) {
        if (isEditing) {
            try {
                val item = clipboardManager?.primaryClip?.getItemAt(0)?.text?.toString()?.trim()
                if (!item.isNullOrBlank() && item != currentUrl && (item.startsWith("http://") || item.startsWith("https://") || (item.contains(".") && !item.contains(" ")))) {
                    item
                } else null
            } catch (_: Exception) { null }
        } else null
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

    Column(modifier = modifier.fillMaxWidth()) {
        if (isFloating) {
            // Floating Toolbar Pill
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .statusBarsPadding()
                    .padding(horizontal = 14.dp, vertical = 6.dp)
            ) {
                val pillBorderColor by animateColorAsState(
                    targetValue = if (isEditing)
                        MaterialTheme.colorScheme.primary.copy(alpha = 0.65f)
                    else
                        MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.35f),
                    animationSpec = spring(
                        dampingRatio = Spring.DampingRatioNoBouncy,
                        stiffness = Spring.StiffnessMediumLow
                    ),
                    label = "pillBorder"
                )
                val pillElevation by animateDpAsState(
                    targetValue = if (isEditing) 8.dp else 3.dp,
                    animationSpec = spring(
                        dampingRatio = Spring.DampingRatioNoBouncy,
                        stiffness = Spring.StiffnessMediumLow
                    ),
                    label = "pillElevation"
                )
                Surface(
                    shape = ShapeCache.smoothPill,
                    color = MaterialTheme.colorScheme.surfaceContainerHigh,
                    shadowElevation = pillElevation,
                    border = BorderStroke(1.dp, pillBorderColor),
                    modifier = Modifier
                        .fillMaxWidth()
                        .animateContentSize(
                            animationSpec = spring(
                                dampingRatio = Spring.DampingRatioMediumBouncy,
                                stiffness = Spring.StiffnessMediumLow
                            )
                        )
                        .then(swipeGestureModifier)
                ) {
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(52.dp)
                                .padding(horizontal = 8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            if (isEditing) {
                                // EDIT MODE: Back Arrow to Cancel
                                IconButton(
                                    onClick = {
                                        haptics.perform(HilalHapticType.Tap)
                                        stopEditing()
                                    },
                                    modifier = Modifier.size(36.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                        contentDescription = stringResource(R.string.cancel),
                                        tint = MaterialTheme.colorScheme.onSurface,
                                        modifier = Modifier.size(20.dp)
                                    )
                                }

                                // Full-width Text Input
                                BasicTextField(
                                    value = textFieldValue,
                                    onValueChange = { textFieldValue = it },
                                    singleLine = true,
                                    textStyle = MaterialTheme.typography.bodyLarge.copy(
                                        color = MaterialTheme.colorScheme.onSurface,
                                        fontSize = 16.sp
                                    ),
                                    cursorBrush = SolidColor(MaterialTheme.colorScheme.primary),
                                    keyboardOptions = KeyboardOptions(
                                        keyboardType = KeyboardType.Uri,
                                        imeAction = ImeAction.Go
                                    ),
                                    keyboardActions = KeyboardActions(
                                        onGo = { commitNavigation(textFieldValue.text) }
                                    ),
                                    modifier = Modifier
                                        .weight(1f)
                                        .padding(horizontal = 8.dp)
                                        .focusRequester(focusRequester),
                                    decorationBox = { innerTextField ->
                                        Box(contentAlignment = Alignment.CenterStart) {
                                            if (textFieldValue.text.isEmpty()) {
                                                Text(
                                                    text = stringResource(R.string.search_or_enter_url_short),
                                                    style = MaterialTheme.typography.bodyLarge,
                                                    fontSize = 16.sp,
                                                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
                                                )
                                            }
                                            innerTextField()
                                        }
                                    }
                                )

                                // Clear Button when there is text
                                if (textFieldValue.text.isNotEmpty()) {
                                    IconButton(
                                        onClick = {
                                            haptics.perform(HilalHapticType.Tap)
                                            textFieldValue = TextFieldValue("", TextRange.Zero)
                                        },
                                        modifier = Modifier.size(36.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Clear,
                                            contentDescription = stringResource(R.string.clear),
                                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                            modifier = Modifier.size(18.dp)
                                        )
                                    }
                                }
                            } else {
                                // NORMAL MODE: Left Site Identity & Security Chip
                                if (isPrivate) {
                                    Surface(
                                        shape = ShapeCache.smoothPill,
                                        color = MaterialTheme.colorScheme.tertiaryContainer,
                                        modifier = Modifier.padding(start = 4.dp, end = 6.dp)
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
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
                                                fontWeight = FontWeight.Bold,
                                                color = MaterialTheme.colorScheme.onTertiaryContainer
                                            )
                                        }
                                    }
                                } else if (!faviconUrl.isNullOrBlank()) {
                                    Surface(
                                        shape = ShapeCache.smoothPill,
                                        color = MaterialTheme.colorScheme.surfaceContainerHighest,
                                        modifier = Modifier.padding(start = 4.dp, end = 6.dp)
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 4.dp),
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            AsyncImage(
                                                model = faviconUrl,
                                                contentDescription = null,
                                                modifier = Modifier
                                                    .size(16.dp)
                                                    .clip(ShapeCache.smoothPill)
                                            )
                                            if (currentUrl.startsWith("https://")) {
                                                Spacer(modifier = Modifier.width(4.dp))
                                                Icon(
                                                    imageVector = Icons.Default.Lock,
                                                    contentDescription = stringResource(R.string.security),
                                                    tint = MaterialTheme.colorScheme.primary,
                                                    modifier = Modifier.size(11.dp)
                                                )
                                            }
                                        }
                                    }
                                } else {
                                    Box(
                                        modifier = Modifier
                                            .padding(start = 4.dp, end = 6.dp)
                                            .size(32.dp),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            imageVector = if (currentUrl.startsWith("https://")) Icons.Default.Lock else Icons.Default.Search,
                                            contentDescription = null,
                                            tint = MaterialTheme.colorScheme.primary,
                                            modifier = Modifier.size(16.dp)
                                        )
                                    }
                                }

                                // Center Domain & Path Display
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .combinedClickable(
                                            onClick = { startEditing() },
                                            onLongClick = { copyCurrentUrl() }
                                        )
                                        .padding(vertical = 8.dp),
                                    contentAlignment = Alignment.CenterStart
                                ) {
                                    if (domain.isBlank()) {
                                        Text(
                                            text = stringResource(R.string.search_or_enter_url_short),
                                            style = MaterialTheme.typography.bodyMedium,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                                            maxLines = 1,
                                            overflow = TextOverflow.Ellipsis
                                        )
                                    } else {
                                        Row(
                                            verticalAlignment = Alignment.CenterVertically,
                                            modifier = Modifier.fillMaxWidth()
                                        ) {
                                            Text(
                                                text = domain,
                                                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                                                color = MaterialTheme.colorScheme.onSurface,
                                                maxLines = 1
                                            )
                                            if (pathAndQuery.isNotBlank() && pathAndQuery != "/") {
                                                Text(
                                                    text = pathAndQuery,
                                                    style = MaterialTheme.typography.bodySmall,
                                                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.65f),
                                                    maxLines = 1,
                                                    overflow = TextOverflow.Ellipsis
                                                )
                                            }
                                        }
                                    }
                                }

                                // Right-side Action Parking
                                if (isLoading) {
                                    IconButton(
                                        onClick = {
                                            haptics.perform(HilalHapticType.Reject)
                                            onStop?.invoke()
                                        },
                                        modifier = Modifier.size(34.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Close,
                                            contentDescription = stringResource(R.string.stop_loading),
                                            tint = MaterialTheme.colorScheme.primary,
                                            modifier = Modifier.size(18.dp)
                                        )
                                    }
                                } else {
                                    if (domain.isNotBlank()) {
                                        IconButton(
                                            onClick = { shareCurrentUrl() },
                                            modifier = Modifier.size(32.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.Share,
                                                contentDescription = stringResource(R.string.share),
                                                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                                modifier = Modifier.size(17.dp)
                                            )
                                        }
                                    }

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
                                            modifier = Modifier.size(17.dp)
                                        )
                                    }
                                }
                            }
                        }

                        // Linear Wavy Progress Indicator anchored inside pill
                        if (isLoading) {
                            LinearWavyProgressIndicator(
                                progress = { loadingProgress },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(3.dp)
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
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            color = MaterialTheme.colorScheme.surfaceContainerHigh,
                            shape = ShapeCache.smooth16,
                            modifier = Modifier
                                .weight(1f)
                                .height(48.dp)
                                .then(swipeGestureModifier)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(horizontal = 8.dp)
                            ) {
                                if (isEditing) {
                                    IconButton(
                                        onClick = {
                                            haptics.perform(HilalHapticType.Tap)
                                            stopEditing()
                                        },
                                        modifier = Modifier.size(34.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                            contentDescription = stringResource(R.string.cancel),
                                            tint = MaterialTheme.colorScheme.onSurface,
                                            modifier = Modifier.size(18.dp)
                                        )
                                    }

                                    BasicTextField(
                                        value = textFieldValue,
                                        onValueChange = { textFieldValue = it },
                                        singleLine = true,
                                        textStyle = MaterialTheme.typography.bodyLarge.copy(
                                            color = MaterialTheme.colorScheme.onSurface,
                                            fontSize = 15.sp
                                        ),
                                        cursorBrush = SolidColor(MaterialTheme.colorScheme.primary),
                                        keyboardOptions = KeyboardOptions(
                                            keyboardType = KeyboardType.Uri,
                                            imeAction = ImeAction.Go
                                        ),
                                        keyboardActions = KeyboardActions(
                                            onGo = { commitNavigation(textFieldValue.text) }
                                        ),
                                        modifier = Modifier
                                            .weight(1f)
                                            .padding(horizontal = 6.dp)
                                            .focusRequester(focusRequester),
                                        decorationBox = { innerTextField ->
                                            Box(contentAlignment = Alignment.CenterStart) {
                                                if (textFieldValue.text.isEmpty()) {
                                                    Text(
                                                        text = stringResource(R.string.search_or_enter_url_short),
                                                        style = MaterialTheme.typography.bodyLarge,
                                                        fontSize = 15.sp,
                                                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
                                                    )
                                                }
                                                innerTextField()
                                            }
                                        }
                                    )

                                    if (textFieldValue.text.isNotEmpty()) {
                                        IconButton(
                                            onClick = {
                                                haptics.perform(HilalHapticType.Tap)
                                                textFieldValue = TextFieldValue("", TextRange.Zero)
                                            },
                                            modifier = Modifier.size(32.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.Clear,
                                                contentDescription = stringResource(R.string.clear),
                                                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                                modifier = Modifier.size(16.dp)
                                            )
                                        }
                                    }
                                } else {
                                    if (isPrivate) {
                                        Surface(
                                            shape = ShapeCache.smoothPill,
                                            color = MaterialTheme.colorScheme.tertiaryContainer,
                                            modifier = Modifier.padding(end = 4.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.VisibilityOff,
                                                contentDescription = stringResource(R.string.private_mode),
                                                tint = MaterialTheme.colorScheme.onTertiaryContainer,
                                                modifier = Modifier
                                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                                                    .size(12.dp)
                                            )
                                        }
                                    } else if (!faviconUrl.isNullOrBlank()) {
                                        AsyncImage(
                                            model = faviconUrl,
                                            contentDescription = null,
                                            modifier = Modifier
                                                .padding(end = 4.dp)
                                                .size(16.dp)
                                                .clip(ShapeCache.smoothPill)
                                        )
                                    } else {
                                        Icon(
                                            imageVector = if (currentUrl.startsWith("https://")) Icons.Default.Lock else Icons.Default.Search,
                                            contentDescription = null,
                                            tint = MaterialTheme.colorScheme.primary,
                                            modifier = Modifier
                                                .padding(end = 4.dp)
                                                .size(16.dp)
                                        )
                                    }

                                    Box(
                                        modifier = Modifier
                                            .weight(1f)
                                            .combinedClickable(
                                                onClick = { startEditing() },
                                                onLongClick = { copyCurrentUrl() }
                                            ),
                                        contentAlignment = Alignment.CenterStart
                                    ) {
                                        if (domain.isBlank()) {
                                            Text(
                                                text = stringResource(R.string.search_or_enter_url_short),
                                                style = MaterialTheme.typography.bodyMedium,
                                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                                maxLines = 1,
                                                overflow = TextOverflow.Ellipsis
                                            )
                                        } else {
                                            Row(verticalAlignment = Alignment.CenterVertically) {
                                                Text(
                                                    text = domain,
                                                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                                                    color = MaterialTheme.colorScheme.onSurface,
                                                    maxLines = 1
                                                )
                                                if (pathAndQuery.isNotBlank() && pathAndQuery != "/") {
                                                    Text(
                                                        text = pathAndQuery,
                                                        style = MaterialTheme.typography.bodySmall,
                                                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.65f),
                                                        maxLines = 1,
                                                        overflow = TextOverflow.Ellipsis
                                                    )
                                                }
                                            }
                                        }
                                    }

                                    if (isLoading) {
                                        IconButton(
                                            onClick = {
                                                haptics.perform(HilalHapticType.Reject)
                                                onStop?.invoke()
                                            },
                                            modifier = Modifier.size(28.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.Close,
                                                contentDescription = stringResource(R.string.stop_loading),
                                                tint = MaterialTheme.colorScheme.primary,
                                                modifier = Modifier.size(16.dp)
                                            )
                                        }
                                    } else {
                                        if (domain.isNotBlank()) {
                                            IconButton(
                                                onClick = { shareCurrentUrl() },
                                                modifier = Modifier.size(28.dp)
                                            ) {
                                                Icon(
                                                    imageVector = Icons.Default.Share,
                                                    contentDescription = stringResource(R.string.share),
                                                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                                    modifier = Modifier.size(15.dp)
                                                )
                                            }
                                        }

                                        IconButton(
                                            onClick = {
                                                haptics.perform(HilalHapticType.Tap)
                                                onReload()
                                            },
                                            modifier = Modifier.size(28.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.Refresh,
                                                contentDescription = stringResource(R.string.refresh),
                                                tint = MaterialTheme.colorScheme.onSurface,
                                                modifier = Modifier.size(16.dp)
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (isLoading) {
                        LinearWavyProgressIndicator(
                            progress = { loadingProgress },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(3.dp),
                            color = MaterialTheme.colorScheme.primary,
                            trackColor = MaterialTheme.colorScheme.surfaceContainerHighest
                        )
                    }
                }
            }
        }

        // Quick Actions Tray in Edit Mode: Copy, Share, Paste
        AnimatedVisibility(
            visible = isEditing,
            enter = fadeIn(HilalMotion.FastFadeSpec),
            exit = fadeOut(HilalMotion.FastFadeSpec)
        ) {
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                if (currentUrl.isNotBlank() && currentUrl != "about:newtab" && currentUrl != "about:blank") {
                    item {
                        OmniboxActionChip(
                            icon = Icons.Default.ContentCopy,
                            label = stringResource(R.string.copy_url),
                            onClick = { copyCurrentUrl(currentUrl) }
                        )
                    }
                    item {
                        OmniboxActionChip(
                            icon = Icons.Default.Share,
                            label = stringResource(R.string.share),
                            onClick = { shareCurrentUrl() }
                        )
                    }
                }

                if (!clipboardUrl.isNullOrBlank()) {
                    item {
                        OmniboxActionChip(
                            icon = Icons.Default.ContentPaste,
                            label = stringResource(R.string.paste_from_clipboard, clipboardUrl.take(24)),
                            isPrimary = true,
                            onClick = { commitNavigation(clipboardUrl) }
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
                                    val parts = textFieldValue.text.split(" ", limit = 2)
                                    val query = if (parts.size > 1) parts[1] else ""
                                    val newText = "!${bang.prefix} $query"
                                    commitNavigation(newText)
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

@Composable
private fun OmniboxActionChip(
    icon: ImageVector,
    label: String,
    isPrimary: Boolean = false,
    onClick: () -> Unit
) {
    val haptics = rememberHilalHaptics()
    Surface(
        shape = ShapeCache.smoothPill,
        color = if (isPrimary) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceContainerHigh,
        border = BorderStroke(
            1.dp,
            if (isPrimary) MaterialTheme.colorScheme.primary.copy(alpha = 0.5f) else MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.35f)
        ),
        modifier = Modifier.bouncyClickable(
            pressedScale = 0.94f,
            hapticType = HilalHapticType.Tap,
            onClick = {
                haptics.perform(HilalHapticType.Confirm)
                onClick()
            }
        )
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = if (isPrimary) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(15.dp)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = label,
                style = MaterialTheme.typography.labelMedium,
                fontWeight = FontWeight.Medium,
                color = if (isPrimary) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}
