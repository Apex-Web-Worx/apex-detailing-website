#!/bin/bash
set -e
pnpm install --frozen-lockfile
# Package name is @workspace/db (not "db") — wrong filter silently skipped schema pushes.
pnpm --filter @workspace/db push
