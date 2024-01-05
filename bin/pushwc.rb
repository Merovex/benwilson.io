#!/bin/sh
./bin/countScrivenerHistory.rb
git commit -am "Updating wordcount"
git push origin master
