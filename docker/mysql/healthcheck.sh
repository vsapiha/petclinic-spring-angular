if [ -f /mysql-init-complete ]; # The entrypoint script touches this file
then # Ping server to see if it is ready
  mysqladmin --defaults-extra-file=/healthcheck.cnf ping
else # Initialization still in progress
  exit 1
fi
