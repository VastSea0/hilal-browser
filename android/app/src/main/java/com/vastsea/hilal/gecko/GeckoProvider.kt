package com.vastsea.hilal.gecko

import android.content.Context
import com.vastsea.hilal.BuildConfig
import org.mozilla.geckoview.ContentBlocking
import org.mozilla.geckoview.GeckoRuntime
import org.mozilla.geckoview.GeckoRuntimeSettings

object GeckoProvider {
    fun create(context: Context): GeckoRuntime {
        val blocking = ContentBlocking.Settings.Builder()
            .antiTracking(
                ContentBlocking.AntiTracking.DEFAULT or
                    ContentBlocking.AntiTracking.STP or
                    ContentBlocking.AntiTracking.CRYPTOMINING or
                    ContentBlocking.AntiTracking.FINGERPRINTING
            )
            .enhancedTrackingProtectionLevel(ContentBlocking.EtpLevel.DEFAULT)
            .cookieBehavior(ContentBlocking.CookieBehavior.ACCEPT_FIRST_PARTY_AND_ISOLATE_OTHERS)
            .cookieBehaviorPrivateMode(ContentBlocking.CookieBehavior.ACCEPT_FIRST_PARTY_AND_ISOLATE_OTHERS)
            .safeBrowsing(ContentBlocking.SafeBrowsing.DEFAULT)
            .queryParameterStrippingEnabled(true)
            .queryParameterStrippingPrivateBrowsingEnabled(true)
            .cookieBannerHandlingMode(ContentBlocking.CookieBannerMode.COOKIE_BANNER_MODE_REJECT)
            .cookieBannerHandlingModePrivateBrowsing(ContentBlocking.CookieBannerMode.COOKIE_BANNER_MODE_REJECT)
            .build()

        val settings = GeckoRuntimeSettings.Builder()
            .contentBlocking(blocking)
            .globalPrivacyControlEnabled(true)
            .aboutConfigEnabled(true)
            .remoteDebuggingEnabled(BuildConfig.DEBUG)
            .consoleOutput(BuildConfig.DEBUG)
            .loginAutofillEnabled(false)
            .build()

        return GeckoRuntime.create(context, settings)
    }
}
