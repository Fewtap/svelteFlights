<script>
	import { onMount } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import { createClient } from '@supabase/supabase-js';
	import moment from 'moment';

	const SUPABASE_URL = 'https://uzkphhitjjeooktrkyud.supabase.co';

	const supabase = createClient(
		SUPABASE_URL,
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6a3BoaGl0amplb29rdHJreXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzg1OTcxNTYsImV4cCI6MTk5NDE3MzE1Nn0.eoNOoKc10Z7WmiqVTpyHogh7e1HzeAipxNmIKX1n_rc'
	);
</script>

<div class="container">
	<div class="halfcontainer">
		<div class="datecontainer">
			<button>Previous Day</button>
			<h1>Day</h1>
			<button>Next Day</button>
		</div>

		<div class="inputcontainer">
			<input type="text" placeholder="Input room without flight" />
			<input type="text" placeholder="Input flight" />
		</div>
	</div>
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

	.datecontainer {
		display: flex;
		flex-direction: row;
		width: 30%;
		justify-content: space-between;
		align-items: center;
		margin-inline: auto;
		border: 1px solid black;
		padding: 1em;
	}

	.datecontainer button {
		width: 30%;
		height: 5em;
		border-radius: 10px;
		border: none;
		background-color: #f7f7f7;
		transition: cubic-bezier(0.075, 0.82, 0.165, 1) 0.3s;
	}

	.datecontainer button:hover {
		background-color: #185318;
	}

	.inputcontainer {
		display: flex;
		flex-direction: column;
		width: 30%;
		justify-content: space-between;
		align-items: center;
		margin-inline: auto;
		border: 1px solid black;
		padding: 1em;
	}

	.inputcontainer input {
		width: 100%;
		height: 5em;
		border-radius: 10px;
		border: none;
		background-color: #f7f7f7;
		margin: 1em;
	}

	.container {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
	}
</style>
