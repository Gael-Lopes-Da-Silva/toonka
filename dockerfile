FROM node:latest
WORKDIR /app
COPY . .
RUN npm install
RUN npm run drizzle:migrate
CMD ["npm", "run", "start"]
