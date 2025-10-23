FROM node:8

WORKDIR /usr/src/
RUN git clone https://github.com/elastic/spring-petclinic.git
ENV PATH /usr/src/spring-petclinic/client/node_modules/.bin:$PATH

WORKDIR /usr/src/spring-petclinic/frontend/client
RUN npm install -g npm@5.6.0
RUN npm install --unsafe-perm
RUN npm run build:prod

ENV NODE_ENV=production
WORKDIR /usr/src/spring-petclinic/frontend/server

ENV PATH /usr/src/spring-petclinic/server/node_modules/.bin:$PATH
RUN npm install
RUN cp /usr/src/spring-petclinic/frontend/client/dist/index.* /usr/src/spring-petclinic/frontend/server/public/
RUN cp -R /usr/src/spring-petclinic/frontend/client/dist/public/ /usr/src/spring-petclinic/frontend/server/public/

COPY sourcemaps /source_maps
RUN cp /usr/src/spring-petclinic/frontend/client/dist/index.js.map /source_maps/index.js.map

COPY entrypoint.sh /etc/entrypoint.sh

ENV NODE_ENV production
EXPOSE 3000
CMD ["npm","start"]
ENTRYPOINT ["/bin/bash", "/etc/entrypoint.sh"]
