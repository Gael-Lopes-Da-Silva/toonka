FROM node:latest
WORKDIR /app
COPY . .
RUN npm install
RUN npm run drizzle:migrate
# RUN npm run build
CMD ["npm", "run", "start"]
