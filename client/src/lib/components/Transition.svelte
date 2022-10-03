<script lang="ts">
	import { fly } from 'svelte/transition';

	export let url: URL;
</script>

{#key url}
	<div in:fly={{ x: 1000, duration: 900, delay: 100 }}>
		<slot />
	</div>
{/key}
