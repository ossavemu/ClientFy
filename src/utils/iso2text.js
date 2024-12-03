import { DateTime } from 'luxon';

export const iso2text = (isoDate) => {
  try {
    const dateTime = DateTime.fromISO(isoDate, { zone: 'utc' }).setZone(
      'America/Bogota'
    );

    const formattedDate = dateTime.toLocaleString({
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZoneName: 'short',
    });
    return formattedDate;
  } catch (error) {
    console.error('Error when converting ISO date to text:', error);
    return 'Invalid date format';
  }
};
