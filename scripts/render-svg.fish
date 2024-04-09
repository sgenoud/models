#!/usr/bin/env fish

cd public/models/
for file in $(ls *.js);
    echo $file
    replicad --project $file ../../src/assets/models/$(basename $file)
end;
