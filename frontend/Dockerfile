FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

# Устанавливаем yarn
RUN npm install -g yarn

# Используем yarn
RUN yarn install --network-timeout 600000

COPY . .

RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]