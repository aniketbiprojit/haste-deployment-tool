#!/bin/bash
cd $2

pwd

echo "deploying $1"

git pull --no-edit
yarn
yarn build

pm2 restart $1

cd -
