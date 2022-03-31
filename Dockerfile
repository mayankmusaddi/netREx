FROM node:12
WORKDIR /app
EXPOSE 3000

COPY package.json .
RUN npm install
COPY . /app