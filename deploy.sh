#!/usr/bin/env bash
# deploy.sh — build check → commit → push to trigger Vercel deploy
# Usage:
#   ./deploy.sh                     # auto commit message: "deploy: YYYY-MM-DD HH:MM"
#   ./deploy.sh "feat: add new places"  # custom commit message

set -e  # exit immediately on error

# ── Colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log()    { echo -e "${CYAN}▶ $1${NC}"; }
ok()     { echo -e "${GREEN}✓ $1${NC}"; }
warn()   { echo -e "${YELLOW}⚠ $1${NC}"; }
error()  { echo -e "${RED}✗ $1${NC}"; exit 1; }

# ── 1. Commit message ─────────────────────────────────────────────────────────
COMMIT_MSG="${1:-deploy: $(date '+%Y-%m-%d %H:%M')}"

# ── 2. Git sanity checks ──────────────────────────────────────────────────────
log "Checking git status..."

if ! git rev-parse --is-inside-work-tree &>/dev/null; then
  error "Not inside a git repository."
fi

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
  warn "Current branch is '${CURRENT_BRANCH}', not 'main'."
  read -p "  Push '${CURRENT_BRANCH}' to origin? [y/N] " confirm
  [[ "$confirm" =~ ^[Yy]$ ]] || error "Aborted."
fi

# ── 3. Build validation ───────────────────────────────────────────────────────
log "Running next build..."
npm run build || error "Build failed. Fix errors before deploying."
ok "Build passed."

# ── 4. Stage & commit (only if there are changes) ────────────────────────────
if git diff --quiet && git diff --staged --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
  warn "No changes to commit. Pushing existing commits only."
else
  log "Staging changes..."
  git add .

  log "Committing: \"${COMMIT_MSG}\""
  git commit -m "${COMMIT_MSG}"
  ok "Committed."
fi

# ── 5. Push ───────────────────────────────────────────────────────────────────
log "Pushing to origin/${CURRENT_BRANCH}..."
git push origin "${CURRENT_BRANCH}"
ok "Pushed. Vercel deployment triggered."

echo ""
echo -e "${GREEN}────────────────────────────────────────${NC}"
echo -e "${GREEN}  Deploy complete!${NC}"
echo -e "${GREEN}  https://github.com/jungmin-0427/shanghai2${NC}"
echo -e "${GREEN}────────────────────────────────────────${NC}"
