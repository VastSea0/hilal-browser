package com.vastsea.hilal.browser

import org.mozilla.geckoview.AllowOrDeny
import org.mozilla.geckoview.GeckoResult
import org.mozilla.geckoview.GeckoSession.PermissionDelegate
import org.mozilla.geckoview.GeckoSession.PromptDelegate
import org.mozilla.geckoview.GeckoSession.PromptDelegate.PromptResponse

/**
 * Something a page asked for that the user has to answer. Each request is bound to the tab
 * that raised it and is answered exactly once through [resolve] or [dismiss].
 */
sealed class PageRequest(val tabId: String) {
    abstract fun dismiss()

    class Alert(tabId: String, val prompt: PromptDelegate.AlertPrompt, private val result: GeckoResult<PromptResponse>) : PageRequest(tabId) {
        fun ok() = result.complete(prompt.dismiss())
        override fun dismiss() = ok()
    }

    class Confirm(tabId: String, val prompt: PromptDelegate.ButtonPrompt, private val result: GeckoResult<PromptResponse>) : PageRequest(tabId) {
        fun answer(positive: Boolean) = result.complete(
            prompt.confirm(if (positive) PromptDelegate.ButtonPrompt.Type.POSITIVE else PromptDelegate.ButtonPrompt.Type.NEGATIVE)
        )
        override fun dismiss() = result.complete(prompt.dismiss())
    }

    class Text(tabId: String, val prompt: PromptDelegate.TextPrompt, private val result: GeckoResult<PromptResponse>) : PageRequest(tabId) {
        fun answer(value: String) = result.complete(prompt.confirm(value))
        override fun dismiss() = result.complete(prompt.dismiss())
    }

    class Auth(tabId: String, val prompt: PromptDelegate.AuthPrompt, private val result: GeckoResult<PromptResponse>) : PageRequest(tabId) {
        val passwordOnly: Boolean
            get() = prompt.authOptions.flags and PromptDelegate.AuthPrompt.AuthOptions.Flags.ONLY_PASSWORD != 0
        fun answer(user: String, password: String) = result.complete(
            if (passwordOnly) prompt.confirm(password) else prompt.confirm(user, password)
        )
        override fun dismiss() = result.complete(prompt.dismiss())
    }

    class Choice(tabId: String, val prompt: PromptDelegate.ChoicePrompt, private val result: GeckoResult<PromptResponse>) : PageRequest(tabId) {
        val multiple: Boolean get() = prompt.type == PromptDelegate.ChoicePrompt.Type.MULTIPLE
        fun answer(ids: List<String>) = result.complete(
            if (multiple) prompt.confirm(ids.toTypedArray()) else prompt.confirm(ids.first())
        )
        override fun dismiss() = result.complete(prompt.dismiss())
    }

    class Leave(tabId: String, val prompt: PromptDelegate.BeforeUnloadPrompt, private val result: GeckoResult<PromptResponse>) : PageRequest(tabId) {
        fun answer(leave: Boolean) = result.complete(prompt.confirm(if (leave) AllowOrDeny.ALLOW else AllowOrDeny.DENY))
        override fun dismiss() = answer(false)
    }

    class Repost(tabId: String, val prompt: PromptDelegate.RepostConfirmPrompt, private val result: GeckoResult<PromptResponse>) : PageRequest(tabId) {
        fun answer(resend: Boolean) = result.complete(prompt.confirm(if (resend) AllowOrDeny.ALLOW else AllowOrDeny.DENY))
        override fun dismiss() = answer(false)
    }

    class Popup(tabId: String, val prompt: PromptDelegate.PopupPrompt, private val result: GeckoResult<PromptResponse>) : PageRequest(tabId) {
        fun answer(allow: Boolean) = result.complete(prompt.confirm(if (allow) AllowOrDeny.ALLOW else AllowOrDeny.DENY))
        override fun dismiss() = answer(false)
    }

    class File(tabId: String, val prompt: PromptDelegate.FilePrompt, private val result: GeckoResult<PromptResponse>) : PageRequest(tabId) {
        val multiple: Boolean get() = prompt.type == PromptDelegate.FilePrompt.Type.MULTIPLE
        fun answer(context: android.content.Context, uris: List<android.net.Uri>) = result.complete(
            when {
                uris.isEmpty() -> prompt.dismiss()
                multiple -> prompt.confirm(context, uris.toTypedArray())
                else -> prompt.confirm(context, uris.first())
            }
        )
        override fun dismiss() = result.complete(prompt.dismiss())
    }

    /** A site permission such as location or notifications. */
    class Permission(
        tabId: String,
        val host: String,
        val kind: Int,
        private val result: GeckoResult<Int>,
    ) : PageRequest(tabId) {
        fun answer(allow: Boolean) = result.complete(
            if (allow) PermissionDelegate.ContentPermission.VALUE_ALLOW else PermissionDelegate.ContentPermission.VALUE_DENY
        )
        override fun dismiss() = answer(false)
    }

    class Media(
        tabId: String,
        val host: String,
        val video: PermissionDelegate.MediaSource?,
        val audio: PermissionDelegate.MediaSource?,
        private val callback: PermissionDelegate.MediaCallback,
    ) : PageRequest(tabId) {
        private var done = false
        fun answer(allow: Boolean) {
            if (done) return
            done = true
            if (allow) callback.grant(video, audio) else callback.reject()
        }
        override fun dismiss() = answer(false)
    }

    class ContextMenu(
        tabId: String,
        val linkUrl: String?,
        val srcUrl: String?,
        val title: String?,
        val isImage: Boolean,
        val isVideo: Boolean,
    ) : PageRequest(tabId) {
        override fun dismiss() = Unit
    }
}
