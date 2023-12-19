#!/bin/bash

while true; do
  nodemon -V --import=./esm-loader.mjs .
  exit_code=$?
  if [ $exit_code -ne 12 ]; then
    break
  fi
  echo "Restarting application..."
  sleep 2
done
