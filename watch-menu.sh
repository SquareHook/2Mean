#!/bin/bash
# script for catting together menu.json's
# replace closing brackets at line start, not including first line
# remove opening brakcets at line start, not including first line
# delete empty lines
# remove comma on last line
# add json formating braces
cat app-client/**/config/menu.json | sed -e '1 s/^/\"menu_items\":/' \
    -e '2,$ s/^\]/,/' \
    -e '2,$ s/^\[//' \
    -e '/^$/ d' \
    -e '$ s/,/]/' \
    -e '1 i{' \
    -e '$ a }'
