<script lang="ts">
	import moment from 'moment';
	import supabase from '../scripts/supabase';
	import { onMount } from 'svelte';
	import type { Flight } from '../scripts/interfaces';
	import Card from '../components/card.svelte';
	import { converttimes } from '../scripts/flightutils';

	let flightslist: Flight[] = [];

	onMount(async () => {
		let startofday = moment().startOf('day').format('YYYY-MM-DDTHH:mm:ss');
		let endofday = moment().endOf('day').format('YYYY-MM-DDTHH:mm:ss');

		let { data, error } = await supabase
			.from('flights')
			.select('*')
			.gte('planned', startofday)
			.lte('planned', endofday)
			.eq('type', 'departure')
			.order('planned', { ascending: true });

		let flights = data as Flight[];

		for (let i = 0; i < flights.length; i++) {
			let flight: Flight = flights[i] as Flight;
			flight = converttimes(flight);

			flightslist.push(flight);
		}

		flightslist = flightslist;
	});
</script>

<div class="outercontainer">
	<div class="imgcontainer">
		<img
			src="https://static.wixstatic.com/media/015531_11331bde76244c9db30c799c6b22fc00~mv2.png/v1/fill/w_363,h_127,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/Hotel%20Ilulissat%20Logo%20-SORTSKRIFT.png"
		/>
	</div>
	<div class="container">
		{#each flightslist as flight}
			<Card {flight} />
		{/each}
	</div>
</div>

<style>
	.container {
		display: grid;
		/*make 3 columns and the content will wrap*/
		grid-template-columns: repeat(3, 1fr);
		height: fit-content;
		gap: 2rem;
		padding: 10px;

		justify-items: center;
	}

	@media screen and (max-width: 1080px) {
		.imgcontainer {
			display: flex;
			justify-content: center;
			margin: 1em;
		}

		.imgcontainer img {
			width: 30%;
		}
	}

	@media screen and (min-width: 1081px) {
		.imgcontainer {
			display: none;
		}

		.container {
			grid-template-columns: repeat(4, 1fr);
		}
	}
</style>
