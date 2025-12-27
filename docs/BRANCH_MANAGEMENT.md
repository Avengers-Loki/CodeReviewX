# Branch Management Guide

This repository uses a main-branch-only workflow with automated branch cleanup to maintain a clean repository structure.

## Branch Strategy

- **Main Branch**: `main` is the default and protected branch
- **Feature Branches**: Created automatically by Copilot or manually for development
- **Automatic Cleanup**: Branches are deleted automatically after PR merge

## Automated Branch Management

### 1. Delete Merged Branches (Automatic)

The `.github/workflows/delete-merged-branches.yml` workflow automatically deletes branches after their pull requests are merged.

**Features:**
- Triggers automatically when a PR is merged
- Protects `main`, `master`, `develop`, and `development` branches
- Handles errors gracefully (no workflow failures)
- Can be manually triggered via GitHub Actions UI

### 2. Cleanup Stale Branches (Scheduled)

The `.github/workflows/cleanup-stale-branches.yml` workflow runs weekly to clean up fully-merged branches.

**Features:**
- Runs every Sunday at 00:00 UTC
- Defaults to dry-run mode (safe)
- Identifies branches with no unique commits
- Can be manually triggered with custom settings

**Manual Trigger:**
1. Go to Actions → Cleanup Stale Branches
2. Click "Run workflow"
3. Choose dry_run: `true` (preview) or `false` (delete)

## Manual Branch Deletion

### Safe Deletion Checklist

✅ **SAFE to delete if:**
- ✔️ Code is merged into `main`
- ✔️ Pull request is merged or closed
- ✔️ Branch has no unfinished work
- ✔️ Branch is not the default branch

❌ **DO NOT delete if:**
- ❌ PR is still open and unmerged
- ❌ Branch contains important unfinished work
- ❌ Branch is `main` or other protected branch

### Delete via GitHub UI

1. Go to **Repository → Branches**
2. Find the branch to delete
3. Click the 🗑️ **Delete** button
4. Confirm deletion

GitHub will block deletion of protected branches automatically.

### Delete via Git Commands

#### Delete Local Branch
```bash
# Safe delete (only if merged)
git branch -d branch-name

# Force delete (even if not merged)
git branch -D branch-name
```

#### Delete Remote Branch
```bash
# Delete from remote
git push origin --delete branch-name

# Alternative syntax
git push origin :branch-name
```

#### Cleanup Local References
```bash
# Remove remote-tracking branches that no longer exist
git fetch --prune

# Or
git remote prune origin
```

## Branch Protection

To prevent accidental deletion of important branches:

1. Go to **Settings → Branches**
2. Click **Add rule** or edit existing rule
3. Branch name pattern: `main`
4. Enable protection rules:
   - ✅ Require pull request before merging
   - ✅ Require status checks to pass
   - ✅ Do not allow bypassing the above settings

## Current Branches

To view all branches in the repository:

```bash
# List local branches
git branch

# List remote branches
git branch -r

# List all branches
git branch -a
```

## Troubleshooting

### Branch Won't Delete

**Error**: Branch is protected
- **Solution**: Check branch protection rules in Settings → Branches

**Error**: Branch not found (404)
- **Solution**: Branch is already deleted or doesn't exist

**Error**: Cannot delete default branch (422)
- **Solution**: This is expected - you cannot delete the default branch

### Workflow Failures

The branch deletion workflows are designed to never fail:
- Errors are logged but don't cause workflow failure
- Already-deleted branches are handled gracefully
- Protected branches are skipped automatically

## Best Practices

1. **Merge PRs promptly** - Automated cleanup works best with closed PRs
2. **Use descriptive branch names** - Easier to identify stale branches
3. **Review before deleting** - Check branch history if uncertain
4. **Keep `main` protected** - Enable branch protection rules
5. **Regular cleanup** - Let the weekly workflow run or trigger manually

## Questions?

If you're unsure about deleting a branch:
1. Check if it has an open PR
2. Compare it with `main` to see unique commits
3. Ask team members if it's still needed
4. Use dry-run mode in the cleanup workflow

**Remember**: Deleting a branch does NOT affect the `main` branch or merged code.
