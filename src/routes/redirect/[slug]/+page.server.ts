import { testAuthGetter, getUserData } from "$lib/server/data";

export async function load({ url }) {
    let code = url.searchParams.get('code');
    let scope = url.searchParams.get("scope");
    let state = url.searchParams.get("state");

    if (code) {
        const tokens = await testAuthGetter(code);
        const accessToken = tokens.access_token;
        const userId = tokens.athlete.id;

        const userStats = await getUserData(userId, accessToken);

        if (userStats) {
            return {
                userStats: userStats.data,
                userData: tokens,
            }
        }
    }

}
