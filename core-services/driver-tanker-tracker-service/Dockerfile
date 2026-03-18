FROM node:18-alpine


ARG WORK_DIR
ENV npm_config_cache=/tmp

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY ${WORK_DIR} .


# set your port
ENV PORT 3000


# start command as per package.json
CMD ["npm", "start"]
