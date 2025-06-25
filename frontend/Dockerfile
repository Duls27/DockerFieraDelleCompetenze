# 1. Build del frontend con Node
FROM node:18 AS builder

WORKDIR /app

# Copia i file package.json e package-lock.json e installa le dipendenze
COPY package*.json ./
RUN npm install

# Copia il resto del codice
COPY . .

# Definisci un argomento di build per l'URL backend
ARG REACT_APP_API_BASE_URL

# Passa la variabile d'ambiente durante la build di React
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

# Esegui la build di produzione
RUN npm run build

# 2. Serve la build statica con nginx
FROM nginx:alpine

# Copia la build generata nella cartella standard di nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Espone la porta 80
EXPOSE 80

# Avvia nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
