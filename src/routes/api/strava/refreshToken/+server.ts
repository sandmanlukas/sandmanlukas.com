import axios from 'axios';
import { PUBLIC_CLIENT_ID } from '$env/static/public';
import { CLIENT_SECRET } from '$env/static/private';

export async function POST(event) {

    const { refresh_token } = await event.request.json();

    try {

      const response = await axios.post(
        `https://www.strava.com/api/v3/oauth/token`,
        {
          client_id: PUBLIC_CLIENT_ID,
          client_secret: CLIENT_SECRET,
          grant_type: 'refresh_token',
          refresh_token: refresh_token
        });
        
        if (response && response.status === 200) {
          return new Response(JSON.stringify(response.data));
        }

      } catch (error) {
        return (error as any).response;
      }


}