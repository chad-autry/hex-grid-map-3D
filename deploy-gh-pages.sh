#!/bin/bash
echo "gather files for deployment...";
mkdir -p target/gh-pages;
cp test.html ./target/gh-pages/index.html;
cp bundle.js ./target/gh-pages/bundle.js;
echo "starting deploy...";
( cd target/gh-pages
 git init
 git config user.name ${GIT_NAME}
 git config user.email ${GIT_EMAIL}
 git add .
 git commit -m "Deployed to Github Pages"
 git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" master:gh-pages > /dev/null 2>&1
)
echo "completed deploy...";