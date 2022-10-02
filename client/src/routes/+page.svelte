<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { io, Socket } from 'socket.io-client';

	import type { Message } from '$lib/interfaces/message.interface';
	import type { User } from '$lib/interfaces/user.interface';
	import type { Writable } from 'svelte/store';

	let socket: Socket<any>;

	let user: User | null = null;

	let messageContent: string;

	let messages: any = {};
	let currMessages: Message[] = [];

	let friends: User[] = [];
	let selected: string;

	let friendRequests = 0;

	let userStore: Writable<User | null> = getContext('user');

	onMount(async () => {
		userStore.subscribe((userState) => {
			if (userState === null) goto('/signin');

			user = userState;
		});

		if (user === null) return;

		await (async () => {
			friends = (
				await (
					await fetch('http://localhost:3000/user/friends', {
						method: 'GET',
						credentials: 'include'
					})
				).json()
			).friends;

			selected = friends[0].username;

			friends.forEach((friend) => {
				messages[friend.username] = [];
			});
		})();

		(async () => {
			friendRequests = (
				await (
					await fetch('http://localhost:3000/user/friends/requests', {
						method: 'GET',
						credentials: 'include'
					})
				).json()
			).requests.length;
		})();

		socket = io('http://localhost:3000');
		socket.connect();

		socket.emit('init', { id: user._id });
		socket.on(
			'load',
			(data: {
				messages: (Message & {
					from: { username: string; _id: string };
					to: { username: string; _id: string };
				})[];
			}) => {
				const recievedMessages = data.messages;

				recievedMessages.forEach((message) => {
					const sender = message.from.username;

					if (sender === user!.username) {
						messages[message.to.username].push({
							content: message.content,
							createdAt: message.createdAt,
							isOS: true
						});
					} else {
						messages[sender].push({
							content: message.content,
							createdAt: message.createdAt,
							isOS: false
						});
					}
				});

				currMessages = messages[selected];
			}
		);

		socket.on(
			'message',
			({ from, content, createdAt }: { from: string; content: string; createdAt: string }) => {
				const friend = friends.find((user) => user._id === from) as User;

				messages[friend.username].push({
					content,
					createdAt,
					isOS: false
				});

				if (selected === friend.username) {
					currMessages = messages[selected];
				}
			}
		);
		socket.on(
			'message-sent',
			({ to, content, createdAt }: { to: string; content: string; createdAt: string }) => {
				const friend = friends.find((user) => user._id === to) as User;

				messages[friend.username].push({
					content,
					createdAt,
					isOS: true
				});

				currMessages = messages[selected];
			}
		);
	});

	const friendChange = (e: any) => {
		selected = e.target.value;
		currMessages = messages[selected];
	};

	const submit = () => {
		if (messageContent.trim().length === 0) return;

		const reciever = friends.find((user) => user.username === selected) as User;

		socket.emit('message', { content: messageContent, to: reciever._id });
		messageContent = '';
	};
</script>

{#if friendRequests > 0}
	<p>You have {friendRequests} new <a href="/friends">friend requests</a>!</p>
{/if}

{#if friends.length > 0}
	<select on:change={friendChange}>
		{#each friends as friend}
			<option selected={friend.username === selected}>{friend.username}</option>
		{/each}
	</select>

	<br />

	{#if currMessages.length > 0}
		{#each currMessages as message}
			<p>
				<b>
					{#if message.isOS}
						You
					{:else}
						{selected}
					{/if}
				</b>
				: {message.content}
			</p>
		{/each}
	{/if}

	<form on:submit|preventDefault={submit}>
		<input type="text" placeholder="Type" bind:value={messageContent} required />
		<button type="submit">Enter</button>
	</form>
{/if}
