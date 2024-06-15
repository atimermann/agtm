#!/bin/bash

if [[ "$1" != "patch" && "$1" != "minor" && "$1" != "major" ]]; then
  echo "Invalid argument. Please provide 'patch', 'minor', or 'major'."
  exit 1
fi

echo "Before publishing it is necessary to run npm run generate-web. Continue? [y/n]"
read answer

if [ "$answer" == "y" ]; then
  npm version "$1"
  npm publish --access public
  git push
else
  echo "Operation canceled."
fi