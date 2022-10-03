<script lang="ts">
	import { goto } from '$app/navigation';
	import { getContext, onMount } from 'svelte';
	import type { Writable } from 'svelte/store';

	import type { User } from '$lib/interfaces/user.interface';

	let friends: [any];
	let requests: [any];
	let sent: [any];

	let loaded = false;

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
</script>

{#if loaded && requests.length > 0}
	<section>
		<h1>Requests</h1>

		{#each requests as request}
			<p>
				{request.from.username}
				<button class="add" on:click={() => accept(request.from._id)}>Accept</button>
				<button class="remove" on:click={() => reject(request.from._id)}>Reject</button>
			</p>
		{/each}
	</section>
{/if}

{#if loaded && friends.length > 0}
	<section>
		<h1>Friends</h1>

		{#each friends as friend}
			<p>
				{friend.username} <button class="remove" on:click={() => remove(friend._id)}>Remove</button>
			</p>
		{/each}
	</section>
{:else}
	<h1>You don't have any friends yet.</h1>
{/if}

{#if loaded && sent.length > 0}
	<section>
		<h1>Sent Requests</h1>

		{#each sent as sent}
			<p>{sent.to.username}</p>
		{/each}
	</section>
{/if}

<a class="add-friend" href="/friends/add">Add Friend</a>

<style>
	section {
		margin: 8px 0 0 0;
	}
	.add,
	.remove,
	.add-friend {
		color: #fff;
		padding: 4px 8px;
		cursor: pointer;
		border: 0;
		border-radius: 4px;
		transition: 0.25s;
		text-decoration: none;
	}
	.add:hover,
	.remove:hover,
	.add-friend:hover {
		opacity: 0.85;
	}
	.add {
		background-color: #2ecc71;
	}
	.remove {
		background-color: #e74c3c;
	}
	.add-friend {
		display: inline-block;
		margin-top: 8px;
		background-color: #9b59b6;
		padding: 8px 10px;
	}
	h1 {
		margin: 0;
	}
</style>
