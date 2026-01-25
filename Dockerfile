FROM node:18-alpine AS build
WORKDIR /app
RUN npm install -g typescript
COPY backend/package.json ./
RUN npm install
COPY backend .
RUN tsc

FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
RUN npm install --omit=dev
EXPOSE 5000
CMD ["node", "dist/server.js"]
