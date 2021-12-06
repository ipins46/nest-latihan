FROM node:12.22.1

WORKDIR /app
COPY package.json .
RUN npm install
COPY . .

CMD npm run start:dev