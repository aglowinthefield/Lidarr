#! /usr/bin/env bash
# Resync this fork with upstream Lidarr.
#
#   develop     tracks upstream/develop exactly, never carries our commits
#   feat/*      one branch per feature, rebased onto develop (these are the PRs)
#   fork/infra  this script, the Dockerfile and the CI workflow
#   mochi       integration branch, rebuilt as develop + a merge of each branch
#               listed in .fork-branches
#
# mochi is purely derived — anything committed directly to it is discarded on
# the next sync. Put work on a feature branch and list it in .fork-branches.
#
# Usage: ./sync-fork.sh [--push]

set -euo pipefail

INTEGRATION_BRANCH=mochi
UPSTREAM_BRANCH=develop
INFRA_BRANCH=fork/infra

# This script lives on fork/infra, so checking out develop deletes it from the
# working tree mid-run — and bash reads scripts incrementally. Re-exec from a
# copy outside the repo so the rug can't be pulled out from under us.
if [[ "${FORK_SYNC_REEXEC:-}" != "1" ]]; then
    _copy=$(mktemp)
    cp "$0" "$_copy"
    chmod +x "$_copy"
    FORK_SYNC_REEXEC=1 exec "$_copy" "$@"
fi
trap 'rm -f "$0"' EXIT

PUSH=no
[[ "${1:-}" == "--push" ]] && PUSH=yes

cd "$(git rev-parse --show-toplevel)"

if [[ -n "$(git status --porcelain)" ]]; then
    echo "Working tree is dirty; commit or stash first." >&2
    exit 1
fi

STARTED_ON=$(git rev-parse --abbrev-ref HEAD)

# Read the branch list from the ref, not the working tree — the working tree
# copy vanishes as soon as we check out develop.
mapfile -t FEATURES < <(git show "$INFRA_BRANCH:.fork-branches" | grep -vE '^\s*(#|$)')

echo "==> Fetching upstream"
git fetch upstream --prune

echo "==> Fast-forwarding $UPSTREAM_BRANCH to upstream/$UPSTREAM_BRANCH"
git checkout "$UPSTREAM_BRANCH"
git merge --ff-only "upstream/$UPSTREAM_BRANCH"

# Rebase each branch onto the new develop. A conflict here is real work, so
# stop and leave the rebase in progress rather than guessing.
for branch in "${FEATURES[@]}"; do
    echo "==> Rebasing $branch"
    git checkout "$branch"
    if ! git rebase "$UPSTREAM_BRANCH"; then
        echo >&2
        echo "Conflict rebasing $branch. Resolve it, 'git rebase --continue'," >&2
        echo "then re-run this script." >&2
        exit 1
    fi
done

echo "==> Rebuilding $INTEGRATION_BRANCH"
git checkout -B "$INTEGRATION_BRANCH" "$UPSTREAM_BRANCH"
for branch in "${FEATURES[@]}"; do
    echo "    merging $branch"
    if ! git merge --no-ff -m "Merge $branch into $INTEGRATION_BRANCH" "$branch"; then
        echo >&2
        echo "Conflict merging $branch into $INTEGRATION_BRANCH — two branches" >&2
        echo "disagree. Resolve, commit, then re-run with --push." >&2
        exit 1
    fi
done

if [[ "$PUSH" == "yes" ]]; then
    echo "==> Pushing"
    git push origin "$UPSTREAM_BRANCH"
    for branch in "${FEATURES[@]}"; do
        git push --force-with-lease origin "$branch"
    done
    git push --force-with-lease origin "$INTEGRATION_BRANCH"
    echo
    echo "Pushed. CI will build and publish the image."
else
    echo
    echo "Dry run complete — nothing pushed. Re-run with --push when happy."
fi

git checkout "$STARTED_ON"
