import { testAuthGetter } from "$lib/server/data";
import { getUserStats } from "../../../utils.js";

export const prerender = false;
export async function load({ url }) {
    let code = url.searchParams.get('code');
    let scope = url.searchParams.get("scope");
    let state = url.searchParams.get("state");

    if (code) {
        const tokens = await testAuthGetter(code);
        console.log(tokens);
        
        const accessToken = tokens.access_token;
        const userId = tokens.athlete.id;

        const userStats = await getUserStats(userId, accessToken);

        if (userStats) {            
            return {
                userStats: userStats.data,
                userData: tokens,
            }
        }
    }

}
