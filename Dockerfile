# create a nexjs dockerfile template
FROM node:18-alpine

WORKDIR /app

COPY . .

RUN npm install -g pnpm
RUN pnpm install

RUN pnpm build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["pnpm", "start"]
