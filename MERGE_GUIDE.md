# Repository Merge Guide

This guide will help you sync your local repository with the latest changes from the main branch.

## Prerequisites

- Git installed on your system
- Access to the repository
- Your local repository is set up

## Quick Start (Recommended)

If you haven't made any local changes, use this simple method:

```bash
# 1. Make sure you're on your working branch (or main/master)
git checkout main
# or
git checkout master

# 2. Fetch the latest changes from remote
git fetch origin

# 3. Pull and merge the latest changes
git pull origin main
# or
git pull origin master
```

## Step-by-Step Merge Process

### Step 1: Check Your Current Status

First, check what branch you're on and if you have any uncommitted changes:

```bash
# Check current branch
git status

# See your current changes
git diff
```

### Step 2: Save Your Work

If you have uncommitted changes, you have two options:

**Option A: Commit your changes first**
```bash
# Stage all changes
git add .

# Commit with a descriptive message
git commit -m "Your commit message describing your changes"
```

**Option B: Stash your changes (temporary save)**
```bash
# Save your changes temporarily
git stash

# After merging, restore your changes with:
git stash pop
```

### Step 3: Fetch Latest Changes

Fetch the latest changes from the remote repository without merging:

```bash
git fetch origin
```

This downloads the latest changes but doesn't modify your working directory.

### Step 4: Merge the Changes

**If you're on the main branch:**
```bash
git merge origin/main
# or
git merge origin/master
```

**If you're on a feature branch:**
```bash
# First, merge main into your branch
git merge origin/main
# or
git merge origin/master
```

### Step 5: Handle Conflicts (If Any)

If Git reports conflicts, you'll see messages like:
```
Auto-merging src/pages/BuildingFormPage.jsx
CONFLICT (content): Merge conflict in src/pages/BuildingFormPage.jsx
```

**To resolve conflicts:**

1. Open the conflicted files in your editor
2. Look for conflict markers:
   ```
   <<<<<<< HEAD
   Your local changes
   =======
   Incoming changes
   >>>>>>> origin/main
   ```

3. Edit the file to keep the correct code (or combine both if needed)
4. Remove the conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)

5. After resolving all conflicts:
   ```bash
   # Stage the resolved files
   git add .

   # Complete the merge
   git commit -m "Merge latest changes from main"
   ```

### Step 6: Verify the Merge

After merging, verify everything is correct:

```bash
# Check status
git status

# View recent commits
git log --oneline -10

# Test the application
npm install  # If dependencies changed
npm run dev  # Start the dev server
```

## Alternative: Using Pull (Faster Method)

If you're confident and want to do it in one step:

```bash
# Make sure you're on the right branch
git checkout main

# Pull and merge in one command
git pull origin main
```

## Common Scenarios

### Scenario 1: You Have Uncommitted Changes

```bash
# Stash your changes
git stash

# Pull latest changes
git pull origin main

# Restore your changes
git stash pop

# Resolve any conflicts if they occur
```

### Scenario 2: You're on a Feature Branch

```bash
# Make sure your feature branch is up to date
git checkout your-feature-branch

# Merge main into your feature branch
git merge origin/main

# Resolve conflicts if any
# Continue working on your feature
```

### Scenario 3: You Want to Start Fresh

If you want to completely reset your local branch to match remote:

```bash
# WARNING: This will discard all local changes!
git fetch origin
git reset --hard origin/main
```

## Recent Changes Summary

The latest updates include:

- ✅ Converted all Material-UI Select components to native HTML `<select>` elements
- ✅ Removed default values from all select fields (they now start empty)
- ✅ Updated filter logic to work with empty strings instead of 'all'
- ✅ Removed animations and transitions from dropdowns
- ✅ Cleaned up unused Material-UI Select imports

**Files Modified:**
- `src/pages/BuildingFormPage.jsx`
- `src/pages/PathFormPage.jsx`
- `src/pages/RoomFormPage.jsx`
- `src/pages/RoomsPage.jsx`
- `src/pages/BuildingsPage.jsx`
- `src/pages/AuditTrailPage.jsx`
- `src/pages/FeedbackPage.jsx`
- `src/pages/PathsPage.jsx`
- `src/pages/UsersPage.jsx`

## Troubleshooting

### Error: "Your local changes would be overwritten"

**Solution:** Commit or stash your changes first:
```bash
git stash
git pull origin main
git stash pop
```

### Error: "Merge conflict"

**Solution:** Follow Step 5 in the guide above to resolve conflicts manually.

### Error: "Branch is behind"

**Solution:** This is normal. Just pull the latest changes:
```bash
git pull origin main
```

### Error: "Permission denied"

**Solution:** Make sure you have access to the repository and your SSH keys are set up correctly.

## Best Practices

1. **Always pull before starting new work:**
   ```bash
   git pull origin main
   ```

2. **Commit frequently** with descriptive messages

3. **Test after merging** to ensure everything works

4. **Communicate** with the team if you encounter issues

5. **Don't force push** to main/master branches

## Need Help?

If you encounter issues:

1. Check this guide first
2. Review Git documentation: https://git-scm.com/doc
3. Ask the team for assistance
4. Check the repository's issues/PRs for similar problems

## Quick Reference Commands

```bash
# Check status
git status

# Fetch latest (safe, doesn't change your files)
git fetch origin

# Pull and merge
git pull origin main

# Stash changes
git stash

# Restore stashed changes
git stash pop

# View commit history
git log --oneline -10

# See what changed
git diff

# Abort a merge (if something goes wrong)
git merge --abort
```

---

**Last Updated:** Based on latest changes to Select components (native HTML conversion)

