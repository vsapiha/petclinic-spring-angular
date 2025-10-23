#!/bin/bash

chown -R mysql:mysql /var/lib/mysql
chown -R mysql:mysql /var/log/mysql

#Initialize the DB
/home/elastic/entrypoint.sh mysqld

#Start the DB and load the petclinic data
mysqld --init-file=/tmp/init.sql &

#mysqld &
#mysqld --user=root --upgrade=FORCE