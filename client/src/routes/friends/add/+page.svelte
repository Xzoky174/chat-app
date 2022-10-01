<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	import { authenticated } from '$lib/authenticated';

	let uid: string;

	let status: string;

	onMount(async () => {
		const user = await authenticated();
		if (user === null) return goto('/signin', { replaceState: true });
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
