# https://www.docker.com/blog/9-tips-for-containerizing-your-node-js-application/

FROM node:lts-iron
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --omit=dev && npm install @agtm/ncli

COPY src ./src
COPY scripts/generate-prisma-url.mjs ./scripts
COPY prisma ./prisma
COPY config* ./

# Must be run after copying settings
RUN npm run install-assets
RUN npm run prisma:generate

# If you wish to execute a default command, or leave it commented to be defined at runtime
#CMD [ "npm", "run", "job", "appName", "main", "textLoader", "test" ]
#CMD [ "npm", "start"]
