FROM node:17

# Create app directory
WORKDIR /usr/src/app

#copy nodejs infos
COPY package*.json ./

#nodejs setup
RUN npm install

#copy all data
COPY . .

#create folder for the volume to store the db persistent
RUN mkdir -p /usr/src/app/db/db

#create volume
VOLUME /usr/src/app/db/db

#EXPORT PORT
EXPOSE 3000

#comand to start the nodejs server
CMD [ "node", "webserver.js" ]
