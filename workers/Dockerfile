FROM node:12

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.6.0/wait /wait
RUN chmod +x /wait

RUN chmod 755 /usr/src/app

RUN npm install
# If you are building your code for production
# RUN npm install --only=production

RUN npm install pm2 -g

# Bundle app source
COPY . .

CMD /wait && pm2-runtime start ecosystem.config.js
