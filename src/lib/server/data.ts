import axios from "axios";

import { PUBLIC_CLIENT_ID } from "$env/static/public";
import { CLIENT_SECRET } from "$env/static/private";

export const testAuthGetter = async (authTok: string) => {
    try {
        const response = await axios.post(
            `https://www.strava.com/api/v3/oauth/token?client_id=${PUBLIC_CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${authTok}&grant_type=authorization_code`
        );
        return response.data;
    } catch (error) {
        console.log(error);
    }
};


export const refreshToken = async (refreshToken: string) => {
    try {
        const response = await axios.post(`https://www.strava.com/oauth/token`, {
            client_id: PUBLIC_CLIENT_ID,
            client_secret: CLIENT_SECRET,
            refresh_token: refreshToken,
            grant_type:'refresh_token',});        
        return { body: { access_token: response.data.access_token, expires_at: response.data.expires_at } };
    } catch (error) {
        return {status : 500, body: { error: 'Failed to refresh token' }};
    }
}

