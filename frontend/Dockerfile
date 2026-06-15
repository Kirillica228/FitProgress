FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

# yarn уже встроен в node:22-alpine, просто используем его
RUN yarn install --network-timeout 600000

COPY . .

RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]