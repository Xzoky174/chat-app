import type { User } from './interfaces/user.interface';

export const authenticated = async (): Promise<User | null> => {
	const token = document.cookie
		.split(';')
		.find((cookie) => cookie.startsWith('token='))
		?.split('=')[1];

	if (token === null || token === undefined) return null;

	const res = await fetch(`http://localhost:3000/auth/user/${token}`, {
		method: 'GET',
		credentials: 'include'
	});

	if (res.status === 404 || res.status === 401) return null;

	const json = await res.json();
	return json.user;
};
