# Selects node base image:latest
FROM node:alpine

# Expose port 3000
EXPOSE 3000

# Set working dir for following commands
WORKDIR /server/

# Adds static files to container; mounts files at /server directory
ADD package.json package-lock.json /server/
RUN npm install express http socket.io path mysql2 kafkajs

# Add app source and mount at /src/
ADD app.js /server/

# Exectues node.js application
CMD node /server/app.js
