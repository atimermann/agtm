FROM node:lts-iron

WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN npm run build
RUN rm -rf node_modules

ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000
EXPOSE 3000

ENTRYPOINT ["node", ".output/server/index.mjs"]
