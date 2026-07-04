#!/bin/bash
set -euo pipefail

ICON_SOURCE="mobile-assets/AppIcon-source.png"
ICON_OUTPUT="ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png"
SPLASH_SET="ios/App/App/Assets.xcassets/Splash.imageset"
SPLASH_TEMP="$RUNNER_TEMP/image-invaders-splash.png"

sips -z 1024 1024 "$ICON_SOURCE" --out "$ICON_OUTPUT" >/dev/null

cp title.png "$SPLASH_TEMP"
sips -Z 2200 "$SPLASH_TEMP" >/dev/null
sips -p 2732 2732 --padColor 020514 "$SPLASH_TEMP" >/dev/null

cp "$SPLASH_TEMP" "$SPLASH_SET/splash-2732x2732.png"
cp "$SPLASH_TEMP" "$SPLASH_SET/splash-2732x2732-1.png"
cp "$SPLASH_TEMP" "$SPLASH_SET/splash-2732x2732-2.png"
