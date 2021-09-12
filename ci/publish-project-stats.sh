#!/bin/bash -e

# Change to dir containing this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"
cd ..

PROJECT_SIZE=$(du -sb . | awk '{print $1;}')
echo "project size in bytes: $PROJECT_SIZE"

PROJECT_FILE_COUNT=$(find . -type f | wc -l | tr -d '[:space:]')
echo "project file count: $PROJECT_FILE_COUNT"

aws cloudwatch put-metric-data \
  --region eu-west-1 \
  --namespace Project \
  --metric-name ProjectSize \
  --unit Bytes \
  --value $PROJECT_SIZE

aws cloudwatch put-metric-data \
  --region eu-west-1 \
  --namespace Project \
  --metric-name ProjectFileCount \
  --unit Count \
  --value $PROJECT_FILE_COUNT
