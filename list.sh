#!/bin/bash

IMAGE_PATH=/wxrecordings/images
CACHE_FILE=/tmp/wxlist-cache

if [ -f "$CACHE_FILE" ]; then
    LAST_MODIFIED=$(stat --printf="%X\n%Y\n%Z\n" "$IMAGE_PATH/$(ls -t "$IMAGE_PATH" | head -n1)" | sort -n | tail -n1)
    LAST_CACHED=$(stat -c "%Y" "$CACHE_FILE")
    if [ "$LAST_MODIFIED" -lt "$LAST_CACHED" ]; then
        cat "$CACHE_FILE"
        exit 0
    fi
fi

CACHE_DURATION=60
CACHE_TIME="$(date -u)"
TEMP_FILE="$(mktemp)"

function process() {
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
}

process | tee "$TEMP_FILE"
mv "$TEMP_FILE" "$CACHE_FILE"
touch -d "$CACHE_TIME" -m "$CACHE_FILE"
