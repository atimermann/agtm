#!/bin/bash

while true; do
  node --loader=./esm-loader.mjs src/run.mjs
  exit_code=$?
  if [ $exit_code -ne 12 ]; then
    break
  fi
  echo "Restarting application..."
  sleep 2
done
