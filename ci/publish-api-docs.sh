#!/bin/bash -e

# Change to dir containing this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"
cd ..

aws s3 sync \
  --delete \
  --region eu-west-1 \
  --cache-control "public, max-age=60" \
  --exclude "*" \
  --include "*.html" \
  api-docs s3://takomo-website-bucket$DOCS_BASE

aws s3 sync \
  --delete \
  --region eu-west-1 \
  --cache-control "public, max-age=604800" \
  --exclude "*.html" \
  api-docs s3://takomo-website-bucket$DOCS_BASE