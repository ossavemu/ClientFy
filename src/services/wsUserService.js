import { db } from '../database/connection.js';
import { agendaSchema } from '../schemas/agenda.js';
import { historicSchema, wsUserSchema } from '../schemas/wsUser.js';

export const wsUserService = {
  async createOrUpdateUser(phoneNumber, name) {
    try {
      const userData = wsUserSchema.parse({
        phone_number: phoneNumber,
        name,
      });

      const result = await db.sql`
        INSERT INTO ws_users (phone_number, name)
        VALUES (${userData.phone_number}, ${userData.name})
        ON CONFLICT (phone_number) 
        DO UPDATE SET 
          interaction_count = ws_users.interaction_count + 1,
          last_interaction = CURRENT_TIMESTAMP
        RETURNING *
      `;

      return result[0];
    } catch (error) {
      console.error('Error in createOrUpdateUser:', error);
      throw error;
    }
  },

  async logInteraction(phoneNumber, messageType, content) {
    try {
      const interactionData = historicSchema.parse({
        phone_number: phoneNumber,
        message_type: messageType,
        message_content: content,
      });

      await db.sql`
        INSERT INTO historic (phone_number, message_type, message_content)
        VALUES (${interactionData.phone_number}, ${interactionData.message_type}, ${interactionData.message_content})
      `;
    } catch (error) {
      console.error('Error in logInteraction:', error);
      throw error;
    }
  },

  async getHotUsers() {
    try {
      return await db.sql`SELECT * FROM hot_users`;
    } catch (error) {
      console.error('Error in getHotUsers:', error);
      throw error;
    }
  },

  async createAgenda(phoneNumber, scheduledAt, email, name, zoomLink) {
    try {
      const agendaData = agendaSchema.parse({
        phone_number: phoneNumber,
        scheduled_at: scheduledAt,
        email,
        name,
        zoom_link: zoomLink,
      });

      const result = await db.sql`
        INSERT INTO agenda (
          phone_number, 
          scheduled_at, 
          email, 
          name, 
          zoom_link
        )
        VALUES (
          ${agendaData.phone_number}, 
          ${agendaData.scheduled_at}, 
          ${agendaData.email}, 
          ${agendaData.name}, 
          ${agendaData.zoom_link}
        )
        RETURNING *
      `;

      return result[0];
    } catch (error) {
      console.error('Error in createAgenda:', error);
      throw error;
    }
  },

  async getUpcomingAgenda(phoneNumber) {
    try {
      return await db.sql`
        SELECT * FROM agenda 
        WHERE phone_number = ${phoneNumber} 
        AND scheduled_at > CURRENT_TIMESTAMP
        AND status = 'scheduled'
        ORDER BY scheduled_at ASC
      `;
    } catch (error) {
      console.error('Error in getUpcomingAgenda:', error);
      throw error;
    }
  },

  async updateAgendaStatus(id, status) {
    try {
      const result = await db.sql`
        UPDATE agenda 
        SET status = ${status} 
        WHERE id = ${id}
        RETURNING *
      `;
      return result[0];
    } catch (error) {
      console.error('Error in updateAgendaStatus:', error);
      throw error;
    }
  },

  async getUpcomingAppointments() {
    try {
      // Obtener citas para las próximas 24 horas
      const result = await db.sql`
        SELECT * FROM agenda 
        WHERE scheduled_at BETWEEN NOW() AND NOW() + INTERVAL '24 hours'
        AND status = 'scheduled'
        ORDER BY scheduled_at ASC
      `;
      return result;
    } catch (error) {
      console.error('Error in getUpcomingAppointments:', error);
      throw error;
    }
  },

  async updateAppointmentStatus(phoneNumber, scheduledAt, status) {
    try {
      const result = await db.sql`
        UPDATE agenda 
        SET status = ${status}
        WHERE phone_number = ${phoneNumber}
        AND scheduled_at = ${scheduledAt}
        AND status = 'scheduled'
        RETURNING *
      `;
      return result[0];
    } catch (error) {
      console.error('Error in updateAppointmentStatus:', error);
      throw error;
    }
  },
};
