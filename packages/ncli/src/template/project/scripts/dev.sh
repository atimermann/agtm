#!/bin/bash

while true; do
  nodemon -V --loader esm-module-alias/loader --no-warnings  .
  exit_code=$?
  if [ $exit_code -ne 12 ]; then
    break
  fi
  echo "Restarting application..."
  sleep 2
done

