<script>
	import { onMount } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import { createClient } from '@supabase/supabase-js';
	import moment from 'moment';
</script>

<div class="container">
	<div class="halfcontainer" />
	<div class="halfcontainer" />
</div>

<style>
	.halfcontainer {
		height: 95vh;
		width: 50vw;
		border: 1px solid black;
	}
	h1 {
		margin-inline: auto;
		text-align: center;
	}

	.container {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
	}
</style>
