#!/bin/bash

while ! mysql -h ${MYSQL_HOST} -P ${MYSQL_PORT} -u root --password="${MYSQL_ROOT_PASSWORD}"  -e ";" ; do
   echo "Can't connect to ${MYSQL_HOST}, retrying in 10 secs..."
   sleep 10
done
echo "Connection to ${MYSQL_HOST} successful"
