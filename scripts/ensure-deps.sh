#!/bin/zsh

set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
CHECK_ONLY="${1:-}"

if [[ "$ROOT_DIR" == "$HOME/Desktop/"* || "$ROOT_DIR" == "$HOME/Documents/"* ]]; then
  echo "warning: project is inside a macOS Desktop/Documents folder: $ROOT_DIR"
  echo "warning: if iCloud Drive optimizes storage, node_modules can become unavailable between sessions."
  echo "warning: move the repo to a local folder such as $HOME/Projects for the most reliable setup."
fi

ensure_project() {
  local project_dir="$1"
  local marker_path="$2"
  local label="$3"

  if [[ ! -f "$project_dir/package-lock.json" ]]; then
    echo "$label: package-lock.json is missing in $project_dir"
    return 1
  fi

  if [[ -r "$project_dir/$marker_path" ]]; then
    echo "$label: dependencies look present"
    return 0
  fi

  if [[ "$CHECK_ONLY" == "--check" ]]; then
    echo "$label: missing dependency marker $marker_path"
    return 1
  fi

  echo "$label: reinstalling dependencies with npm ci"
  (cd "$project_dir" && npm ci)
}

ensure_project "$ROOT_DIR/frontend" "node_modules/vite/bin/vite.js" "frontend"
ensure_project "$ROOT_DIR/backend" "node_modules/express/index.js" "backend"
