FROM node:20-alpine AS build

WORKDIR /app

COPY MediCampus-FrontEnd/package.json MediCampus-FrontEnd/package-lock.json ./
RUN npm install --legacy-peer-deps

COPY MediCampus-FrontEnd/ .

ENV VITE_API_BASE_URL=
RUN npx vite build

FROM nginx:1.27-alpine

COPY MediCampus-FrontEnd/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
