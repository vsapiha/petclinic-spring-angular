FROM training/base:2.0.0

RUN dnf config-manager --set-enabled ol9_appstream && \
    dnf update -y && \
    dnf install -y gcc gcc-c++ make python3.9 python3-pip nodejs npm && \
    dnf module enable nodejs:18 && \
    dnf update nodejs && \
    ln -s /usr/bin/python3 /usr/bin/python

WORKDIR /usr/src/

RUN git clone -b update_sb_angular https://github.com/vsapiha/petclinic-spring-angular.git

#RUN mkdir /usr/src/petclinic-frontend
#
#COPY client /usr/src/petclinic-frontend/client
#COPY server /usr/src/petclinic-frontend/server

WORKDIR /usr/src/petclinic-spring-angular/frontend/client

RUN npm install && npm run build:prod

WORKDIR /usr/src/petclinic-spring-angular/frontend/server

RUN npm install

RUN cp -r /usr/src/petclinic-spring-angular/frontend/client/dist/* /usr/src/petclinic-spring-angular/frontend/server/public/

CMD ["npm","start"]
#ENTRYPOINT ["/bin/bash", "/etc/entrypoint.sh"]
