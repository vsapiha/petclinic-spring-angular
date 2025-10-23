FROM training/base:2.0.0

RUN dnf install -y python3.9 python3-pip

WORKDIR /usr/src/

RUN git clone -b update-python-requirements https://github.com/vsapiha/petclinic-spring-angular.git

WORKDIR /usr/src/spring-petclinic/address_resolver/src

RUN pip install gunicorn json-logging-py
RUN pip install --no-cache-dir -r requirements.txt

COPY config.py .
COPY search.py .

EXPOSE 5000

ENTRYPOINT ["/usr/local/bin/gunicorn", "--config", "gunicorn.conf", "--log-config", "logging.conf", "-b", ":5000", "server:app"]
