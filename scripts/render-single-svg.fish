#!/usr/bin/env fish

replicad -V
replicad --project $argv[1] ./src/assets/models/$(basename $argv[1])
