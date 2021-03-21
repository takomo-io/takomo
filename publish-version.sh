#!/bin/bash -e

read -sp 'Github token: ' token
echo

if [ -z $token ]; then
  echo "ERROR - Github token is required"
  exit
fi

GH_TOKEN=$token yarn publish-version
