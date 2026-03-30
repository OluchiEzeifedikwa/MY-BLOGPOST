FROM node:22-alpine

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm exec prisma generate

EXPOSE 3000

CMD ["pnpm", "exec", "tsx", "src/index.ts"]
