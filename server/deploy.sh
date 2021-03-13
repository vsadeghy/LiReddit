#!/bin/bash

echo What version should it be?
read VERSION

REPO=vahidss/lireddit:$VERSION

echo your repo is $REPO
docker build -t $REPO .
docker push $REPO