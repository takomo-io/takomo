#!/bin/bash
echo "------"
pwd
echo "------"
rm -rf node_modules
rm -f package-lock.json
npm install --loglevel verbose
for i in {1..30}; do cat package-lock.json; done