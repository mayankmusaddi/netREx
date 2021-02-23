FROM node:9-slim
WORKDIR /app
EXPOSE 3000

COPY package.json .
RUN npm install
COPY . /app