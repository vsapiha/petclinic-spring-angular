FROM training/base:2.0.0

RUN dnf install -y python3.9 python3-pip

WORKDIR /usr/src/

# RUN git clone -b update-python-requirements https://github.com/vsapiha/petclinic-spring-angular.git
RUN git clone -b update_sb_angular https://github.com/vsapiha/petclinic-spring-angular.git

WORKDIR /usr/src/petclinic-spring-angular/address_resolver/src

RUN python3 -m pip install --upgrade pip && \
    python3 -m venv .venv && \
    source .venv/bin/activate
#RUN pip install gunicorn json-logging-py

#RUN pip install --no-cache-dir -r requirements.txt

#
#COPY config.py .
#COPY search.py .
#
#EXPOSE 5000
#
#ENTRYPOINT ["/usr/local/bin/gunicorn", "--config", "gunicorn.conf", "--log-config", "logging.conf", "-b", ":5000", "server:app"]
