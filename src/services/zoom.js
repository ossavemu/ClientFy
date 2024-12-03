import base64 from 'base-64';
import fetch from 'node-fetch';

const zoomAccountId = '_ye5ziRERfeqb_Nh3QITJQ';
const zoomClientId = 'Gr6G140vS6SE28vqd0JX2A';
const zoomClientSecret = 'jO2L7bDm53ruteWggZ9fUz93ku3TqqPI';

const getAuthHeaders = () => {
  return {
    Authorization: `Basic ${base64.encode(
      `${zoomClientId}:${zoomClientSecret}`
    )}`,
    'Content-Type': 'application/json',
  };
};

const generateZoomAccessToken = async () => {
  try {
    const response = await fetch(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${zoomAccountId}`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
      }
    );

    const jsonResponse = await response.json();

    return jsonResponse?.access_token;
  } catch (error) {
    console.log('generateZoomAccessToken Error --> ', error);
    throw error;
  }
};

export const zoomInviteLink = async (date, clientEmail) => {
  try {
    const zoomAccessToken = await generateZoomAccessToken();

    const response = await fetch(`https://api.zoom.us/v2/users/me/meetings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${zoomAccessToken}`,
      },
      body: JSON.stringify({
        agenda: 'Zoom Meeting for YT Demo',
        default_password: false,
        duration: 60,
        password: '12345',

        settings: {
          allow_multiple_devices: true,
          //alternative_hosts: 'clientfy0@gmail.com',
          //alternative_hosts_email_notification: true,
          breakout_room: {
            enable: true,
            rooms: [
              {
                name: 'room1',
                participants: ['clientfy0@gmail.com', clientEmail],
              },
            ],
          },
          calendar_type: 1,
          contact_email: 'clientfy0@gmail.com',
          contact_name: 'ClientFy',
          email_notification: true,
          encryption_type: 'enhanced_encryption',
          focus_mode: true,
          // global_dial_in_countries: ["US"],
          host_video: true,
          join_before_host: true,
          meeting_authentication: true,
          meeting_invitees: [
            {
              email: 'osanvem@gmail.com',
            },
          ],
          mute_upon_entry: true,
          participant_video: true,
          private_meeting: true,
          waiting_room: false,
          watermark: false,
          continuous_meeting_chat: {
            enable: true,
          },
        },
        start_time: new Date(date).toLocaleDateString(),
        timezone: 'America/Cancun',
        topic: 'ClientFy Meeting',
        type: 2, // 1 -> Instant Meeting, 2 -> Scheduled Meeting
      }),
    });

    const jsonResponse = await response.json();

    console.log('jsonResponse: ', jsonResponse);

    return jsonResponse.join_url;
  } catch (error) {
    console.log('generateZoomMeeting Error --> ', error);
    throw error;
  }
};
