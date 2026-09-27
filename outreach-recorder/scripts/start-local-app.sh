#!/bin/zsh
set -eu

export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"

cd /Users/walsh/Jobstodoincodex/outreach-recorder

if [ ! -d node_modules ]; then
  npm install
fi

if [ ! -f dist/index.html ]; then
  npm run build
fi

exec npm run preview -- --port 5174 --strictPort
