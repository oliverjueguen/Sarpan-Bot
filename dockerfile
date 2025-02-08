# Usa una imagen base de Node.js compatible con ARM
FROM arm64v8/node:18

# Establece el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copia el package.json y el package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Instala FFmpeg
RUN apt-get update && apt-get install -y ffmpeg

# Copia el resto de los archivos del proyecto
COPY . .

# Expone el puerto (si tu bot usa un puerto específico)
EXPOSE 3000

# Comando para ejecutar tu bot
CMD ["node", "sarpanbot.js"]