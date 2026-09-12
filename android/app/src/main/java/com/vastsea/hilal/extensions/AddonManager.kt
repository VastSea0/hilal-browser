package com.vastsea.hilal.extensions

import android.content.Context
import android.util.Log
import androidx.compose.runtime.mutableStateListOf
import org.mozilla.geckoview.GeckoResult
import org.mozilla.geckoview.GeckoRuntime
import org.mozilla.geckoview.WebExtension
import org.mozilla.geckoview.WebExtensionController

data class InstalledAddon(
    val id: String,
    val name: String,
    val version: String,
    val description: String,
    val isEnabled: Boolean,
    val isBuiltIn: Boolean,
    val optionsPageUrl: String?,
    val extension: WebExtension
)

data class FeaturedAddon(
    val id: String,
    val name: String,
    val description: String,
    val xpiUrl: String
)

object AddonManager {
    private const val TAG = "AddonManager"
    val installedAddons = mutableStateListOf<InstalledAddon>()

    val featuredAddons = listOf(
        FeaturedAddon(
            id = "uBlock0@raymondhill.net",
            name = "uBlock Origin",
            description = "Verimli ve geniş spektrumlu reklam ve içerik engelleyici.",
            xpiUrl = "https://addons.mozilla.org/firefox/downloads/latest/ublock-origin/latest.xpi"
        ),
        FeaturedAddon(
            id = "addon@darkreader.org",
            name = "Dark Reader",
            description = "Tüm web siteleri için göz koruyucu koyu tema.",
            xpiUrl = "https://addons.mozilla.org/firefox/downloads/latest/darkreader/latest.xpi"
        ),
        FeaturedAddon(
            id = "jid1-MnnAQBPgBpAAng@jetpack",
            name = "Privacy Badger",
            description = "Görünmez izleyicileri otomatik olarak engeller.",
            xpiUrl = "https://addons.mozilla.org/firefox/downloads/latest/privacy-badger17/latest.xpi"
        ),
        FeaturedAddon(
            id = "{446900e4-71c2-419f-a6a7-df9c091e268b}",
            name = "Bitwarden",
            description = "Güvenli ve açık kaynaklı şifre yöneticisi.",
            xpiUrl = "https://addons.mozilla.org/firefox/downloads/latest/bitwarden-password-manager/latest.xpi"
        ),
        FeaturedAddon(
            id = "sponsorBlocker@ajay.app",
            name = "SponsorBlock",
            description = "YouTube videolarındaki sponsor ve reklam bölümlerini atlar.",
            xpiUrl = "https://addons.mozilla.org/firefox/downloads/latest/sponsorblock/latest.xpi"
        ),
        FeaturedAddon(
            id = "{0d7cafdd-501c-49ca-8ebb-e3341caaa55e}",
            name = "TWP - Translate Web Pages",
            description = "Web sayfalarını gerçek zamanlı olarak çevirir.",
            xpiUrl = "https://addons.mozilla.org/firefox/downloads/latest/traduzir-paginas-web/latest.xpi"
        )
    )

    fun initialize(context: Context, geckoRuntime: GeckoRuntime) {
        val controller = geckoRuntime.webExtensionController

        // Set prompt delegate to auto-allow installation and grant private browsing
        controller.setPromptDelegate(object : WebExtensionController.PromptDelegate {
            override fun onInstallPromptRequest(
                extension: WebExtension,
                permissions: Array<out String>,
                origins: Array<out String>
            ): GeckoResult<WebExtension.PermissionPromptResponse>? {
                return GeckoResult.fromValue(
                    WebExtension.PermissionPromptResponse(true, true)
                )
            }
        })

        // Check if uBlock Origin is already installed
        controller.list().then({ list ->
            val alreadyInstalled = list?.any { it.id == "uBlock0@raymondhill.net" } == true
            if (alreadyInstalled) {
                Log.d(TAG, "uBlock Origin already installed")
                refreshInstalled(geckoRuntime)
                GeckoResult.fromValue(null)
            } else {
                installBundledUblock(context, geckoRuntime)
            }
        }, {
            installBundledUblock(context, geckoRuntime)
        })
    }

    private fun installBundledUblock(context: Context, geckoRuntime: GeckoRuntime): GeckoResult<WebExtension> {
        val controller = geckoRuntime.webExtensionController
        return try {
            val extDir = java.io.File(context.filesDir, "extensions").apply { mkdirs() }
            val xpiFile = java.io.File(extDir, "uBlock0@raymondhill.net.xpi")
            if (!xpiFile.exists() || xpiFile.length() == 0L) {
                context.assets.open("extensions/uBlock0@raymondhill.net.xpi").use { input ->
                    java.io.FileOutputStream(xpiFile).use { output ->
                        input.copyTo(output)
                    }
                }
            }
            controller.install("file://${xpiFile.absolutePath}").then({ ext ->
                Log.d(TAG, "uBlock Origin successfully installed from local xpi: ${ext?.id}")
                if (ext != null) {
                    controller.setAllowedInPrivateBrowsing(ext, true)
                }
                refreshInstalled(geckoRuntime)
                GeckoResult.fromValue(ext)
            }, { err ->
                Log.e(TAG, "Failed to install uBlock Origin from local file", err)
                refreshInstalled(geckoRuntime)
                GeckoResult.fromValue(null)
            })
        } catch (e: Exception) {
            Log.e(TAG, "Exception preparing bundled uBlock Origin xpi", e)
            refreshInstalled(geckoRuntime)
            GeckoResult.fromValue(null)
        }
    }

    fun refreshInstalled(geckoRuntime: GeckoRuntime) {
        geckoRuntime.webExtensionController.list().then({ list ->
            installedAddons.clear()
            list?.forEach { ext ->
                installedAddons.add(
                    InstalledAddon(
                        id = ext.id,
                        name = (ext.metaData.name ?: "").ifBlank { ext.id },
                        version = ext.metaData.version ?: "",
                        description = ext.metaData.description ?: "",
                        isEnabled = ext.metaData.enabled,
                        isBuiltIn = ext.isBuiltIn,
                        optionsPageUrl = ext.metaData.optionsPageUrl,
                        extension = ext
                    )
                )
            }
            GeckoResult.fromValue(list)
        }, { error ->
            Log.e(TAG, "Failed to list extensions", error)
            GeckoResult.fromValue(emptyList())
        })
    }

    fun installFromUrl(geckoRuntime: GeckoRuntime, url: String, onComplete: (Boolean) -> Unit) {
        geckoRuntime.webExtensionController.install(url).then({ ext ->
            if (ext != null) {
                geckoRuntime.webExtensionController.setAllowedInPrivateBrowsing(ext, true)
            }
            refreshInstalled(geckoRuntime)
            onComplete(true)
            GeckoResult.fromValue(ext)
        }, { error ->
            Log.e(TAG, "Failed to install extension from $url", error)
            onComplete(false)
            GeckoResult.fromValue(null)
        })
    }

    fun toggleExtension(geckoRuntime: GeckoRuntime, addon: InstalledAddon, enable: Boolean) {
        val result = if (enable) {
            geckoRuntime.webExtensionController.enable(addon.extension, WebExtensionController.EnableSource.USER)
        } else {
            geckoRuntime.webExtensionController.disable(addon.extension, WebExtensionController.EnableSource.USER)
        }
        result.then({
            refreshInstalled(geckoRuntime)
            GeckoResult.fromValue(it)
        }, {
            refreshInstalled(geckoRuntime)
            GeckoResult.fromValue(null)
        })
    }

    fun uninstallExtension(geckoRuntime: GeckoRuntime, addon: InstalledAddon, onComplete: () -> Unit) {
        geckoRuntime.webExtensionController.uninstall(addon.extension).then({
            refreshInstalled(geckoRuntime)
            onComplete()
            GeckoResult.fromValue(null)
        }, {
            refreshInstalled(geckoRuntime)
            onComplete()
            GeckoResult.fromValue(null)
        })
    }
}
