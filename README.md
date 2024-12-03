# ClientFy - Bot de WhatsApp para Agendamiento

Bot inteligente de WhatsApp que permite agendar citas de manera conversacional, con soporte para mensajes de texto y notas de voz.

## 🚀 Características

- **Interacción Natural**: Procesamiento de lenguaje natural para entender solicitudes de agenda
- **Soporte Multi-formato**:
  - Mensajes de texto
  - Notas de voz
  - Selección numérica o textual de horarios
- **Gestión Inteligente de Agenda**:
  - Verificación de disponibilidad en tiempo real
  - Sugerencia de horarios alternativos
  - Confirmación de citas
- **Integración con Servicios**:
  - Google Calendar
  - Zoom (generación automática de enlaces)
  - Email (confirmaciones y recordatorios)
- **Base de Datos**:
  - Registro de usuarios
  - Historial de interacciones
  - Sistema de usuarios frecuentes
  - Registro de agendas

## 📋 Requisitos Previos

- Node.js v18 o superior
- pnpm
- PostgreSQL (Neon DB)
- Cuenta de Google Cloud (para Calendar y Gmail)
- Cuenta de Zoom
- Cuenta de OpenAI
- WhatsApp Business API o Baileys

## 🛠️ Configuración

1. Clonar el repositorio:

```bash
git clone [url-del-repositorio]
cd ClientFyAdmin
```

2. Instalar dependencias:

```bash
pnpm install
```

3. Configurar variables de entorno:

```bash
cp .env.example .env
```

4. Configurar las siguientes variables en el archivo `.env`:

```env
DATABASE_URL=
GMAIL_USER=
GMAIL_APP_PASSWORD=
ZOOM_ACCOUNT_ID=
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=
OPENAI_API_KEY=
```

5. Ejecutar migraciones:

```bash
pnpm run migrate
```

## 🚀 Ejecución

Desarrollo:

```bash
pnpm run dev-bot
```

## 📚 Estructura del Proyecto

```
/src
  /config         # Configuraciones
  /database      # Conexión y migraciones DB
  /schemas       # Schemas de validación (Zod)
  /services      # Servicios externos
  /templates     # Flujos de conversación
  /utils         # Utilidades
```

## 🔄 Flujos Principales

1. **Bienvenida y Detección de Intención**

   - Procesamiento de mensaje inicial
   - Detección de usuarios frecuentes
   - Identificación de intención de agenda

2. **Proceso de Agenda**

   - Mostrar slots disponibles
   - Procesamiento de selección (texto/voz)
   - Confirmación de horario
   - Recolección de datos (nombre, email)

3. **Confirmación**
   - Creación de evento en Calendar
   - Generación de link de Zoom
   - Envío de emails de confirmación
   - Registro en base de datos

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add: nueva característica'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles

## 👥 Autores

- **Tu Nombre** - _Trabajo Inicial_ - [TuUsuario](https://github.com/TuUsuario)

## 🙏 Agradecimientos

- BuilderBot por el framework de bot
- OpenAI por el procesamiento de lenguaje natural
- Neon DB por el hosting de PostgreSQL
