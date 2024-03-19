#!/bin/sh
./bin/cosmopolitan.rb
#./bin/countScrivenerHistory.rb
#./bin/contributionMap.rb
git add _posts/*
git commit -am "Updating content"
git push origin master
