import { google } from 'googleapis';

const appEmail = 'clientfy0@gmail.com';

const auth = new google.auth.GoogleAuth({
  keyFile: './clientfycalendar.json',
  scopes: ['https://www.googleapis.com/auth/calendar'],
  subject: appEmail,
});

const calendar = google.calendar({
  version: 'v3',
});

const calendarId =
  'ef57ef92ca34146eee5b0d6351573fa3728a2a0b179dc0669022e4b9deaa8c19@group.calendar.google.com';

const timeZone = 'America/Bogota';

const rangeLimit = {
  days: [1, 2, 3, 4, 5],
  startHour: 9,
  endHour: 18,
};

const standardDuration = 1;

const dateLimit = 30;

export async function createEvent(
  eventName,
  description,
  date,
  duration = standardDuration
) {
  try {
    const authClient = await auth.getClient();

    google.options({ auth: authClient });

    console.log('Input date:', date);
    console.log('Input duration:', duration);

    const startDate = new Date(date);
    console.log('Start date object:', startDate);
    console.log('Start date hours:', startDate.getHours());
    console.log('Start date ISO:', startDate.toISOString());

    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + duration);
    console.log('End date object:', endDate);
    console.log('End date hours:', endDate.getHours());
    console.log('End date ISO:', endDate.toISOString());

    const event = {
      summary: eventName,
      description: description,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: timeZone,
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: timeZone,
      },
      colorId: '2',
      conferenceData: {
        createRequest: {
          requestId: Math.random().toString(36).substring(7),
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: calendarId,
      requestBody: event,
    });

    const eventId = response.data.id;

    console.log(`Event created: ${eventId}`);

    return eventId;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
}

export async function listAvailableSlots(startDate = new Date(), endDate) {
  try {
    const authClient = await auth.getClient();

    google.options({ auth: authClient });

    if (!endDate) {
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + dateLimit);
    }

    const response = await calendar.events.list({
      calendarId: calendarId,
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      timeZone: timeZone,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items;

    const slots = [];

    let currentDate = new Date(startDate);

    while (currentDate < endDate) {
      const dayOfWeek = currentDate.getDay();

      if (rangeLimit.days.includes(dayOfWeek)) {
        for (
          let hour = rangeLimit.startHour;
          hour < rangeLimit.endHour;
          hour++
        ) {
          const slotStart = new Date(currentDate);

          slotStart.setHours(hour, 0, 0, 0);

          const slotEnd = new Date(slotStart);

          slotEnd.setHours(hour + standardDuration);

          const isBusy = events.some((event) => {
            const eventStart = new Date(
              event.start.dateTime || event.start.date
            );

            const eventEnd = new Date(event.end.dateTime || event.end.date);

            return slotStart < eventEnd && slotEnd > eventStart;
          });

          if (!isBusy) {
            slots.push({
              start: slotStart,
              end: slotEnd,
            });
          }
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return slots;
  } catch (error) {
    console.error('Error listing available slots:', error);
    throw error;
  }
}

export async function getNextAvailableSlot(date) {
  try {
    if (typeof date === 'string') {
      date = new Date(date);
    } else if (!(date instanceof Date || isNaN(date))) {
      throw new Error('Invalid Date');
    }

    const availableSlots = await listAvailableSlots(date);

    const filteredSlots = availableSlots.filter(
      (slot) => new Date(slot.start) > date
    );

    const sortedSlots = filteredSlots.sort(
      (a, b) => new Date(a.start) - new Date(b.start)
    );

    return sortedSlots.length > 0 ? sortedSlots[0] : null;
  } catch (error) {
    console.error('Error getting next available slot:', error);
    throw error;
  }
}

export async function isDateAvailable(date) {
  try {
    const currentDate = new Date();

    const maxDate = new Date(date);

    maxDate.setDate(maxDate.getDate() + dateLimit);

    if (date < currentDate || date > maxDate) {
      return false;
    }

    const dayOfWeek = date.getDay();

    if (!rangeLimit.days.includes(dayOfWeek)) {
      return false;
    }

    const hour = date.getHours();

    if (hour < rangeLimit.startHour || hour >= rangeLimit.endHour) {
      return false;
    }

    const availableSlots = await listAvailableSlots(currentDate);

    const slotsOnGivenDate = availableSlots.filter(
      (slot) => new Date(slot.start).toDateString() === date.toDateString()
    );

    const isSlotAvailable = slotsOnGivenDate.some(
      (slot) =>
        new Date(slot.start).getTime() === date.getTime() &&
        new Date(slot.end).getTime() ===
          date.getTime() + standardDuration * 60 * 60 * 1000
    );

    return isSlotAvailable;
  } catch (error) {
    console.error('Error checking if date is available:', error);
    throw error;
  }
}
