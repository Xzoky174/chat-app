<script lang="ts">
	import { page } from '$app/stores';
	import { getContext, onMount } from 'svelte';
	import type { Writable } from 'svelte/store';

	import type { User } from '$lib/interfaces/user.interface';

	let user: User | null;
	let userStore: Writable<User | null> = getContext('user');

	let url: URL | null;

	onMount(async () => {
		userStore.subscribe((userState) => {
			user = userState;
		});

		page.subscribe((pageState) => {
			url = pageState.url;
		});
	});
</script>

<nav>
	<ul>
		{#if user}
			<li><a href="/" class={url?.pathname === '/' ? 'active' : ''}>Home</a></li>
			<li><a href="/friends" class={url?.pathname === '/friends' ? 'active' : ''}>Friends</a></li>
			<li>
				<a href="/friends/add" class={url?.pathname === '/friends/add' ? 'active' : ''}
					>Add Friend</a
				>
			</li>
		{:else}
			<li><a href="/signin" class={url?.pathname === '/signin' ? 'active' : ''}>Sign In</a></li>
			<li><a href="/signup" class={url?.pathname === '/signup' ? 'active' : ''}>Sign Up</a></li>
		{/if}

		{#if user}
			<p>
				<a href="/signout" class={url?.pathname === '/signout' ? 'active' : ''}
					>Signout ({user.username})</a
				>
			</p>
		{/if}
	</ul>
</nav>

<style>
	nav {
		width: 100%;
		padding: 20px 10px;
		position: fixed;
		z-index: 99;
		background-color: rgba(255, 255, 255, 0.96);
	}
	ul {
		padding: 0;
		margin: 0;
		display: flex;
		list-style-type: none;
		justify-content: center;
		align-items: center;
	}
	ul > p {
		margin: 0;
		position: absolute;
		right: 35px;
		cursor: pointer;
	}
	a {
		color: rgba(0, 0, 0, 0.7);
		text-decoration: none;
		margin: 0 5px;
	}
	a:hover,
	.active {
		color: #000;
	}
</style>
