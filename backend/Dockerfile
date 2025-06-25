# Usa immagine ufficiale Node.js leggera
FROM node:20-alpine

# Imposta la working directory
WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Installa le dipendenze (senza devDependencies)
RUN npm ci --omit=dev

# Copia tutto il codice
COPY . .

# Espone la porta su cui gira il backend
EXPOSE 5000

# Comando per avviare il backend
CMD ["node", "index.js"]
