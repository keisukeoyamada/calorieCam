# Stage 1: Reactアプリケーションのビルド
FROM node:20-alpine as build-stage

WORKDIR /app

# package.jsonとpackage-lock.jsonをコピーし、依存関係をインストール
COPY package*.json ./
RUN npm install

# ソースコードをコピー
COPY . .

# Reactアプリケーションをビルド
RUN npm run build

# Stage 2: Nginxでアプリケーションを配信
FROM nginx:stable-alpine as production-stage

# ビルドステージで作成された静的ファイルをNginxの公開ディレクトリにコピー
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 必要であればカスタムNginx設定ファイルをコピー
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginxがリッスンするポートを公開
EXPOSE 80

# Nginxをフォアグラウンドで実行
CMD ["nginx", "-g", "daemon off;"]
