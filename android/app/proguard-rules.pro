# GeckoView reflects into its own classes and ships no consumer rules for all of them.
-keep class org.mozilla.geckoview.** { *; }
-keep class org.mozilla.gecko.** { *; }
-dontwarn org.mozilla.**

# SnakeYAML (pulled in by GeckoView for its config file) references java.beans, which
# Android does not have; those code paths are never reached.
-dontwarn java.beans.**
