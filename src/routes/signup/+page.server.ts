import type { PageServerLoad } from './$types';
import { redirectIfAuthenticated } from '$lib/auth/middleware';

export const load: PageServerLoad = async (event) => {
	// Redirect authenticated users away from signup page
	await redirectIfAuthenticated(event);

	return {};
};
