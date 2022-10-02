<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import type { Writable } from 'svelte/store';

	import type { User } from '$lib/interfaces/user.interface';

	let user: User | null;
	let userStore: Writable<User | null> = getContext('user');

	onMount(async () => {
		userStore.subscribe((userState) => {
			user = userState;
		});
	});
</script>

<nav>
	<ul>
		<li><a href="/">Home</a></li>
		{#if user}
			<li><a href="/friends">Friends</a></li>
			<li><a href="/friends/add">Add Friend</a></li>
		{:else}
			<li><a href="/signin">Sign In</a></li>
			<li><a href="/signup">Sign Up</a></li>
		{/if}

		{#if user}
			<p>{user.username}</p>
		{/if}
	</ul>
</nav>

<style>
	nav {
		width: 100%;
		padding: 20px 10px;
		position: fixed;
	}
	ul {
		padding: 0;
		margin: 0;
		display: flex;
		list-style-type: none;
		justify-content: center;
		align-items: center;
	}
	ul p {
		margin: 0;
		position: absolute;
		right: 55px;
		cursor: pointer;
	}
	li a {
		color: rgba(0, 0, 0, 0.7);
		text-decoration: none;
		margin: 0 5px;
	}
	li a:hover {
		color: #000;
	}
</style>
