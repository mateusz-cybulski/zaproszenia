#!/usr/bin/env bash
# Retakes the user guide's screenshots (src/_pages/instruction/screenshots) from a fresh local
# stack with sample data. Needs Docker, the installed Google Chrome and gcloud application
# default credentials (the AI check). The dev stack must be stopped: the ports are the same.
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
frontend="$(cd "$here/../.." && pwd)"
repo="$(cd "$frontend/../.." && pwd)"
logs="$(mktemp -d)"
export DOCKER_DEFAULT_PLATFORM=linux/amd64
compose=(docker compose -f "$repo/.config/docker-compose.yml" -p zaproszenia-screenshots)

for port in 3000 5432 8000 8099; do
  if lsof -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Port $port is in use: stop the dev stack (and anything else on it) first." >&2
    exit 1
  fi
done

# next dev writes AGENTS.md; keep it only if it was there before.
agents_file="$frontend/AGENTS.md"
agents_file_existed=false
[ -e "$agents_file" ] && agents_file_existed=true

frontend_pid=""
mock_api_pid=""

stop_frontend() {
  if [ -n "$frontend_pid" ]; then
    kill "$frontend_pid" 2>/dev/null || true
    wait "$frontend_pid" 2>/dev/null || true
    frontend_pid=""
  fi
}

cleanup() {
  stop_frontend
  if [ -n "$mock_api_pid" ]; then
    kill "$mock_api_pid" 2>/dev/null || true
    wait "$mock_api_pid" 2>/dev/null || true
  fi
  "${compose[@]}" down -v >/dev/null 2>&1 || true
  [ "$agents_file_existed" = false ] && rm -f "$agents_file"
  echo "Logs: $logs"
}
trap cleanup EXIT

wait_for() {
  local url="$1"
  for _ in $(seq 1 90); do
    [ "$(curl -s -o /dev/null -w '%{http_code}' "$url")" = "200" ] && return 0
    sleep 2
  done
  echo "$url did not answer; see $logs" >&2
  exit 1
}

# Next dev with the given environment; the binary itself, so its pid can be stopped.
start_frontend() {
  (cd "$frontend" && exec env "$@" "$frontend/node_modules/.bin/next" dev) \
    >>"$logs/frontend.log" 2>&1 &
  frontend_pid=$!
}

echo "Starting the API with an empty database…"
"${compose[@]}" up --build -d api >"$logs/compose.log" 2>&1
wait_for "http://localhost:8000/auth/me"
node "$here/seed.mjs"

echo "Signed-in screens…"
start_frontend API_URL=http://localhost:8000
wait_for "http://localhost:3000/events"
node "$here/shoot-app.mjs"
stop_frontend

echo "Sign-in screens…"
node "$here/mock-api.mjs" &
mock_api_pid=$!
start_frontend API_URL=http://127.0.0.1:8099 FIREBASE_API_KEY=screenshots FIREBASE_AUTH_DOMAIN=localhost
wait_for "http://localhost:3000/"
node "$here/shoot-sign-in.mjs"

echo "Done. Look through the screenshots before committing them."
