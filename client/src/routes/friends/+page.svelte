<script lang="ts">
	import { goto } from '$app/navigation';
	import { getContext, onMount } from 'svelte';
	import type { Writable } from 'svelte/store';

	import type { User } from '$lib/interfaces/user.interface';

	let friends: [any];
	let requests: [any];
	let sent: [any];

	let loaded = false;
	let uid = '';

	let userStore: Writable<User | null> = getContext('user');

	const load = async () => {
		const response = await (
			await fetch('http://localhost:3000/user/friends/all', {
				method: 'GET',
				credentials: 'include'
			})
		).json();

		friends = response.friends;
		requests = response.requests;
		sent = response.sent;

		loaded = true;
	};

	onMount(async () => {
		userStore.subscribe((userState) => {
			if (userState === null) return goto('/signin');

			uid = userState._id;
		});

		load();
	});

	const accept = async (id: string) => {
		const res = await fetch('http://localhost:3000/user/friends', {
			headers: {
				'Content-Type': 'application/json'
			},
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify({
				friend: id
			})
		});

		if (res.status !== 201) {
			return alert('Something went wrong..');
		}

		loaded = false;
		load();
	};

	const reject = async (id: string) => {
		const res = await fetch(`http://localhost:3000/user/friends/requests/${id}`, {
			method: 'DELETE',
			credentials: 'include'
		});

		if (res.status !== 200) {
			return alert('Something went wrong..');
		}

		loaded = false;
		load();
	};

	const remove = async (id: string) => {
		const res = await fetch(`http://localhost:3000/user/friends/${id}`, {
			method: 'DELETE',
			credentials: 'include'
		});

		if (res.status !== 200) {
			return alert('Something went wrong..');
		}

		loaded = false;
		load();
	};

	const copy = () => navigator.clipboard.writeText(uid);
</script>

{#if loaded && requests.length > 0}
	<h1>Requests</h1>

	{#each requests as request}
		<p>
			{request.from.username}
			<button on:click={() => accept(request.from._id)}>accept</button>
			<button on:click={() => reject(request.from._id)}>reject</button>
		</p>
	{/each}
{/if}

{#if loaded && friends.length > 0}
	<h1>Friends</h1>

	{#each friends as friend}
		<p>{friend.username} <button on:click={() => remove(friend._id)}>remove</button></p>
	{/each}
{/if}

{#if loaded && sent.length > 0}
	<h1>Sent Requests</h1>

	{#each sent as sent}
		<p>{sent.to.username}</p>
	{/each}
{/if}

<a href="/friends/add">Add Friend</a>

{#if uid}
	<h3>Uid:</h3>

	<div>
		<input type="text" value={uid} disabled />
		<button on:click={copy}>Copy</button>
	</div>
{/if}
