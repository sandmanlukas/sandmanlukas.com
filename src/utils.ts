import axios from "axios";

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
