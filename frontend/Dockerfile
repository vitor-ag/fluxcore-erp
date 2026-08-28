# Etapa 1: build da aplicação Angular
FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production

# Etapa 2: servir os arquivos estáticos com Nginx
FROM nginx:alpine
# ATENÇÃO: ajuste "frontend/browser" conforme o outputPath do seu angular.json
# (Angular 17+ costuma gerar em dist/<nome-do-projeto>/browser)
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
