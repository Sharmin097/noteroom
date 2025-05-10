#!/bin/bash

current_githooks=$(git config --get core.hooksPath)
if [[ $current_githooks != ".githooks" ]]; then
    git config core.hooksPath .githooks  
    echo "set githooks path to .githooks"
fi
exit 0  
