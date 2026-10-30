package com.vastsea.hilal.ui.browser

import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.ime
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.union
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
import androidx.compose.material.icons.outlined.Bookmark
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.outlined.History
import androidx.compose.material.icons.outlined.NorthWest
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material.icons.outlined.Bolt
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.TextRange
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.vastsea.hilal.AppContainer
import com.vastsea.hilal.R
import com.vastsea.hilal.search.InputResolver
import com.vastsea.hilal.search.SearchEngines
import com.vastsea.hilal.search.Suggestion
import kotlinx.coroutines.delay

/**
 * Full-screen address entry. The field sits at the bottom, where the bar was and where the
 * thumb is; suggestions stack upward from it, best match closest to the field.
 */
@Composable
fun AddressEditor(
    container: AppContainer,
    currentUrl: String,
    initialText: String?,
    isPrivate: Boolean,
    onSubmit: (url: String) -> Unit,
    onDismiss: () -> Unit,
) {
    val settings by container.settings.settings.collectAsState()
    val engine = SearchEngines.byName(settings.searchEngine)
    val start = initialText ?: currentUrl
    var field by remember {
        mutableStateOf(TextFieldValue(start, selection = TextRange(if (initialText != null) start.length else 0, start.length)))
    }
    var suggestions by remember { mutableStateOf<List<Suggestion>>(emptyList()) }
    val focus = remember { FocusRequester() }
    val text = field.text
    val editingCurrent = text == currentUrl && text.isNotEmpty()

    LaunchedEffect(Unit) { focus.requestFocus() }
    LaunchedEffect(text, engine, settings.searchSuggestions) {
        if (editingCurrent || text.isBlank()) {
            suggestions = emptyList()
            return@LaunchedEffect
        }
        delay(90)
        // Remote suggestions are skipped in private tabs: typing there should stay on the device.
        suggestions = container.suggestions.suggest(text, engine, settings.searchSuggestions && !isPrivate)
    }

    fun submit(input: String) {
        if (input.isBlank()) return
        onSubmit(InputResolver.resolve(input, engine))
    }

    Surface(color = MaterialTheme.colorScheme.surfaceContainerLow, modifier = Modifier.fillMaxSize()) {
        Column(
            Modifier
                .fillMaxSize()
                .windowInsetsPadding(WindowInsets.statusBars.union(WindowInsets.navigationBars).union(WindowInsets.ime))
        ) {
            LazyColumn(
                reverseLayout = true,
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(2.dp, Alignment.Bottom),
                modifier = Modifier.weight(1f).fillMaxWidth(),
            ) {
                if (text.isNotBlank() && !editingCurrent && !text.trimStart().startsWith("!")) {
                    item(key = "search") {
                        SuggestionRow(
                            icon = Icons.Outlined.Search,
                            title = text.trim(),
                            subtitle = stringResource(R.string.search_with, engine.name),
                            onClick = { submit(text) },
                        )
                    }
                }
                items(suggestions, key = { it.key() }) { suggestion ->
                    when (suggestion) {
                        is Suggestion.Page -> SuggestionRow(
                            icon = if (suggestion.isBookmark) Icons.Outlined.Bookmark else Icons.Outlined.History,
                            title = suggestion.title.ifBlank { InputResolver.displayUrl(suggestion.url) },
                            subtitle = InputResolver.displayUrl(suggestion.url),
                            onClick = { onSubmit(suggestion.url) },
                        )
                        is Suggestion.Query -> SuggestionRow(
                            icon = Icons.Outlined.Search,
                            title = suggestion.text,
                            subtitle = null,
                            onClick = { submit(suggestion.text) },
                            onFill = { field = TextFieldValue(suggestion.text + " ", TextRange(suggestion.text.length + 1)) },
                        )
                        is Suggestion.BangHint -> SuggestionRow(
                            icon = Icons.Outlined.Bolt,
                            title = stringResource(R.string.bang_hint, suggestion.bang.trigger, suggestion.bang.name),
                            subtitle = null,
                            onClick = {
                                val filled = "!${suggestion.bang.trigger} "
                                field = TextFieldValue(filled, TextRange(filled.length))
                            },
                        )
                    }
                }
            }
            InputField(
                value = field,
                onValueChange = { field = it },
                onSubmit = { submit(field.text) },
                onClear = { field = TextFieldValue("") },
                onBack = onDismiss,
                isPrivate = isPrivate,
                focus = focus,
            )
        }
    }
}

private fun Suggestion.key(): String = when (this) {
    is Suggestion.Page -> "p:$url"
    is Suggestion.Query -> "q:$text"
    is Suggestion.BangHint -> "b:${bang.trigger}"
}

@Composable
private fun InputField(
    value: TextFieldValue,
    onValueChange: (TextFieldValue) -> Unit,
    onSubmit: () -> Unit,
    onClear: () -> Unit,
    onBack: () -> Unit,
    isPrivate: Boolean,
    focus: FocusRequester,
) {
    Surface(
        shape = CircleShape,
        color = if (isPrivate) MaterialTheme.colorScheme.tertiaryContainer else MaterialTheme.colorScheme.surfaceContainerHighest,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = BarSidePadding, vertical = BarVerticalPadding)
            .height(BarHeight),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(horizontal = 4.dp)) {
            IconButton(onClick = onBack) {
                Icon(Icons.AutoMirrored.Outlined.ArrowBack, contentDescription = stringResource(R.string.close))
            }
            Box(Modifier.weight(1f), contentAlignment = Alignment.CenterStart) {
                if (value.text.isEmpty()) {
                    Text(
                        stringResource(R.string.address_placeholder),
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                BasicTextField(
                    value = value,
                    onValueChange = onValueChange,
                    singleLine = true,
                    textStyle = MaterialTheme.typography.bodyLarge.copy(color = MaterialTheme.colorScheme.onSurface),
                    cursorBrush = SolidColor(MaterialTheme.colorScheme.primary),
                    keyboardOptions = KeyboardOptions(
                        keyboardType = KeyboardType.Uri,
                        imeAction = ImeAction.Go,
                        autoCorrectEnabled = false,
                    ),
                    keyboardActions = KeyboardActions(onGo = { onSubmit() }),
                    modifier = Modifier.fillMaxWidth().focusRequester(focus),
                )
            }
            if (value.text.isNotEmpty()) {
                IconButton(onClick = onClear) {
                    Icon(Icons.Outlined.Close, contentDescription = stringResource(R.string.clear_text))
                }
            }
        }
    }
}

@Composable
private fun SuggestionRow(
    icon: ImageVector,
    title: String,
    subtitle: String?,
    onClick: () -> Unit,
    onFill: (() -> Unit)? = null,
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .clickable(onClick = onClick)
            .padding(start = 16.dp, end = 4.dp, top = 10.dp, bottom = 10.dp)
            .animateContentSize(MaterialTheme.motionScheme.fastSpatialSpec()),
    ) {
        Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.size(20.dp))
        Spacer(Modifier.width(16.dp))
        Column(Modifier.weight(1f)) {
            Text(title, style = MaterialTheme.typography.bodyLarge, maxLines = 1, overflow = TextOverflow.Ellipsis)
            if (subtitle != null) {
                Text(
                    subtitle,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
        }
        if (onFill != null) {
            IconButton(onClick = onFill) {
                Icon(Icons.Outlined.NorthWest, contentDescription = stringResource(R.string.fill_in))
            }
        } else {
            Spacer(Modifier.width(12.dp))
        }
    }
}
