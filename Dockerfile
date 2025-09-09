FROM node:20.19.2-alpine AS base

#--------------------------------------------------

FROM base AS dev
RUN npm install -g --ignore-scripts pnpm

#--------------------------------------------------

FROM dev AS build
WORKDIR /app
COPY next.config.ts package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY ./src ./src
COPY ./prisma ./prisma
RUN \
	pnpm run prisma:dev && \
	pnpm run build

#--------------------------------------------------

FROM dev AS library
WORKDIR /app
COPY next.config.ts package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN \
	pnpm install --frozen-lockfile --prod --ignore-scripts && \
	pnpm cache delete

#--------------------------------------------------

FROM base AS production
ARG NODE_ENV=production
RUN \
	addgroup -S nextjs && \
	adduser -S nextjs -G nextjs
WORKDIR /app
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/prisma/translate-novels-database.db ./prisma/translate-novels-database.db
RUN \
	chown -R nextjs:nextjs ./prisma && \
	chmod -R 700 ./prisma
USER nextjs
ENTRYPOINT ["node", "server.js"]
EXPOSE 3000
