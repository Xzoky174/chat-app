<script lang="ts">
	import { goto } from '$app/navigation';
	import { getContext, onMount } from 'svelte';
	import type { Writable } from 'svelte/store';

	import type { User } from '$lib/interfaces/user.interface';
	import { authenticated } from '$lib/authenticated';

	let username: string;
	let password: string;
	let confirmPassword: string;

	let error: string;

	let signing_up = false;

	let userStore: Writable<User | null> = getContext('user');

	onMount(async () => {
		userStore.subscribe((userState) => {
			if (userState !== null) return goto('/');
		});
	});

	async function formSubmit() {
		if (!passValid() || !usernameValid()) return;
		signing_up = true;

		const res = await fetch('http://localhost:3000/auth/signup', {
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

		signing_up = false;
	}

	const passValid = () => {
		if (password === '') {
			error = '';
			return false;
		} else if (password.length <= 8) {
			error = 'Password must be more than 7 characters';
			return false;
		} else if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return false;
		} else {
			error = '';
			return true;
		}
	};
	const usernameValid = () => {
		if (username === '') {
			error = '';
			return false;
		} else if (username.length < 4) {
			error = 'Username must be more than 3 characters';
			return false;
		} else if (username.length > 20) {
			error = 'Username must not be more than 20 characters';
			return false;
		} else {
			error = '';
			return true;
		}
	};
</script>

<div class="main">
	<form on:submit|preventDefault={formSubmit}>
		<input
			placeholder="Username"
			type="text"
			name="username"
			id="username"
			bind:value={username}
			on:input={usernameValid}
		/>

		<input
			placeholder="Password"
			type="password"
			name="password"
			id="password"
			bind:value={password}
			on:input={passValid}
		/>
		<input
			placeholder="Confirm Password"
			type="password"
			name="confirm-password"
			id="confirm-password"
			bind:value={confirmPassword}
			on:input={passValid}
		/>

		<input type="submit" value={signing_up ? 'Loading' : 'Sign Up'} disabled={signing_up} />

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
		max-width: 260px;
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
