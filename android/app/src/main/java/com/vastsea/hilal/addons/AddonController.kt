package com.vastsea.hilal.addons

import android.content.Context
import android.graphics.Bitmap
import android.util.Log
import androidx.compose.runtime.Immutable
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import org.mozilla.geckoview.AllowOrDeny
import org.mozilla.geckoview.GeckoResult
import org.mozilla.geckoview.GeckoRuntime
import org.mozilla.geckoview.GeckoSession
import org.mozilla.geckoview.WebExtension
import org.mozilla.geckoview.WebExtensionController
import java.io.File
import kotlin.coroutines.resume

@Immutable
data class Addon(
    val id: String,
    val name: String,
    val version: String,
    val description: String,
    val enabled: Boolean,
    val optionsUrl: String?,
    val icon: Bitmap?,
    val extension: WebExtension,
)

/** An install or update that needs the user's consent for the listed permissions. */
class PermissionRequest(
    val addonName: String,
    val permissions: List<String>,
    val origins: List<String>,
    private val onAnswer: (Boolean) -> Unit,
) {
    fun answer(allow: Boolean) = onAnswer(allow)
}

class AddonController(
    private val context: Context,
    private val runtime: GeckoRuntime,
    private val scope: CoroutineScope,
) {
    private val controller get() = runtime.webExtensionController

    private val _addons = MutableStateFlow<List<Addon>>(emptyList())
    val addons: StateFlow<List<Addon>> = _addons.asStateFlow()

    private val _permissionRequest = MutableStateFlow<PermissionRequest?>(null)
    val permissionRequest: StateFlow<PermissionRequest?> = _permissionRequest.asStateFlow()

    /** Opens a tab for an extension (options page, tabs.create) and returns its session. */
    var openTab: ((url: String?, select: Boolean) -> GeckoSession)? = null

    private var bundledInstall = false

    fun start() {
        controller.setPromptDelegate(object : WebExtensionController.PromptDelegate {
            override fun onInstallPromptRequest(
                extension: WebExtension,
                permissions: Array<out String>,
                origins: Array<out String>,
            ): GeckoResult<WebExtension.PermissionPromptResponse> {
                if (bundledInstall) return GeckoResult.fromValue(WebExtension.PermissionPromptResponse(true, true))
                val result = GeckoResult<WebExtension.PermissionPromptResponse>()
                ask(extension, permissions, origins) { allow ->
                    result.complete(WebExtension.PermissionPromptResponse(allow, false))
                }
                return result
            }

            override fun onUpdatePrompt(
                current: WebExtension,
                updated: WebExtension,
                newPermissions: Array<out String>,
                newOrigins: Array<out String>,
            ): GeckoResult<AllowOrDeny> {
                val result = GeckoResult<AllowOrDeny>()
                ask(updated, newPermissions, newOrigins) { result.complete(if (it) AllowOrDeny.ALLOW else AllowOrDeny.DENY) }
                return result
            }

            override fun onOptionalPrompt(
                extension: WebExtension,
                permissions: Array<out String>,
                origins: Array<out String>,
            ): GeckoResult<AllowOrDeny> {
                val result = GeckoResult<AllowOrDeny>()
                ask(extension, permissions, origins) { result.complete(if (it) AllowOrDeny.ALLOW else AllowOrDeny.DENY) }
                return result
            }
        })
        controller.setAddonManagerDelegate(object : WebExtensionController.AddonManagerDelegate {
            override fun onInstalled(extension: WebExtension) = refresh()
            override fun onUninstalled(extension: WebExtension) = refresh()
            override fun onEnabled(extension: WebExtension) = refresh()
            override fun onDisabled(extension: WebExtension) = refresh()
            override fun onReady(extension: WebExtension) = refresh()
        })
        scope.launch {
            val installed = controller.list().await().orEmpty()
            installed.forEach(::attachTabDelegate)
            if (installed.none { it.id == UBLOCK_ID }) installBundledUblock()
            refresh()
        }
    }

    suspend fun install(url: String): Boolean {
        val extension = runCatching { controller.install(url).await() }
            .onFailure { Log.w(TAG, "Install failed for $url", it) }
            .getOrNull() ?: return false
        attachTabDelegate(extension)
        refresh()
        return true
    }

    fun setEnabled(addon: Addon, enabled: Boolean) {
        val result = if (enabled) controller.enable(addon.extension, WebExtensionController.EnableSource.USER)
        else controller.disable(addon.extension, WebExtensionController.EnableSource.USER)
        scope.launch { runCatching { result.await() }; refresh() }
    }

    fun uninstall(addon: Addon) {
        scope.launch { runCatching { controller.uninstall(addon.extension).await() }; refresh() }
    }

    fun openOptions(addon: Addon) {
        addon.optionsUrl?.let { openTab?.invoke(it, true)?.loadUri(it) }
    }

    fun refresh() {
        scope.launch {
            val list = runCatching { controller.list().await() }.getOrNull().orEmpty()
            _addons.value = list.map { ext ->
                val icon = runCatching { ext.metaData.icon?.getBitmap(96)?.await() }.getOrNull()
                Addon(
                    id = ext.id,
                    name = ext.metaData.name?.ifBlank { null } ?: ext.id,
                    version = ext.metaData.version,
                    description = ext.metaData.description.orEmpty(),
                    enabled = ext.metaData.enabled,
                    optionsUrl = ext.metaData.optionsPageUrl,
                    icon = icon,
                    extension = ext,
                )
            }.sortedBy { it.name.lowercase() }
        }
    }

    private fun ask(extension: WebExtension, permissions: Array<out String>, origins: Array<out String>, done: (Boolean) -> Unit) {
        _permissionRequest.value = PermissionRequest(
            addonName = extension.metaData.name ?: extension.id,
            permissions = permissions.toList(),
            origins = origins.toList(),
        ) { allow ->
            _permissionRequest.update { null }
            done(allow)
        }
    }

    private fun attachTabDelegate(extension: WebExtension) {
        extension.tabDelegate = object : WebExtension.TabDelegate {
            override fun onNewTab(source: WebExtension, details: WebExtension.CreateTabDetails): GeckoResult<GeckoSession>? {
                val open = openTab ?: return null
                return GeckoResult.fromValue(open(null, details.active != false))
            }

            override fun onOpenOptionsPage(source: WebExtension) {
                source.metaData.optionsPageUrl?.let { url -> openTab?.invoke(url, true)?.loadUri(url) }
            }
        }
    }

    private suspend fun installBundledUblock() {
        val file = withContext(Dispatchers.IO) {
            File(context.filesDir, "extensions").apply { mkdirs() }.resolve("$UBLOCK_ID.xpi").also { target ->
                context.assets.open("extensions/$UBLOCK_ID.xpi").use { input ->
                    target.outputStream().use { input.copyTo(it) }
                }
            }
        }
        bundledInstall = true
        try {
            val extension = controller.install("file://${file.absolutePath}").await()
            if (extension != null) {
                controller.setAllowedInPrivateBrowsing(extension, true).await()
                attachTabDelegate(extension)
            }
        } catch (e: Exception) {
            Log.w(TAG, "Bundled uBlock Origin install failed", e)
        } finally {
            bundledInstall = false
        }
    }

    private companion object {
        const val TAG = "AddonController"
        const val UBLOCK_ID = "uBlock0@raymondhill.net"
    }
}

suspend fun <T> GeckoResult<T>.await(): T? = suspendCancellableCoroutine { cont ->
    then<Void>(
        { value -> cont.resume(value); null },
        { error -> cont.resumeWith(Result.failure(error)); null },
    )
}
