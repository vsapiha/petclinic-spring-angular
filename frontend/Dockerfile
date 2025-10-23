FROM node:18.20

# docker build -t training/petclinic-client:2.0.0 .
# docker run -it --rm training/petclinic-client:2.0.0 bash

RUN mkdir /usr/src/petclinic-frontend
#ENV PATH /usr/src/petclinic-frontend/client/node_modules/.bin:$PATH

COPY client /usr/src/petclinic-frontend/client
COPY server /usr/src/petclinic-frontend/server

WORKDIR /usr/src/petclinic-frontend/client

RUN npm install && npm run build:prod

WORKDIR /usr/src/petclinic-frontend/server

RUN npm install

RUN cp -r /usr/src/petclinic-frontend/client/dist/* /usr/src/petclinic-frontend/server/public/
#RUN cp -R /usr/src/petclinic-frontend/client/dist/public/ /usr/src/petclinic-frontend/server/public/
#
#RUN mkdir /source_maps
#RUN cp /usr/src/petclinic-frontend/client/dist/index.js.map /source_maps/index.js.map
#
#COPY entrypoint.sh /etc/entrypoint.sh
#
#ENV NODE_ENV production
#EXPOSE 3000
CMD ["npm","start"]
#ENTRYPOINT ["/bin/bash", "/etc/entrypoint.sh"]
