FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json .
COPY tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts tailwind.config.ts postcss.config.cjs index.html ./
COPY src ./src
RUN npm install
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
