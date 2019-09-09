#!/usr/bin/env bash

set -ex

base_brach=${1:-master}
head_branch=${2:-next}

git fetch origin "$base_brach"
git fetch origin "$head_branch"
git checkout -b "$head_branch" "origin/$head_branch"

is_rebasing=1

exitcode=0 && git rebase "origin/$base_brach" || exitcode=$?
if [[ $exitcode -eq 0 ]]; then is_rebasing=0; fi

while [[ $is_rebasing == 1 ]]; do
  conflicting_files="$(git diff --name-only --diff-filter=U)"
  fixable_files="$(git diff --name-only --diff-filter=U yarn.lock tests/snapshots)"
  if [[ "$conflicting_files" == "$fixable_files" ]]; then
    yarn install
    yarn test -u
    git add yarn.lock tests/snapshots
    exitcode=0 && git rebase --continue || exitcode=$?
    if [[ $exitcode -eq 0 ]]; then
      is_rebasing=0
      break
    fi
  else
    break
  fi
done

if [[ $is_rebasing -eq 0 ]]; then
  git push origin "$head_branch" --force-with-lease
else
  exit $exitcode
fi
