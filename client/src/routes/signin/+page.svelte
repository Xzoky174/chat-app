<script lang="ts">
	import { goto } from '$app/navigation';
	import { getContext, onMount } from 'svelte';
	import type { Writable } from 'svelte/store';

	import type { User } from '$lib/interfaces/user.interface';
	import { authenticated } from '$lib/authenticated';

	let username: string;
	let password: string;

	let error: string;

	let userStore: Writable<User | null> = getContext('user');

	onMount(async () => {
		userStore.subscribe((userState) => {
			if (userState !== null) return goto('/');
		});
	});

	async function formSubmit() {
		const res = await fetch('http://localhost:3000/auth/signin', {
			credentials: 'include',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				username: username,
				password: password
			})
		});

		const text = await res.text();
		error = text;

		if (text === 'Successful!') {
			const user = await authenticated();
			userStore.set(user);
		}
	}
</script>

<form on:submit|preventDefault={formSubmit}>
	<input type="text" name="username" id="username" bind:value={username} />
	<input type="password" name="password" id="password" bind:value={password} />

	<input type="submit" value="Sign In" />
</form>

{#if error}
	<p>{error}</p>
{/if}
