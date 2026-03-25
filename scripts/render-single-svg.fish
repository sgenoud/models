#!/usr/bin/env fish

replicad --projection $argv[1] ./src/assets/models/$(basename $argv[1])
