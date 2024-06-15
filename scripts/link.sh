#!/bin/bash

cd public || exit 1
for dir in */ ; do
  cd "$dir" || continue
  echo "npm link $dir"
  npm link
  cd ..
done
