#!/bin/bash
set -ev;
cd target/webapp/hex-grid-map-3D
git init
git config user.name ${GH_NAME}
git config user.email ${GH_EMAIL}
git add .
git commit -m "Deployed to Github Pages"
git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" master:gh-pages > /dev/null 2>&1
