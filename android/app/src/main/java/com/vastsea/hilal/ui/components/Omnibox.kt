package com.vastsea.hilal.ui.components

import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import android.content.res.Configuration
import androidx.compose.ui.tooling.preview.Preview
import com.vastsea.hilal.ui.theme.HilalTheme
import com.vastsea.hilal.R
import com.vastsea.hilal.search.HilalBangsEngine

@Composable
fun Omnibox(
    currentUrl: String,
    title: String,
    onNavigate: (String) -> Unit,
    onReload: () -> Unit,
    isFloating: Boolean = true,
    modifier: Modifier = Modifier
) {
    var isEditing by remember { mutableStateOf(false) }
    var searchText by remember(currentUrl) { mutableStateOf(if (currentUrl == "about:newtab") "" else currentUrl) }
    val focusRequester = remember { FocusRequester() }

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

    Column(modifier = modifier.fillMaxWidth()) {
        Surface(
            color = MaterialTheme.colorScheme.surface,
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
        ) {
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
                // M3 Expressive Omnibox (Search / URL Bar)
                Surface(
                    color = MaterialTheme.colorScheme.surfaceContainerHigh,
                    shape = if (isFloating) CircleShape else RoundedCornerShape(14.dp),
                    modifier = Modifier
                        .weight(1f)
                        .height(48.dp)
                        .clickable {
                            isEditing = true
                        }
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(horizontal = 16.dp)
                    ) {
                        Icon(
                            imageVector = if (currentUrl.startsWith("https://")) Icons.Default.Lock else Icons.Default.Security,
                            contentDescription = stringResource(R.string.security),
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))

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
                            contentDescription = stringResource(R.string.refresh)
                        )
                    }
                }
            }
        }

        // Dropdown Overlay for Search Suggestions & Bangs
        AnimatedVisibility(
            visible = isEditing,
            enter = fadeIn(),
            exit = fadeOut()
        ) {
            Surface(
                color = MaterialTheme.colorScheme.surfaceContainerHigh,
                shape = RoundedCornerShape(bottomStart = 24.dp, bottomEnd = 24.dp),
                shadowElevation = 8.dp,
                modifier = Modifier
                    .fillMaxWidth()
                    .wrapContentHeight()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    // Hilal Bangs suggestion chips if query starts with '!'
                    if (matchingBangs.isNotEmpty()) {
                        Text(
                            text = stringResource(R.string.bangs_title),
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.primary,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        LazyRow(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            items(matchingBangs) { bang ->
                                SuggestionChip(
                                    onClick = {
                                        searchText = "${bang.prefix} "
                                    },
                                    label = { Text("${bang.prefix} (${bang.name})") },
                                    shape = CircleShape,
                                    colors = SuggestionChipDefaults.suggestionChipColors(
                                        containerColor = MaterialTheme.colorScheme.primaryContainer,
                                        labelColor = MaterialTheme.colorScheme.onPrimaryContainer
                                    )
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                    }

                    // Direct Search suggestion item
                    if (searchText.isNotBlank()) {
                        Surface(
                            shape = RoundedCornerShape(16.dp),
                            color = MaterialTheme.colorScheme.surfaceContainerHighest,
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    val resolved = HilalBangsEngine.resolveUrl(searchText)
                                    isEditing = false
                                    onNavigate(resolved)
                                }
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.padding(14.dp)
                            ) {
                                Icon(
                                    Icons.Default.Search,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.size(20.dp)
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Text(
                                    text = stringResource(R.string.search_query_format, searchText),
                                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium),
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Preview(showBackground = true, name = "Omnibox Light")
@Preview(showBackground = true, uiMode = Configuration.UI_MODE_NIGHT_YES, name = "Omnibox Dark")
@Composable
private fun OmniboxPreview() {
    HilalTheme {
        Box(modifier = Modifier.padding(16.dp)) {
            Omnibox(
                currentUrl = "https://duckduckgo.com",
                title = "DuckDuckGo",
                onNavigate = {},
                onReload = {},
                isFloating = true
            )
        }
    }
}
