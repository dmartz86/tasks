FROM node:alpine
COPY package*.json ./
COPY ./src ./
RUN npm install
CMD ["npm", "start"]
