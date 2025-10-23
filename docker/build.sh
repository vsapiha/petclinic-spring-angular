#!/bin/bash

export STACK_VERSION=2.0.0

(cd base; ./build.sh);

(cd mysql; ./build.sh);

(cd petclinic-server; ./build.sh);

#(cd petclinic-client; ./build.sh);

(cd address-finder; ./build.sh);

