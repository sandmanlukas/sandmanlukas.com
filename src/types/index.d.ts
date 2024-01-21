declare module 'leaflet';

export type Athlete = {
    id: number;
    username: string;
    resource_state: number;
    firstname: string;
    lastname: string;
    bio: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    sex: string;
    premium: boolean;
    summit: boolean;
    created_at: string;
    updated_at: string;
    badge_type_id: number;
    weight: number | null;
    profile_medium: string;
    profile: string;
    friend: string | null;
    follower: string | null;
};

type ActivityAthlete = {
    id: number;
    resource_state: number;
};


export type TokenData = {
    token_type: string;
    expires_at: number;
    expires_in: number;
    refresh_token: string;
    access_token: string;
    athlete: Athlete;
};

export type ActivitiesRequest = {
    before?: string;
    after?: string;
    per_page?: number;
    page?: number;
};

export type Map = {
    id: string;
    summary_polyline: string;
    resource_state: number;
}

export type Activity = {
    resource_state: number;
    athlete: ActivityAthlete;
    name: string;
    distance: number;
    moving_time: number;
    moving_time_str?: string;
    elapsed_time: number;
    elapsed_time_str?: string;
    total_elevation_gain: number;
    type: string;
    sport_type: string;
    workout_type?: null | number;
    id: number;
    start_date: string;
    start_date_formatted?: string;
    start_time?: string;
    start_date_local: string;
    start_date_local_formatted?: string;
    start_time_local?: string;
    timezone: string;
    utc_offset: number;
    location_city: null | string;
    location_state: null | string;
    location_country: null | string;
    achievement_count: number;
    kudos_count: number;
    comment_count: number;
    athlete_count: number;
    photo_count: number;
    map: Map;
    trainer: boolean;
    commute: boolean;
    manual: boolean;
    private: boolean;
    visibility: string;
    flagged: boolean;
    gear_id: string | null;
    start_latlng: number[];
    end_latlng: number[];
    average_speed: number;
    average_pace?: string;
    max_speed: number;
    max_pace?: string;
    average_cadence?: number;
    has_heartrate: boolean;
    average_heartrate?: number;
    max_heartrate?: number;
    heartrate_opt_out: boolean;
    display_hide_heartrate_option: boolean;
    elev_high?: number;
    elev_low?: number;
    upload_id: null | number;
    upload_id_str?: string;
    external_id: null | string;
    from_accepted_tag: boolean;
    pr_count: number;
    total_photo_count: number;
    has_kudoed: boolean;
}

type Totals = {
    count: number;
    distance: number;
    distance_km?: number;
    moving_time: number;
    moving_time_str?: string;
    elapsed_time: number;
    elapsed_time_str?: string;
    elevation_gain: number;
    achievement_count?: number;
    total_average_speed?: string;

};

export type UserStats = {
    biggest_ride_distance: null | number;
    longest_run_distance?: null | number;
    longest_run_streak?: number;
    biggest_climb_elevation_gain: null | number;
    recent_ride_totals: Totals;
    all_ride_totals: Totals;
    recent_run_totals: Totals;
    all_run_totals: Totals;
    recent_swim_totals: Totals;
    all_swim_totals: Totals;
    ytd_ride_totals: Totals;
    ytd_run_totals: Totals;
    ytd_swim_totals: Totals;
};

