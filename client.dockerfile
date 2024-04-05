# This will build our client and our server
FROM node:20.12-slim

WORKDIR /app

COPY . .
RUN npm install -D --quiet

CMD [ "./buildFrontend.sh"]