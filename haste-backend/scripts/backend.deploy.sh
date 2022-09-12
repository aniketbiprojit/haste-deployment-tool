#!/bin/bash
cd $2

pwd

echo "deploying $1"

git pull --no-edit
npm i
npx tsc -p .

pm2 restart $1

cd -