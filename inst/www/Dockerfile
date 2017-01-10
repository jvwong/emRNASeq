FROM node:boron

RUN mkdir -p /home/nodejs/app
WORKDIR /home/nodejs/app

RUN groupadd -r nodejs && useradd -m -r -g nodejs nodejs

COPY . /home/nodejs/app
RUN npm install --production
# RUN npm install -g bower
# RUN bower install --allow-root

EXPOSE 8080
USER nodejs

CMD ["npm", "start"]
