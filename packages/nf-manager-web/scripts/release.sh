#!/bin/bash

npm run lint &&
npm run test &&
npm run prepack &&
read -p "Do you confirm that you want to proceed with the release? [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    npx dotenv -- npx semantic-release
fi