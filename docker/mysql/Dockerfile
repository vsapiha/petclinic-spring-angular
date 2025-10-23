FROM training/base:2.0.0

# docker run -it --rm -p 3306:3306 -e MYSQL_ROOT_PASSWORD=petclinic -e MYSQL_ALLOW_EMPTY_PASSWORD=true -e MYSQL_USER=petclinic -e MYSQL_PASSWORD=petclinic -e MYSQL_DATABASE=petclinic  training/mysql:2.0.0 bash
# yum repolist all | grep mysql

RUN rpm --import https://repo.mysql.com/RPM-GPG-KEY-mysql-2023 \
    && dnf install https://repo.mysql.com//mysql84-community-release-el9-2.noarch.rpm \
    && dnf module disable mysql \
    && dnf install -y mysql-community-server \
    && mkdir /docker-entrypoint-initdb.d

RUN chown -R mysql:mysql /var/lib/mysql
RUN mkdir /var/log/mysql
RUN chown -R mysql:mysql /var/log/mysql

VOLUME /var/lib/mysql
VOLUME /var/log/mysql

COPY my.cnf /etc/my.cnf
COPY db_ready.sh /etc/db_ready.sh
COPY init.sql /tmp/
COPY healthcheck.sh /healthcheck.sh
COPY docker-entrypoint.sh /home/elastic/entrypoint.sh
COPY *.sql /home/elastic/
COPY scripts/ /root/start-scripts/

RUN chown elastic:elastic /tmp/init.sql
RUN chmod 755 /etc/db_ready.sh
RUN chmod 755 /home/elastic/entrypoint.sh
RUN chown -R elastic:elastic /home/elastic/*
RUN chmod a+x /root/start-scripts/*

# ???
# RUN base64 /dev/urandom | head -c 300000000 > /opt/db_backup.sql

EXPOSE 3306

HEALTHCHECK CMD /healthcheck.sh

CMD ["/root/startup.sh"]
