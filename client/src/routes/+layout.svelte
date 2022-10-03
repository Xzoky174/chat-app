<script lang="ts">
	import { writable, type Writable } from 'svelte/store';
	import { onMount, setContext } from 'svelte';

	import { authenticated } from '$lib/authenticated';
	import type { User } from '$lib/interfaces/user.interface';

	import Navbar from '$lib/components/Navbar.svelte';

	let userStore: Writable<User | null> = writable();
	setContext('user', userStore);

	onMount(async () => {
		const user = await authenticated();
		userStore.set(user);
	});
</script>

<Navbar />
<main><slot /></main>

<style>
	main {
		padding: 0 8px;
		padding-top: var(--navbar-height);
	}
</style>
