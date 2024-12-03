#!/bin/bash

# Asegurar que el script se ejecuta con permisos de sudo
if [ "$EUID" -ne 0 ]; then 
    echo "Por favor, ejecuta el script con sudo"
    exec sudo "$0" "$@"
fi

# Configuración de directorios y usuario actual
ACTUAL_USER=$SUDO_USER
if [ -z "$ACTUAL_USER" ]; then
    ACTUAL_USER=$(whoami)
fi

# Configuración de directorios
APP_DIR="/opt/clientfy-bot"
LOG_DIR="$APP_DIR/logs"
CURRENT_DIR=$(pwd)

# Crear estructura de directorios
echo "Creando estructura de directorios..."
mkdir -p "$APP_DIR" "$LOG_DIR"

# Establecer permisos
echo "Estableciendo permisos..."
chown -R $ACTUAL_USER:$ACTUAL_USER "$APP_DIR"
chmod -R 755 "$APP_DIR"

# Instalar PM2 globalmente si no está instalado
if ! command -v pm2 &> /dev/null; then
    echo "Instalando PM2..."
    npm install -g pm2
fi

# Limpiar instancias antiguas
echo "Deteniendo instancias antiguas..."
sudo -u $ACTUAL_USER pm2 stop all || true
sudo -u $ACTUAL_USER pm2 delete all || true

# Iniciar el servidor de estado usando PM2
echo "Iniciando servidor de estado..."
cd "$CURRENT_DIR"
sudo -u $ACTUAL_USER pm2 start src/status.js --name "estado" --log "$LOG_DIR/status.log"

# Iniciar las 4 instancias usando PM2
echo "Iniciando instancias..."
for i in {1..4}; do
    port=$((3007 + i))
    sudo -u $ACTUAL_USER pm2 start src/app.js --name "instancia-$i" \
        --log "$LOG_DIR/instance-$i.log" \
        -- --port $port --instance_id $i -i 1
done

# Configurar PM2 para iniciar en el arranque
pm2 startup
pm2 save

echo "Todas las instancias han sido iniciadas con PM2."
echo "Para ver los logs: pm2 logs"
echo "Para detener todas las instancias: pm2 delete all"
