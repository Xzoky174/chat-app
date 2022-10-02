<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import type { Writable } from 'svelte/store';
	import { goto } from '$app/navigation';

	import type { User } from '$lib/interfaces/user.interface';

	let uid: string;

	let status: string;

	let userStore: Writable<User | null> = getContext('user');

	onMount(async () => {
		userStore.subscribe((userState) => {
			if (userState === null) return goto('/signin');
		});
	});

	const submit = async () => {
		if (!uidValid()) return;

		const res = await fetch('http://localhost:3000/user/friends/requests', {
			credentials: 'include',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				friend: uid
			})
		});

		const text = await res.text();
		status = text;
	};

	const uidValid = () => {
		const isValid = uid.length === 24;
		status = isValid ? '' : 'Invalid Uid';

		return isValid;
	};
</script>

<form on:submit|preventDefault={submit}>
	<input type="text" placeholder="Enter Uid" bind:value={uid} on:input={uidValid} />
	<input type="submit" value="Add" />
</form>

{#if status}
	<p>{status}</p>
{/if}
