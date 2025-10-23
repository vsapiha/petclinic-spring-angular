#!/bin/bash

if [ -z ${STACK_VERSION} ]
then
  echo "STACK_VERSION is not defined!"
  exit 1
fi

version=$(eval echo \$\{STACK_VERSION\})
docker build --build-arg version=$version -t training/petclinic-client:$version .
