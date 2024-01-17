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

export const getUserData = async (userID: string, accessToken: string) => {
    try {
        const response = await axios.get(
            `https://www.strava.com/api/v3/athletes/${userID}/stats`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        return response;
    } catch (error) {
        console.log(error);
    }
};