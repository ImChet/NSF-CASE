# This will build our client and our server
FROM node:20.12-slim

WORKDIR /app

COPY package.json package.json

# Server component
COPY server.js server.js
RUN npm install --quiet

CMD [ "node", "server.js" ]