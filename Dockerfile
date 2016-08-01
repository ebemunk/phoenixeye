FROM node:argon
RUN mkdir -p /phoenixeye
WORKDIR /phoenixeye
# COPY package.json /phoenixeye
# RUN npm install
COPY bin dist /phoenixeye/
EXPOSE 3000
CMD [ "node", "server.js" ]
