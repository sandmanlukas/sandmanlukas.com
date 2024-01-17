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

export type TokenData = {
    token_type: string;
    expires_at: number;
    expires_in: number;
    refresh_token: string;
    access_token: string;
    athlete: Athlete;
};