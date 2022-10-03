<script lang="ts">
	import { goto } from '$app/navigation';
	import { getContext, onMount } from 'svelte';
	import type { Writable } from 'svelte/store';

	import type { User } from '$lib/interfaces/user.interface';
	import { authenticated } from '$lib/authenticated';

	let username: string;
	let password: string;

	let error: string;

	let signing_in = false;

	let userStore: Writable<User | null> = getContext('user');

	onMount(async () => {
		userStore.subscribe((userState) => {
			if (userState !== null) return goto('/');
		});
	});

	async function formSubmit() {
		signing_in = true;

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

		signing_in = false;
	}
</script>

<div class="main">
	<form on:submit|preventDefault={formSubmit}>
		<input placeholder="Username" type="text" name="username" id="username" bind:value={username} />
		<input
			placeholder="Password"
			type="password"
			name="password"
			id="password"
			bind:value={password}
		/>

		<input type="submit" value={signing_in ? 'Loading' : 'Sign In'} disabled={signing_in} />

		{#if error}
			<p>{error}</p>
		{/if}
	</form>
</div>

<style>
	.main {
		height: calc(100vh - var(--navbar-height));
		display: grid;
		place-items: center;
	}
	form {
		text-align: center;
	}
	input[type='text'],
	input[type='password'] {
		margin-bottom: 5px;
		display: block;
		font-size: 22px;
		padding: 8px 12px;
		border: 2px solid #ced4da;
		border-radius: 4px;
	}
	input[type='submit'] {
		margin-top: 12px;
		color: #fff;
		cursor: pointer;
		border: 0;
		border-radius: 4px;
		transition: 0.25s;
		text-decoration: none;
		background-color: #3498db;
		font-size: 18px;
		padding: 8px 16px;
	}
	input[type='submit'][disabled],
	input[type='submit']:disabled {
		opacity: 0.45 !important;
	}
	input[type='submit']:hover {
		opacity: 0.85;
	}
</style>
