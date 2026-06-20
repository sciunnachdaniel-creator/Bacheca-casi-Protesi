# Dockerfile per il posizionamento dell'applicazione su Synology NAS
FROM node:20-alpine AS builder

WORKDIR /app

# Copia i file delle dipendenze
COPY package*.json ./

# Installa tutte le dipendenze (incluse quelle di sviluppo necessarie per la build)
RUN npm install

# Copia il codice sorgente
COPY . .

# Compila l'applicazione client e il server backend
RUN npm run build

# Stage di produzione
FROM node:20-alpine AS runner

WORKDIR /app

# Imposta in modalità produzione
ENV NODE_ENV=production

# Copia le configurazioni
COPY package*.json ./

# Installa solo le dipendenze di produzione (essenziali per l'esecuzione)
RUN npm install --omit=dev

# Copia i file compilati dallo stage builder
COPY --from=builder /app/dist ./dist

# Espone la porta interna dell'applicazione (3000)
EXPOSE 3000

# Avvia l'applicazione usando il comando di produzione
CMD ["npm", "run", "start"]
