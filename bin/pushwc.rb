#!/bin/sh
./bin/cosmopolitan.rb
./bin/countScrivenerHistory.rb
./bin/contributionMap.rb
git commit -am "Updating wordcount"
git push origin master
