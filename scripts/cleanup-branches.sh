#!/usr/bin/env bash

# Branch Cleanup Script
# This script helps safely delete merged branches from the repository
# Usage: ./scripts/cleanup-branches.sh [--dry-run] [--force]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default options
DRY_RUN=true
FORCE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --no-dry-run|--delete)
      DRY_RUN=false
      shift
      ;;
    --force)
      FORCE=true
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --dry-run         Show what would be deleted (default)"
      echo "  --no-dry-run      Actually delete branches"
      echo "  --delete          Same as --no-dry-run"
      echo "  --force           Force delete unmerged branches (dangerous!)"
      echo "  -h, --help        Show this help message"
      echo ""
      echo "Protected branches (never deleted):"
      echo "  - main"
      echo "  - master"
      echo "  - develop"
      echo "  - development"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo -e "${RED}Error: Not a git repository${NC}"
  exit 1
fi

# Protected branches
PROTECTED_BRANCHES=("main" "master" "develop" "development")

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Get default branch
DEFAULT_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@')
if [ -z "$DEFAULT_BRANCH" ]; then
  echo -e "${YELLOW}⚠️  Could not detect default branch, assuming 'main'${NC}"
  DEFAULT_BRANCH="main"
fi

echo -e "${BLUE}=== Branch Cleanup Script ===${NC}"
echo -e "Current branch: ${GREEN}${CURRENT_BRANCH}${NC}"
echo -e "Default branch: ${GREEN}${DEFAULT_BRANCH}${NC}"
echo -e "Mode: ${YELLOW}$([ "$DRY_RUN" = true ] && echo "DRY RUN" || echo "DELETE")${NC}"
echo ""

# Update remote references
echo -e "${BLUE}Fetching latest changes...${NC}"
git fetch --prune

# Get list of local branches
BRANCHES=$(git for-each-ref --format='%(refname:short)' refs/heads/)

# Counter
DELETED_COUNT=0
SKIPPED_COUNT=0

echo -e "${BLUE}Analyzing branches...${NC}"
echo ""

for BRANCH in $BRANCHES; do
  # Skip current branch
  if [ "$BRANCH" = "$CURRENT_BRANCH" ]; then
    echo -e "⏩ ${YELLOW}Skipping current branch: ${BRANCH}${NC}"
    SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
    continue
  fi
  
  # Skip protected branches
  SKIP=false
  for PROTECTED in "${PROTECTED_BRANCHES[@]}"; do
    if [ "$BRANCH" = "$PROTECTED" ]; then
      echo -e "🔒 ${YELLOW}Skipping protected branch: ${BRANCH}${NC}"
      SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
      SKIP=true
      break
    fi
  done
  [ "$SKIP" = true ] && continue
  
  # Check if branch is fully merged into default branch using git branch --merged
  if git branch --merged "$DEFAULT_BRANCH" | grep -q "^[* ]*${BRANCH}$"; then
    # Branch is fully merged
    if [ "$DRY_RUN" = true ]; then
      echo -e "🗑️  ${GREEN}[DRY RUN] Would delete merged branch: ${BRANCH}${NC}"
    else
      if git branch -d "$BRANCH" 2>/dev/null; then
        echo -e "✅ ${GREEN}Deleted merged branch: ${BRANCH}${NC}"
      else
        echo -e "⚠️  ${RED}Failed to delete branch: ${BRANCH}${NC}"
      fi
    fi
    DELETED_COUNT=$((DELETED_COUNT + 1))
  else
    # Branch is not merged
    if [ "$FORCE" = true ]; then
      if [ "$DRY_RUN" = true ]; then
        echo -e "🗑️  ${RED}[DRY RUN] Would FORCE delete unmerged branch: ${BRANCH}${NC}"
      else
        if git branch -D "$BRANCH" 2>/dev/null; then
          echo -e "✅ ${RED}FORCE deleted unmerged branch: ${BRANCH}${NC}"
        else
          echo -e "⚠️  ${RED}Failed to force delete branch: ${BRANCH}${NC}"
        fi
      fi
      DELETED_COUNT=$((DELETED_COUNT + 1))
    else
      echo -e "⏩ ${YELLOW}Skipping unmerged branch: ${BRANCH} (use --force to delete)${NC}"
      SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
    fi
  fi
done

echo ""
echo -e "${BLUE}=== Summary ===${NC}"
echo -e "Branches processed: $((DELETED_COUNT + SKIPPED_COUNT))"
echo -e "Branches ${GREEN}$([ "$DRY_RUN" = true ] && echo "to delete" || echo "deleted")${NC}: ${DELETED_COUNT}"
echo -e "Branches ${YELLOW}skipped${NC}: ${SKIPPED_COUNT}"

if [ "$DRY_RUN" = true ] && [ "$DELETED_COUNT" -gt 0 ]; then
  echo ""
  echo -e "${YELLOW}💡 This was a dry run. To actually delete branches, run:${NC}"
  echo -e "   ${BLUE}$0 --no-dry-run${NC}"
fi

echo ""
echo -e "${GREEN}✅ Done!${NC}"
