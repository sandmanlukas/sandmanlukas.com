import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const { password } = await request.json();

	if (password === env.BINGO_ADMIN_PASSWORD) {
		cookies.set('bingo_admin', env.BINGO_ADMIN_PASSWORD!, {
			path: '/',
			httpOnly: true,
			secure: !dev,
			sameSite: 'strict',
			maxAge: 60 * 60 * 24
		});
		return json({ success: true });
	}

	throw error(401, 'Invalid password');
};
