<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { goto } from '$app/navigation';

	import type { User } from '$lib/interfaces/user.interface';
	import type { Writable } from 'svelte/store';

	let userStore: Writable<User | null> = getContext('user');
	onMount(() => {
		userStore.subscribe((userState) => {
			if (userState === null) return goto('/signin');
		});
	});

	const confirm = async () => {
		const res = await fetch('http://localhost:3000/auth/signout', {
			credentials: 'include',
			method: 'POST'
		});

		if (res.status === 200) {
			userStore.set(null);

			return goto('/signin');
		}
	};

	const cancel = () => goto('/');
</script>

<div class="container">
	<div class="main">
		<h1>Do you want to sign out?</h1>
		<button on:click={confirm} class="confirm">Yes</button>
		<button on:click={cancel} class="cancel">No</button>
	</div>
</div>

<style>
	.container {
		height: calc(100vh - var(--navbar-height));
		display: grid;
		place-items: center;
	}
	.main {
		text-align: center;
	}
	.confirm,
	.cancel {
		color: #fff;
		cursor: pointer;
		border: 0;
		border-radius: 4px;
		transition: 0.25s;
		text-decoration: none;
		font-size: 18px;
		padding: 7px 20px;
	}
	.confirm:hover,
	.cancel:hover {
		opacity: 0.85;
	}
	.confirm {
		background-color: #e74c3c;
	}
	.cancel {
		background-color: #2ecc71;
		padding: 7px 25px;
	}
</style>
