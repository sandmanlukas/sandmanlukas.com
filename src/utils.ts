import axios from "axios";
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


export const convertSeconds = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
        return `${hours}h ${minutes}m`
    } else {
        return `${minutes}m`
    }
}

export const computePace = (time: number, distance: number): string => {
    var pace = (time / distance / 60) * 1000;
    var leftover = pace % 1;
    var minutes = pace - leftover;
    var seconds: string | number = Math.round(leftover * 60);
    seconds = seconds < 10 ? `0${seconds}` : seconds;
    return `${minutes}:${seconds}`;
}

export const getTypeIcon = (type: string): string => {
    const typeToIcon = {
        'AlpineSki': '⛷',
        'BackcountrySki': '🎿',
        'Badminton': '🏸',
        'Canoeing': '🛶',
        'Crossfit': '🏋️',
        'EBikeRide': '🚴',
        'Elliptical': '🚴',
        'EMountainBikeRide': '🚴',
        'Golf': '🏌️',
        'GravelRide': '🚴',
        'Handcycle': '🚴',
        'HighIntensityIntervalTraining': '🏋️',
        'Hike': '🥾',
        'IceSkate': '⛸',
        'InlineSkate': '🛼',
        'Kayaking': '🛶',
        'Kitesurf': '🏄',
        'MountainBikeRide': '🚴',
        'NordicSki': '🎿',
        'Pickleball': '🎾',
        'Pilates': '🧘',
        'Racquetball': '🎾',
        'Ride': '🚴',
        'RockClimbing': '🧗',
        'RollerSki': '🎿',
        'Rowing': '🚣',
        'Run': '🏃',
        'Sail': '⛵',
        'Skateboard': '🛹',
        'Snowboard': '🏂',
        'Snowshoe': '🥾',
        'Soccer': '⚽',
        'Squash': '🎾',
        'StairStepper': '🏃',
        'StandUpPaddling': '🏄',
        'Surfing': '🏄',
        'Swim': '🏊',
        'TableTennis': '🏓',
        'Tennis': '🎾',
        'TrailRun': '🏃',
        'Velomobile': '🚴',
        'VirtualRide': '🚴',
        'VirtualRow': '🚣',
        'VirtualRun': '🏃',
        'Walk': '🚶',
        'WeightTraining': '🏋️',
        'Wheelchair': '♿',
        'Windsurf': '🏄',
        'Workout': '🏋️',
        'Yoga': '🧘'
    };

    return typeToIcon[type as keyof typeof typeToIcon] || '🏅'; // Default to a generic sports medal if the type is not recognized
};

export function formatDate(date: Date): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
    } else {
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }
}

export function formatTime(date: Date): string {
    return date.toLocaleTimeString("sv-SE", {
        hour: "numeric",
        minute: "numeric",
    });
}

export function filterActivitiesByType(activities: Activity[], type: string): Activity[] {
    return activities.filter((activity) => activity.sport_type === type);
}

export function filterActivitiesByDate(activities: Activity[] = [], startDate: Date, endDate: Date): Activity[] {
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    return activities.filter((activity) => {
        const activityDate = new Date(activity.start_date_local);
        return activityDate >= startDate && activityDate <= endDate;
    });
}