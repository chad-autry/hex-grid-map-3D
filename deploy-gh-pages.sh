#!/bin/bash
set -ev
bundle exec rake:units
if [ "${TRAVIS_PULL_REQUEST}" = "false" ]; then
  echo "test 1"
fi

if [ "${TRAVIS_PULL_REQUEST}" = "true" ]; then
  echo "test 2"
fi