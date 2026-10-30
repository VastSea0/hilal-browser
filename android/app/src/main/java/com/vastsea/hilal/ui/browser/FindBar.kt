package com.vastsea.hilal.ui.browser

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.ime
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.union
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.outlined.KeyboardArrowDown
import androidx.compose.material.icons.outlined.KeyboardArrowUp
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import com.vastsea.hilal.R
import com.vastsea.hilal.addons.await
import kotlinx.coroutines.launch
import org.mozilla.geckoview.GeckoSession

@Composable
fun FindBar(session: GeckoSession, onClose: () -> Unit) {
    var query by remember { mutableStateOf("") }
    var current by remember { mutableStateOf(0) }
    var total by remember { mutableStateOf(0) }
    val scope = rememberCoroutineScope()
    val focus = remember { FocusRequester() }
    val finder = session.finder

    fun find(backwards: Boolean = false) {
        if (query.isEmpty()) {
            finder.clear()
            current = 0
            total = 0
            return
        }
        scope.launch {
            val result = runCatching {
                finder.find(query, if (backwards) GeckoSession.FINDER_FIND_BACKWARDS else 0).await()
            }.getOrNull()
            current = result?.current ?: 0
            total = result?.total ?: 0
        }
    }

    LaunchedEffect(Unit) {
        finder.displayFlags = GeckoSession.FINDER_DISPLAY_HIGHLIGHT_ALL
        focus.requestFocus()
    }
    DisposableEffect(session) { onDispose { finder.clear() } }

    Surface(
        shape = CircleShape,
        color = MaterialTheme.colorScheme.surfaceContainerHigh,
        shadowElevation = 3.dp,
        modifier = Modifier
            .windowInsetsPadding(WindowInsets.navigationBars.union(WindowInsets.ime))
            .fillMaxWidth()
            .padding(horizontal = BarSidePadding, vertical = BarVerticalPadding)
            .height(BarHeight),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(start = 20.dp, end = 4.dp)) {
            Box(Modifier.weight(1f), contentAlignment = Alignment.CenterStart) {
                if (query.isEmpty()) {
                    Text(stringResource(R.string.find_placeholder), color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                BasicTextField(
                    value = query,
                    onValueChange = {
                        query = it
                        find()
                    },
                    singleLine = true,
                    textStyle = MaterialTheme.typography.bodyLarge.copy(color = MaterialTheme.colorScheme.onSurface),
                    cursorBrush = SolidColor(MaterialTheme.colorScheme.primary),
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                    keyboardActions = KeyboardActions(onSearch = { find() }),
                    modifier = Modifier.fillMaxWidth().focusRequester(focus),
                )
            }
            if (query.isNotEmpty()) {
                Text(
                    stringResource(R.string.find_count, current, total),
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(horizontal = 8.dp),
                )
            }
            IconButton(onClick = { find(backwards = true) }, enabled = total > 0) {
                Icon(Icons.Outlined.KeyboardArrowUp, stringResource(R.string.find_previous))
            }
            IconButton(onClick = { find() }, enabled = total > 0) {
                Icon(Icons.Outlined.KeyboardArrowDown, stringResource(R.string.find_next))
            }
            IconButton(onClick = onClose) {
                Icon(Icons.Outlined.Close, stringResource(R.string.close))
            }
        }
    }
}
