#!/bin/bash
set -ev;
mkdir -p target/gh-pages;
cp ./target/demo/demo.html ./target/gh-pages/index.html;
cp ./target/demo/bundle.js ./target/gh-pages/bundle.js;
cd target/gh-pages
git init
git config user.name ${GH_NAME}
git config user.email ${GH_EMAIL}
git add .
git commit -m "Deployed to Github Pages"
git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" master:gh-pages > /dev/null 2>&1