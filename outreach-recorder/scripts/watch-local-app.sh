#!/bin/zsh
set -u

export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"

LABEL="com.essentialresourcing.videooutreach"
PLIST="/Users/walsh/Library/LaunchAgents/${LABEL}.plist"
URL="http://127.0.0.1:5174/"
LOG_DIR="/Users/walsh/Library/Logs/essential-video-outreach"
LOG_FILE="${LOG_DIR}/watchdog.log"

mkdir -p "$LOG_DIR"

if curl -fsS --max-time 5 "$URL" >/dev/null 2>&1; then
  exit 0
fi

echo "$(date '+%Y-%m-%d %H:%M:%S') ${URL} did not respond; restarting ${LABEL}" >> "$LOG_FILE"

if ! launchctl print "gui/$(id -u)/${LABEL}" >/dev/null 2>&1; then
  launchctl bootstrap "gui/$(id -u)" "$PLIST" >> "$LOG_FILE" 2>&1
else
  launchctl kickstart -k "gui/$(id -u)/${LABEL}" >> "$LOG_FILE" 2>&1
fi
