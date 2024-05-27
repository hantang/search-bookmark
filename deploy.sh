#!/usr/bin/env bash
set -eu

TARGET="site"

pwd

if [[ -d $TARGET ]]; then
    echo "*** clean $TARGET"
    rm -rf $TARGET
fi
cp -r src/$TARGET ./$TARGET

echo "Done"
