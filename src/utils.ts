import axios, { all } from "axios";
import type { ActivitiesRequest, Activity } from "./types";

export const getUserStats = async (userID: string, accessToken: string) => {
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

// get user activities
export const getUserActivities = async (accessToken: string, before = "", after = "", perPage = 200) => {
    let page = 1;
    let allActivities: Activity[] = [];

    do {
        const params: ActivitiesRequest = {
            per_page: perPage,
            page: page
        };
        
        if (before) {
            params.before = before;
        }
        
        if (after) {
            params.after = after;
        }
        try {
            const response = await axios.get(
                `https://www.strava.com/api/v3/athlete/activities`,
                {
                    params: params,
                    headers: { Authorization: `Bearer ${accessToken}` }
                }
                );
                
                if (response.data.length > 0) {
                    allActivities = [...allActivities, ...response.data];
                    page++;
                } else {
                    break;
                }

            } catch (error) {
                console.log(error);
                break;
            }
        } while (true);
        return allActivities;
};

export const getUserData = async (accessToken: string) => {
    try {
        const response = await axios.get(
            `https://www.strava.com/api/v3/athlete`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        return response;
    } catch (error) {
        console.log(error);
    }
};

export async function refreshToken(refresh_token: string) {
    const response = await fetch('/api/strava/refreshToken', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh_token })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}
