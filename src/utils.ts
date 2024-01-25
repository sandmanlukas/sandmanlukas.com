import axios from "axios";
import type { ActivitiesRequest, Activity, TotalStats } from "./types";
import { fakeActivities, fakeAthlete, fakeUserStats } from "./fakeData";

export const getUserStats = async (userID: string, accessToken: string) => {
    try {

        return { data: fakeUserStats };
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

    return fakeActivities;
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
        return { data: fakeAthlete };
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


export const convertPacetoString = (pace: number): string => {
    var leftover = pace % 1;
    var minutes = pace - leftover;
    var seconds: string | number = Math.round(leftover * 60);
    seconds = seconds < 10 ? `0${seconds}` : seconds;
    return `${minutes}:${seconds}`;
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

export const _formatActivities = (activities: Activity[]): { formattedActivities: Activity[], longestRun: number } => {
    const formattedActivities = [...activities];

    let longestRun = 0;
    let currentRunStreak = 0;
    let longestStreak = 0;
    let previousDate: Date | null = null;

    for (const activity of formattedActivities) {
        if (
            activity.sport_type === "Run" &&
            activity.distance > longestRun
        ) {
            longestRun = activity.distance;
        }

        // Calculate the longest run streak
        const currentDate = new Date(activity.start_date_local);
        currentDate.setHours(0, 0, 0, 0);

        if (previousDate) {
            const diffDays = Math.round(
                (previousDate.getTime() - currentDate.getTime()) /
                (1000 * 60 * 60 * 24),
            );
            if (diffDays === 1) {
                currentRunStreak++;
            } else if (diffDays > 1) {
                currentRunStreak = 0;
            }
        }
        longestStreak = Math.max(longestStreak, currentRunStreak);
        previousDate = currentDate;

        const startDate = new Date(activity.start_date);
        const startDateLocal = new Date(activity.start_date_local);
        activity.start_date_formatted = formatDate(startDate);
        activity.start_date_local_formatted = formatDate(startDateLocal);
        activity.start_time = formatTime(startDate);
        activity.start_time_local = formatTime(startDateLocal);

        activity.moving_time_str = convertSeconds(activity.moving_time);
        activity.elapsed_time_str = convertSeconds(activity.elapsed_time);

        // Compute pace in min/km
        activity.average_pace = computePace(
            activity.moving_time,
            activity.distance,
        );
    }
    return { formattedActivities, longestRun };
}

export const calculateTotalStats = (activities: Activity[]): TotalStats => {

    let totalDistance = 0;
    let totalElevation = 0;
    let totalMovingTime = 0;
    let totalMovingTimeStr = "";
    let totalElapsedTimeStr = "";
    let totalElapsedTime = 0;
    let longestRun = 0;
    let avgPace = "";
    let avgDistance = 0;   


    activities.forEach(activity => {
        if (activity.distance > longestRun && activity.sport_type === "Run") {
            longestRun = activity.distance;
        }

        totalDistance += activity.distance;
        totalElevation += activity.total_elevation_gain;
        totalMovingTime += activity.moving_time;
        totalElapsedTime += activity.elapsed_time;
    });

    avgPace = computePace(totalMovingTime, totalDistance);
    avgDistance = totalDistance / activities.length;
    totalMovingTimeStr = convertSeconds(totalMovingTime);
    totalElapsedTimeStr = convertSeconds(totalElapsedTime);

    return {
        totalDistanceKm: Math.round((totalDistance / 1000) * 10) / 10,
        totalElevation: Math.round((totalElevation) * 10) / 10,
        totalElapsedTimeStr,
        totalMovingTime,
        totalMovingTimeStr,
        totalElapsedTime,
        avgPace,
        avgDistance: Math.round((avgDistance / 1000)* 10) / 10,
        longestRun: Math.round((longestRun / 1000) * 10) / 10
    }


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


