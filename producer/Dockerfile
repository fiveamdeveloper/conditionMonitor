# Selects node base image:latest
FROM node:alpine

# Set working dir for following commands
WORKDIR /producer/

# Adds static files to container; mounts files at /server directory
ADD package.json package-lock.json /producer/
RUN npm install

# Add app source and mount at /src/
ADD producer.js /producer/

# Exectues node.js application
CMD node /producer/producer.js