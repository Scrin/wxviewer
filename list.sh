#!/bin/bash

CACHE_DURATION=60
IMAGE_PATH=/wxrecordings/images

echo -en "Content-Type: text/plain; charset=utf-8\r\n"
echo -en "Cache-Control: max-age=$CACHE_DURATION, public\r\n"
echo -en "Access-Control-Allow-Origin: *\r\n"
echo -en "\r\n"

for DIR in $IMAGE_PATH/*; do
    BASE=$(basename "$DIR" | sed -e 's/-/ /' -e 's/-/ /')
    echo -n "$BASE"
    for FILE in $DIR/*.png; do
        echo -n " $(basename "$FILE" .png | awk "{print substr(\$0,$(expr length "$BASE")+2)}")"
    done
    echo ""
done
