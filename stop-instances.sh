#!/bin/bash

# Asegurar que el script se ejecuta con permisos de sudo
if [ "$EUID" -ne 0 ]; then 
    echo "Por favor, ejecuta el script con sudo"
    exec sudo "$0" "$@"
fi

# Configuración de directorios
APP_DIR="/opt/clientfy-bot"
PID_DIR="$APP_DIR/pids"

# Función para matar proceso y liberar puerto
kill_port() {
    local port=$1
    local pid=$(sudo lsof -t -i:$port)
    if [ ! -z "$pid" ]; then
        echo "Matando proceso en puerto $port (PID: $pid)"
        sudo kill -9 $pid 2>/dev/null || true
    fi
}

# Detener procesos usando los PIDs guardados
if [ -d "$PID_DIR" ]; then
    echo "Deteniendo instancias..."
    for pid_file in "$PID_DIR"/*.pid; do
        if [ -f "$pid_file" ]; then
            pid=$(cat "$pid_file")
            if kill -0 $pid 2>/dev/null; then
                sudo kill -15 $pid
                echo "Detenido proceso $pid"
            fi
            rm "$pid_file"
        fi
    done
    echo "Todas las instancias han sido detenidas"
else
    echo "No se encontró directorio de PIDs"
fi

# Asegurar que todos los puertos estén liberados
for port in {3008..3011}; do
    kill_port $port
done

# Limpiar cualquier proceso residual
sudo pkill -9 -f "node src/app.js" 2>/dev/null || true

echo "Todos los puertos han sido liberados"