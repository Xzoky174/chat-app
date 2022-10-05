<!-- TODO: Make messages container scroll to bottom automatically -->
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

	let messagesDiv: HTMLElement;

	let messages: any = {};
	let currMessages: Message[] = [];

	let friends: User[] = [];
	let selected: string;

	let friendRequests = 0;

	let userStore: Writable<User | null> = getContext('user');

	const load = async () => {
		await (async () => {
			friends = (
				await (
					await fetch('http://localhost:3000/user/friends', {
						method: 'GET',
						credentials: 'include'
					})
				).json()
			).friends;

			if (friends.length > 0) {
				selected = friends[0].username;

				friends.forEach((friend) => {
					messages[friend.username] = [];
				});
			}
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

		socket.emit('init', { id: user!._id });
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
	};

	onMount(() => {
		userStore.subscribe((userState) => {
			if (userState === null) goto('/signin');

			user = userState;
		});
		user && load();
	});

	const friendChange = (username: string) => {
		selected = username;
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
	<div class="main">
		<div class="friends">
			{#each friends as friend}
				<button
					class="friend {friend.username === selected ? 'friend-selected' : ''}"
					on:click={() => friendChange(friend.username)}>{friend.username}</button
				>
			{/each}
		</div>

		<div class="content">
			<div class="messages" id="messages" bind:this={messagesDiv}>
				{#if currMessages.length > 0}
					{#each currMessages as message}
						<p class="message {message.isOS ? 'message-os' : ''}">
							<b>
								{#if message.isOS}
									(You)
								{:else}
									({selected})
								{/if}
							</b>
							{message.content}
						</p>
					{/each}
				{:else}
					<p class="no-messages">No Messages Here.</p>
				{/if}
			</div>

			<form class="message-form" on:submit|preventDefault={submit}>
				<input
					class="message-form-input"
					type="text"
					placeholder="Type"
					bind:value={messageContent}
					required
				/>
				<button class="message-form-submit" type="submit">Send</button>
			</form>
		</div>
	</div>
{:else}
	<div class="no-friends">
		<p>You don't have any friends added yet. <a href="/friends/add">Add some friends!</a></p>
	</div>
{/if}

<style>
	p {
		margin: 0;
	}
	.no-friends {
		height: calc(100vh - var(--navbar-height));
		display: grid;
		place-items: center;
		font-size: 24px;
	}
	.no-friends a {
		text-decoration: none;
		color: #3498db;
	}
	.no-friends a:hover {
		text-decoration: underline;
	}

	.main {
		height: calc(100vh - var(--navbar-height));
		display: grid;
		grid-template-columns: 20% 80%;
	}
	.friends {
		padding: 12px 20px;
		border-right: 2px solid #ced4da;
	}
	.friend {
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		display: block;
		margin: 0 0 15px 0;
		border: 0;
		background-color: #fff;
		cursor: pointer;
		transition: 0.25s;
		color: rgba(0, 0, 0, 0.6);
		font-size: 20px;
	}
	.friend:hover,
	.friend-selected {
		color: #000;
	}
	.content {
		padding: 12px 20px;
		display: grid;
		grid-template-rows: 1fr;
		min-height: 0;
	}
	.messages {
		overflow-y: auto;
		padding: 0 15px;
		padding-top: 25px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.message {
		font-size: 24px;
		margin-bottom: 2px;
	}
	.message-os {
		align-self: end;
	}
	.message-form {
		display: grid;
		grid-template-columns: 9.2fr 0.8fr;
		position: relative;
	}
	.message-form-input {
		display: block;
		font-size: 22px;
		padding: 8px 12px;
		border: 2px solid #ced4da;
		border-radius: 4px 0 0 4px;
	}
	.message-form-submit {
		font-size: 22px;
		color: #fff;
		cursor: pointer;
		border: 0;
		border-radius: 0 4px 4px 0;
		transition: 0.25s;
		text-decoration: none;
		background-color: #3498db;
		padding: 8px 16px;
	}
	.message-form-submit:hover {
		opacity: 0.85;
	}
</style>
