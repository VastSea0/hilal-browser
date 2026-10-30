package com.vastsea.hilal.browser

import org.mozilla.geckoview.GeckoSession.PermissionDelegate

/**
 * Bridges Gecko's requests for Android runtime permissions (camera, microphone, location)
 * to the activity's permission launcher. Requests made while no activity is attached are denied.
 */
object AndroidPermissions {
    private var launcher: ((List<String>, (Boolean) -> Unit) -> Unit)? = null

    fun attach(launch: (List<String>, (Boolean) -> Unit) -> Unit) {
        launcher = launch
    }

    fun detach() {
        launcher = null
    }

    fun request(permissions: List<String>, callback: PermissionDelegate.Callback) {
        val launch = launcher ?: return callback.reject()
        launch(permissions) { granted -> if (granted) callback.grant() else callback.reject() }
    }
}
