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

# Iniciar el servidor de estado usando screen
echo "Iniciando servidor de estado..."
cd "$CURRENT_DIR"
sudo -u $ACTUAL_USER screen -dmS estado bash -c "node src/status.js > '$LOG_DIR/status.log' 2>&1"

# Iniciar las 4 instancias usando screen
echo "Iniciando instancias..."
for i in {1..4}; do
    port=$((3007 + i))
    sudo -u $ACTUAL_USER screen -dmS "instancia-$i" bash -c "INSTANCE_ID=$i PORT=$port node src/app.js > '$LOG_DIR/instance-$i.log' 2>&1"
done

echo "Todas las instancias han sido iniciadas con screen."
echo "Para ver los logs: tail -f $LOG_DIR/*.log"
echo "Para detener todas las instancias: screen -ls | grep Detached | cut -d. -f1 | awk '{print $1}' | xargs kill"
