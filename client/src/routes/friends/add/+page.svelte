<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import type { Writable } from 'svelte/store';
	import { goto } from '$app/navigation';

	import type { User } from '$lib/interfaces/user.interface';

	let uid: string = '';

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
		if (uid === '') {
			status = '';
			return false;
		}

		const isValid = uid.length === 24;
		status = isValid ? '' : 'Invalid Uid';

		return isValid;
	};
</script>

<div class="main">
	<form on:submit|preventDefault={submit}>
		<input
			type="text"
			placeholder="Enter Uid"
			bind:value={uid}
			on:input={uidValid}
			maxlength={24}
		/>
		<p class="input-len input-len-{uid.length === 24 ? 'valid' : 'invalid'}">{uid.length}/24</p>
		<input disabled={uid.length !== 24} type="submit" value="Add" />

		{#if status}
			<p class="status">{status}</p>
		{/if}
	</form>
</div>

<style>
	.main {
		height: calc(100vh - 60px);
		display: grid;
		place-items: center;
	}
	form {
		text-align: center;
		position: relative;
		top: 0;
	}
	input[type='text'] {
		display: block;
		font-size: 22px;
		padding: 8px 12px;
		border: 2px solid #ced4da;
		border-radius: 4px;
	}
	input[type='submit'][disabled],
	input[type='submit']:disabled {
		opacity: 0.45 !important;
	}
	input[type='submit'] {
		margin-top: 28px;
		color: #fff;
		cursor: pointer;
		border: 0;
		border-radius: 4px;
		transition: 0.25s;
		text-decoration: none;
		background-color: #2ecc71;
		font-size: 18px;
		padding: 7px 20px;
	}
	input[type='submit']:hover {
		opacity: 0.85;
	}
	.input-len {
		position: absolute;
		top: 36px;
		right: 0;
	}
	.input-len-valid {
		color: #2ecc71;
	}
	.input-len-invalid {
		color: #e74c3c;
	}
</style>
