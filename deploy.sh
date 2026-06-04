#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/HaloCare}"
BACKEND_NAME="${BACKEND_NAME:-halocare-backend}"

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

install_deps() {
  if [ -f package-lock.json ]; then
    npm ci
  else
    npm install
  fi
}

log "Starting deployment in ${APP_DIR}"
cd "${APP_DIR}"

if [ -d .git ]; then
  log "Updating Git working tree"
  git pull --ff-only origin "${GIT_BRANCH:-master}"
else
  log "No .git directory found; using uploaded source files"
fi

log "Installing frontend dependencies"
install_deps

log "Building frontend"
rm -rf dist
npm run build
chmod 755 "${APP_DIR}"
find dist -type d -exec chmod 755 {} +
find dist -type f -exec chmod 644 {} +

log "Installing backend dependencies"
cd server
install_deps

if [ ! -f .env ]; then
  echo "Missing server/.env. Create it before deployment." >&2
  exit 1
fi
chmod 600 .env

log "Starting or reloading backend with PM2"
if pm2 describe "${BACKEND_NAME}" >/dev/null 2>&1; then
  pm2 reload "${BACKEND_NAME}" --update-env
else
  pm2 start index.js --name "${BACKEND_NAME}" --update-env
fi

pm2 save
log "Deployment finished"
