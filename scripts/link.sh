#!/bin/bash

for main_dir in public private ; do
  cd "$main_dir" || exit 1
  for dir in */ ; do
    cd "$dir" || continue
    echo "npm link $dir"
    npm link
    cd ..
  done
  cd ..
done
