package com.vastsea.hilal.ui.browser

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ContentCopy
import androidx.compose.material.icons.outlined.Download
import androidx.compose.material.icons.outlined.Image
import androidx.compose.material.icons.outlined.OpenInNew
import androidx.compose.material.icons.outlined.Share
import androidx.compose.material.icons.outlined.VisibilityOff
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Checkbox
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.vastsea.hilal.AppContainer
import com.vastsea.hilal.R
import com.vastsea.hilal.browser.PageRequest
import org.mozilla.geckoview.GeckoSession.PermissionDelegate
import org.mozilla.geckoview.GeckoSession.PromptDelegate

/** Shows the oldest open request of the selected tab. Other tabs' requests wait until selected. */
@Composable
fun PageRequestHost(container: AppContainer, selectedTabId: String?) {
    val store = container.tabs
    val requests by store.requests.collectAsState()
    val request = requests.firstOrNull { it.tabId == selectedTabId } ?: return
    fun done() = store.resolve(request)

    when (request) {
        is PageRequest.Alert -> MessageDialog(request.prompt.title, request.prompt.message, onConfirm = { request.ok(); done() }, onDismiss = { request.dismiss(); done() })
        is PageRequest.Confirm -> ConfirmDialog(
            title = request.prompt.title, message = request.prompt.message.orEmpty(),
            confirm = stringResource(R.string.ok), dismiss = stringResource(R.string.cancel),
            onAnswer = { request.answer(it); done() },
        )
        is PageRequest.Text -> TextPromptDialog(request) { done() }
        is PageRequest.Auth -> AuthDialog(request) { done() }
        is PageRequest.Choice -> ChoiceDialog(request) { done() }
        is PageRequest.Leave -> ConfirmDialog(
            title = stringResource(R.string.leave_page_title), message = stringResource(R.string.leave_page_body),
            confirm = stringResource(R.string.leave), dismiss = stringResource(R.string.stay),
            onAnswer = { request.answer(it); done() },
        )
        is PageRequest.Repost -> ConfirmDialog(
            title = stringResource(R.string.repost_title), message = stringResource(R.string.repost_body),
            confirm = stringResource(R.string.resend), dismiss = stringResource(R.string.cancel),
            onAnswer = { request.answer(it); done() },
        )
        is PageRequest.Popup -> ConfirmDialog(
            title = stringResource(R.string.popup_title),
            message = stringResource(R.string.popup_body, request.prompt.targetUri ?: ""),
            confirm = stringResource(R.string.allow), dismiss = stringResource(R.string.block),
            onAnswer = { request.answer(it); done() },
        )
        is PageRequest.File -> FilePicker(request) { done() }
        is PageRequest.Permission -> ConfirmDialog(
            title = stringResource(permissionText(request.kind), request.host), message = "",
            confirm = stringResource(R.string.allow), dismiss = stringResource(R.string.block),
            onAnswer = { request.answer(it); done() },
        )
        is PageRequest.Media -> ConfirmDialog(
            title = stringResource(
                when {
                    request.video != null && request.audio != null -> R.string.permission_camera_microphone
                    request.video != null -> R.string.permission_camera
                    else -> R.string.permission_microphone
                },
                request.host,
            ),
            message = "",
            confirm = stringResource(R.string.allow), dismiss = stringResource(R.string.block),
            onAnswer = { request.answer(it); done() },
        )
        is PageRequest.ContextMenu -> ContextMenuSheet(container, request) { done() }
    }
}

private fun permissionText(kind: Int) = when (kind) {
    PermissionDelegate.PERMISSION_GEOLOCATION -> R.string.permission_location
    PermissionDelegate.PERMISSION_DESKTOP_NOTIFICATION -> R.string.permission_notifications
    PermissionDelegate.PERMISSION_MEDIA_KEY_SYSTEM_ACCESS -> R.string.permission_drm
    PermissionDelegate.PERMISSION_STORAGE_ACCESS -> R.string.permission_storage_access
    else -> R.string.permission_xr
}

/** A nullable composable text slot; null hides the slot. */
private fun textSlot(text: String?): (@Composable () -> Unit)? =
    if (text.isNullOrBlank()) null else { { Text(text) } }

@Composable
private fun MessageDialog(title: String?, message: String?, onConfirm: () -> Unit, onDismiss: () -> Unit) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = textSlot(title),
        text = textSlot(message),
        confirmButton = { TextButton(onClick = onConfirm) { Text(stringResource(R.string.ok)) } },
    )
}

@Composable
private fun ConfirmDialog(title: String?, message: String, confirm: String, dismiss: String, onAnswer: (Boolean) -> Unit) {
    AlertDialog(
        onDismissRequest = { onAnswer(false) },
        title = textSlot(title),
        text = textSlot(message),
        confirmButton = { TextButton(onClick = { onAnswer(true) }) { Text(confirm) } },
        dismissButton = { TextButton(onClick = { onAnswer(false) }) { Text(dismiss) } },
    )
}

@Composable
private fun TextPromptDialog(request: PageRequest.Text, done: () -> Unit) {
    var value by remember { mutableStateOf(request.prompt.defaultValue.orEmpty()) }
    AlertDialog(
        onDismissRequest = { request.dismiss(); done() },
        title = textSlot(request.prompt.title),
        text = {
            Column {
                val message = request.prompt.message
                if (!message.isNullOrBlank()) {
                    Text(message)
                    Spacer(Modifier.height(12.dp))
                }
                OutlinedTextField(value = value, onValueChange = { value = it }, singleLine = true)
            }
        },
        confirmButton = { TextButton(onClick = { request.answer(value); done() }) { Text(stringResource(R.string.ok)) } },
        dismissButton = { TextButton(onClick = { request.dismiss(); done() }) { Text(stringResource(R.string.cancel)) } },
    )
}

@Composable
private fun AuthDialog(request: PageRequest.Auth, done: () -> Unit) {
    var user by remember { mutableStateOf(request.prompt.authOptions.username.orEmpty()) }
    var password by remember { mutableStateOf(request.prompt.authOptions.password.orEmpty()) }
    val host = request.prompt.authOptions.uri?.let { android.net.Uri.parse(it).host } ?: ""
    AlertDialog(
        onDismissRequest = { request.dismiss(); done() },
        title = { Text(stringResource(R.string.sign_in_to, host)) },
        text = {
            Column {
                val message = request.prompt.message
                if (!message.isNullOrBlank()) {
                    Text(message)
                    Spacer(Modifier.height(12.dp))
                }
                if (!request.passwordOnly) {
                    OutlinedTextField(value = user, onValueChange = { user = it }, label = { Text(stringResource(R.string.username)) }, singleLine = true)
                    Spacer(Modifier.height(8.dp))
                }
                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = { Text(stringResource(R.string.password)) },
                    singleLine = true,
                    visualTransformation = PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                )
            }
        },
        confirmButton = { TextButton(onClick = { request.answer(user, password); done() }) { Text(stringResource(R.string.sign_in)) } },
        dismissButton = { TextButton(onClick = { request.dismiss(); done() }) { Text(stringResource(R.string.cancel)) } },
    )
}

/** <select> menus, including option groups; multiple selection gets checkboxes and an OK button. */
@Composable
private fun ChoiceDialog(request: PageRequest.Choice, done: () -> Unit) {
    val flat = remember {
        buildList {
            fun walk(choices: Array<PromptDelegate.ChoicePrompt.Choice>, depth: Int) {
                choices.forEach { choice ->
                    if (choice.separator) return@forEach
                    add(choice to depth)
                    choice.items?.let { walk(it, depth + 1) }
                }
            }
            walk(request.prompt.choices, 0)
        }
    }
    val checked = remember { mutableStateListOf<String>().apply { addAll(flat.filter { it.first.selected }.map { it.first.id }) } }
    AlertDialog(
        onDismissRequest = { request.dismiss(); done() },
        title = textSlot(request.prompt.title),
        text = {
            LazyColumn(Modifier.heightIn(max = 420.dp)) {
                items(flat) { (choice, depth) ->
                    val isGroup = choice.items != null
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .fillMaxWidth()
                            .then(
                                if (isGroup || choice.disabled) Modifier else Modifier.clickable {
                                    if (request.multiple) {
                                        if (choice.id in checked) checked.remove(choice.id) else checked.add(choice.id)
                                    } else {
                                        request.answer(listOf(choice.id))
                                        done()
                                    }
                                }
                            )
                            .padding(start = (depth * 16).dp, top = 4.dp, bottom = 4.dp),
                    ) {
                        if (!isGroup) {
                            if (request.multiple) Checkbox(checked = choice.id in checked, onCheckedChange = null, enabled = !choice.disabled)
                            else RadioButton(selected = choice.selected, onClick = null, enabled = !choice.disabled)
                        }
                        Text(
                            choice.label,
                            style = if (isGroup) MaterialTheme.typography.titleSmall else MaterialTheme.typography.bodyLarge,
                            color = if (choice.disabled) MaterialTheme.colorScheme.onSurfaceVariant else MaterialTheme.colorScheme.onSurface,
                            modifier = Modifier.padding(start = 12.dp, top = 8.dp, bottom = 8.dp),
                        )
                    }
                }
            }
        },
        confirmButton = {
            if (request.multiple) TextButton(onClick = { request.answer(checked.toList()); done() }) { Text(stringResource(R.string.ok)) }
        },
        dismissButton = { TextButton(onClick = { request.dismiss(); done() }) { Text(stringResource(R.string.cancel)) } },
    )
}

@Composable
private fun FilePicker(request: PageRequest.File, done: () -> Unit) {
    val context = LocalContext.current
    val single = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        request.answer(context, listOfNotNull(uri))
        done()
    }
    val multiple = rememberLauncherForActivityResult(ActivityResultContracts.GetMultipleContents()) { uris ->
        request.answer(context, uris)
        done()
    }
    LaunchedEffect(request) {
        val mime = request.prompt.mimeTypes?.singleOrNull()?.takeIf { '/' in it } ?: "*/*"
        if (request.multiple) multiple.launch(mime) else single.launch(mime)
    }
}

@Composable
private fun ContextMenuSheet(container: AppContainer, request: PageRequest.ContextMenu, done: () -> Unit) {
    val context = LocalContext.current
    val store = container.tabs
    val sheet = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val parent = store.tab(request.tabId)
    val isPrivate = parent?.current?.isPrivate == true
    fun copy(text: String) {
        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        clipboard.setPrimaryClip(ClipData.newPlainText(text, text))
    }
    ModalBottomSheet(onDismissRequest = done, sheetState = sheet) {
        Column(Modifier.padding(bottom = 16.dp)) {
            val header = request.title?.takeIf { it.isNotBlank() } ?: request.linkUrl ?: request.srcUrl
            header?.let {
                Text(
                    it,
                    style = MaterialTheme.typography.titleSmall,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.padding(horizontal = 28.dp, vertical = 8.dp),
                )
            }
            request.linkUrl?.let { link ->
                MenuRow(Icons.Outlined.OpenInNew, R.string.open_link_in_new_tab) {
                    store.newTab(link, isPrivate = isPrivate, select = false, parentId = request.tabId); done()
                }
                if (!isPrivate) {
                    MenuRow(Icons.Outlined.VisibilityOff, R.string.open_link_in_private_tab) {
                        store.newTab(link, isPrivate = true, select = true); done()
                    }
                }
                MenuRow(Icons.Outlined.ContentCopy, R.string.copy_link) { copy(link); done() }
                MenuRow(Icons.Outlined.Share, R.string.share_link) { shareUrl(context, link, request.title.orEmpty()); done() }
            }
            if (request.isImage) request.srcUrl?.let { src ->
                MenuRow(Icons.Outlined.Image, R.string.open_image_in_new_tab) {
                    store.newTab(src, isPrivate = isPrivate, select = false, parentId = request.tabId); done()
                }
                MenuRow(Icons.Outlined.Download, R.string.save_image) {
                    store.download(src, isPrivate, referrer = parent?.current?.url)
                    done()
                }
                MenuRow(Icons.Outlined.ContentCopy, R.string.copy_image_link) { copy(src); done() }
            }
        }
    }
}
