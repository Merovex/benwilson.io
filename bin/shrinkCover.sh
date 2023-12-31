#!/bin/bash

# Check if an argument was provided
if [ $# -eq 0 ]; then
	echo "No filename provided. Usage: $0 filename"
	exit 1
fi

# Extract the filename and extension
#filename=$(basename -- "$1")
path=$1
extension="${path##*.}"
filename="${path%.*}"

# Create a new filename with '-small.avif' appended
new_filename="${filename}-thumbnail.avif"
convert $path -resize 480x720 $new_filename

# Output the new filename
echo $new_filename
