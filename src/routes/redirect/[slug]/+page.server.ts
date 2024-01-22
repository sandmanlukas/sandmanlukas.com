import { testAuthGetter } from "$lib/server/data";
import { fakeUserData } from "../../../fakeData.js";
import type { TokenData } from "../../../types/index.js";
import { getUserStats } from "../../../utils.js";

export const prerender = false;
export async function load({ url }) {
    let code = url.searchParams.get('code');
    let scope = url.searchParams.get("scope");
    let state = url.searchParams.get("state");

    if (code) {
        // const tokens: TokenData = await testAuthGetter(code);
        const tokens = fakeUserData;
        
        const accessToken = tokens.access_token;
        const userId = tokens.athlete.id;

        const userStats = await getUserStats(String(userId), accessToken);

        if (userStats) {
            return {
                userStats: userStats.data,
                userData: tokens,
            }
        }
    }

}
