#!/bin/bash -e

#
# Build project if its contents has changed since the previous run.
#

DIR=`pwd`
CHECKSUM_FILE=$DIR/.checksum

if [ -f $CHECKSUM_FILE ]; then
  PREVIOUS_CHECKSUM=$(cat $CHECKSUM_FILE)
  rm $CHECKSUM_FILE
fi

CURRENT_CHECKSUM=$(find $DIR -type f -exec md5sum {} \; | sort -k 2 | md5sum | cut -d ' ' -f 1)

echo $CURRENT_CHECKSUM > $CHECKSUM_FILE

if [ "$PREVIOUS_CHECKSUM" == "$CURRENT_CHECKSUM" ]; then
  echo "Checksum not changed -> do not build project"
else
  echo "Checksum changed -> build project"
  yarn tsc -p tsconfig.build.json
fi
