import fs from 'fs/promises';
import http from 'http';

const STATUS_PORT = 3007;
const EXPECTED_PORTS = [3008, 3009, 3010, 3011];
const MAX_INSTANCES = 4;
const PID_DIR = '/opt/clientfy-bot/pids';

const checkPort = (port) => {
    return new Promise((resolve) => {
        const client = new http.get(`http://localhost:${port}`, (res) => {
            resolve(res.statusCode === 200);
            client.destroy();
        }).on('error', () => {
            resolve(false);
            client.destroy();
        });
    });
};

const getStatus = async () => {
    try {
        const status = {
            timestamp: new Date().toISOString(),
            instances: [],
            healthy: false
        };

        // Verificar cada puerto esperado
        for (const port of EXPECTED_PORTS) {
            const isActive = await checkPort(port);
            status.instances.push({
                port,
                active: isActive,
                pid: null
            });
        }

        // Leer PIDs
        try {
            const files = await fs.readdir(PID_DIR);
            for (const file of files) {
                if (file.endsWith('.pid')) {
                    const pid = await fs.readFile(`${PID_DIR}/${file}`, 'utf8');
                    const instanceId = parseInt(file.split('-')[1]);
                    if (status.instances[instanceId - 1]) {
                        status.instances[instanceId - 1].pid = parseInt(pid.trim());
                    }
                }
            }
        } catch (error) {
            console.error('Error reading PID files:', error);
        }

        // Verificar si todos los puertos están activos
        status.healthy = status.instances.every(instance => instance.active);
        
        return status;
    } catch (error) {
        return {
            timestamp: new Date().toISOString(),
            error: error.message,
            healthy: false,
            instances: []
        };
    }
};

// Crear servidor HTTP para el estado
const server = http.createServer(async (req, res) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Received request: ${req.method} ${req.url}`);
    
    if (req.url === '/state') {
        try {
            const status = await getStatus();
            console.log(`[${timestamp}] Sending status response:`, JSON.stringify(status));
            res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify(status, null, 2));
        } catch (error) {
            console.error(`[${timestamp}] Error:`, error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    } else {
        console.log(`[${timestamp}] Invalid path: ${req.url}`);
        res.writeHead(404);
        res.end();
    }
});

server.on('error', (error) => {
    console.error('Server error:', error);
});

server.listen(STATUS_PORT, '0.0.0.0', () => {
    console.log(`Status server running on port ${STATUS_PORT}`);
}); 