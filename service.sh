#!/bin/bash

scriptPath="$( readlink -f "$( dirname "$0" )" )/$( basename "$0" )"
currentDirectory=$(dirname $scriptPath)

cd $currentDirectory
/home/neolao/.nvm/versions/node/v16.17.0/bin/node server.js
