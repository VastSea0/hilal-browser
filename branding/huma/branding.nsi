# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

# NSIS branding defines for Hüma Browser builds.

# BrandFullNameInternal is used for some registry and file system values
# instead of BrandFullName and typically should not be modified. The
# internal value is kept ASCII for compatibility with legacy registry
# tooling that may not handle non-ASCII reliably.
!define BrandFullNameInternal "Huma Browser"
!define BrandFullName         "Hüma Browser"
!define BrandShortName        "Hüma"
!define BrandShorterName      "Hüma"
!define BrandProductName      "Hüma"
!define CompanyName           "Hüma"
!define URLInfoAbout          "https://browser.gkdevstudio.org"
!define HelpLink              "https://browser.gkdevstudio.org/support"

!define URLManualDownload     "https://browser.gkdevstudio.org/download"
!define URLSystemRequirements "https://browser.gkdevstudio.org/system-requirements"
!define Channel               "release"

# Dialog units are used so the UI displays correctly with the system's DPI
# settings.
!define PROFILE_CLEANUP_LABEL_TOP "35u"
!define PROFILE_CLEANUP_LABEL_LEFT "0"
!define PROFILE_CLEANUP_LABEL_WIDTH "100%"
!define PROFILE_CLEANUP_LABEL_HEIGHT "80u"
!define PROFILE_CLEANUP_LABEL_ALIGN "center"
!define PROFILE_CLEANUP_CHECKBOX_LEFT "center"
!define PROFILE_CLEANUP_CHECKBOX_WIDTH "100%"
!define PROFILE_CLEANUP_BUTTON_LEFT "center"
!define INSTALL_BLURB_TOP "137u"
!define INSTALL_BLURB_WIDTH "60u"
!define INSTALL_FOOTER_TOP "-48u"
!define INSTALL_FOOTER_WIDTH "250u"
!define INSTALL_INSTALLING_TOP "70u"
!define INSTALL_INSTALLING_LEFT "0"
!define INSTALL_INSTALLING_WIDTH "100%"
!define INSTALL_PROGRESS_BAR_TOP "112u"
!define INSTALL_PROGRESS_BAR_LEFT "20%"
!define INSTALL_PROGRESS_BAR_WIDTH "60%"
!define INSTALL_PROGRESS_BAR_HEIGHT "12u"

!define PROFILE_CLEANUP_CHECKBOX_TOP_MARGIN "20u"
!define PROFILE_CLEANUP_BUTTON_TOP_MARGIN "20u"
!define PROFILE_CLEANUP_BUTTON_X_PADDING "40u"
!define PROFILE_CLEANUP_BUTTON_Y_PADDING "4u"

# Font settings
!define INSTALL_HEADER_FONT_SIZE 28
!define INSTALL_HEADER_FONT_WEIGHT 400
!define INSTALL_INSTALLING_FONT_SIZE 28
!define INSTALL_INSTALLING_FONT_WEIGHT 400

# UI Colors - Hüma Browser dark theme (navy + cyan)
!define COMMON_TEXT_COLOR 0xFFFFFF
!define COMMON_BACKGROUND_COLOR 0x0E1E3F
!define INSTALL_INSTALLING_TEXT_COLOR 0xFFFFFF
!define INSTALL_INSTALLING_BACKGROUND_COLOR 0x0E1E3F
!define INSTALL_BLURB_TEXT_COLOR 0xFFFFFF
!define INSTALL_FOOTER_TEXT_COLOR 0xB8C5D6
!define INSTALL_PROGRESS_BAR_BACKGROUND_COLOR 0x1F3A6B
!define INSTALL_PROGRESS_BAR_PROGRESS_COLOR 0x5FD4E6
