
FROM node:20-alpine AS builder

WORKDIR /app


COPY package*.json ./


RUN npm install


COPY . .


RUN npm run build   


FROM node:20-alpine

WORKDIR /app

# Copy only required files
COPY package*.json ./
RUN npm install --only=production

# Copy compiled JS from builder
COPY --from=builder /app/dist ./dist

# Expose backend port
EXPOSE 3000

# Start app
CMD ["node", "dist/index.js"]
