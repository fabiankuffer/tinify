# tinify
Like tinder, but with songs from Spotify
- Env-Variable: SESSIONSECRET & PORT & CLIENTID & CLIENTSECRET & DOMAIN & PROTOCOL & EXTERNALPORT sollten gesetzt werden
- SESSIONSECRET used to create the session-cookies (default: a long string)
- PORT is the internal nodejs port (default: 3000)
- CLIENTID is the client-id from the spotify developer app
- CLIENTSECRET is the client-secret from the spotify developer app
- PROTOCOL is the protocol used for the webserver (http) (default: http)
- domain is the webserver domain (default: localhost)
- EXTERNALPORT ist the external port of the dockercontainer (default: PORT Env-Var)

Allowed domain in spotify app is the domain of the docker-server and the external port of the docker container

## Dockercontainer build
- run docker build . -t <tagname> in the main directory of this repo
- run docker run -p <external-port>:<internal-port> -e CLIENTID=<client-id> -e CLIENTSECRET=<client-secret> -d <tagname>
- run docker stop <container-id> to stop the container
- run docker ps -a to display all container
- run docker rm <container-id> to remove the container
- run docker rmi <image-id> to remove the image
- run docker volume prune to remove all unused volumes, if you know the volume just remove it with docker volume rm <volume-name>