FROM node:9-slim
WORKDIR /app
COPY package.json /app
COPY netrex-1.0.0.tgz /app
RUN sudo npm i -g netrex-1.0.0.tgz
RUN apt-get update && apt-get install -y vim
COPY . /app
CMD ["npm", "start"]