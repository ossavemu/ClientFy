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
PID_DIR="$APP_DIR/pids"
CURRENT_DIR=$(pwd)

# Crear estructura de directorios
echo "Creando estructura de directorios..."
sudo mkdir -p "$APP_DIR" "$LOG_DIR" "$PID_DIR"

# Establecer permisos
echo "Estableciendo permisos..."
sudo chown -R $ACTUAL_USER:$ACTUAL_USER "$APP_DIR"
sudo chmod -R 755 "$APP_DIR"

# Función para verificar si un puerto está en uso
check_port() {
    local port=$1
    netstat -tuln | grep -q ":$port "
    return $?
}

# Función para matar cualquier proceso usando un puerto específico
kill_port() {
    local port=$1
    local pid=$(sudo lsof -t -i:$port)
    if [ ! -z "$pid" ]; then
        echo "Matando proceso en puerto $port (PID: $pid)"
        sudo kill -9 $pid 2>/dev/null || true
    fi
}

# Función para iniciar una instancia
start_instance() {
    local instance_id=$1
    local base_port=3008
    local max_instances=4
    
    # Validar instance_id
    if [ "$instance_id" -lt 1 ] || [ "$instance_id" -gt "$max_instances" ]; then
        echo "Error: Instance ID debe estar entre 1 y $max_instances"
        return 1
    fi
    
    local port=$((base_port + instance_id - 1))
    
    # Asegurar que el puerto esté libre
    kill_port $port
    
    while true; do
        echo "Iniciando instancia $instance_id en puerto $port..."
        if check_port $port; then
            echo "Puerto $port está en uso, liberando..."
            kill_port $port
            sleep 2
        fi
        
        # Forzar el puerto específico para esta instancia
        cd "$CURRENT_DIR" && \
        sudo -u $ACTUAL_USER INSTANCE_ID=$instance_id PORT=$port pnpm start
        
        echo "Instancia $instance_id se detuvo. Reiniciando en 5 segundos..."
        sleep 5
    done
}

# Limpiar PIDs antiguos y puertos en uso
echo "Limpiando procesos antiguos..."
rm -f "$PID_DIR"/*.pid
for port in {3007..3015}; do
    kill_port $port
done

# Limpiar cualquier proceso residual
sudo pkill -9 -f "node src/app.js" 2>/dev/null || true
sudo pkill -9 -f "node src/status.js" 2>/dev/null || true

# Iniciar servidor de estado
echo "Iniciando servidor de estado..."
cd "$CURRENT_DIR" && \
sudo -u $ACTUAL_USER node src/status.js > "$LOG_DIR/status.log" 2>&1 &
echo $! > "$PID_DIR/status.pid"

# Iniciar cada instancia en segundo plano
echo "Iniciando instancias..."
for i in {1..4}; do
    start_instance $i > "$LOG_DIR/instance-$i.log" 2>&1 &
    instance_pid=$!
    echo "Iniciada instancia $i en segundo plano (PID: $instance_pid) en puerto $((3007 + i))"
    echo $instance_pid > "$PID_DIR/instance-$i.pid"
done

echo "Todas las instancias han sido iniciadas en segundo plano"
echo "Para ver los logs: sudo tail -f $LOG_DIR/instance-*.log"
echo "Para detener: sudo pnpm stop-all" 