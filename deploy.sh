#!/usr/bin/env bash
set -eu
TARGET="${1:-site}"
SOURCE="${2:-src}"

ignores=("manifest.json" "popup.html" "dupes.html" "static/js/dupes.js")

echo "target: ${TARGET} / source: ${SOURCE}"

if [[ -d $TARGET ]]; then
	echo "*** clean $TARGET"
	rm -rf $TARGET
fi

echo "copy to target"
cp -r ${SOURCE} ./$TARGET

echo "clean to ignores"
for name in "${ignores[@]}"; do
	if [[ -f $TARGET/$name ]]; then
		rm -rf $TARGET/$name
	fi
done

echo "Done"
