<script lang="ts">
	import moment from 'moment';
	import supabase from '../supabase';
	import { onMount } from 'svelte';
	import type { Flight } from './scripts/interfaces';
	import Card from './card.svelte';

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

<div class="container">
	{#each flightslist as flight}
		<Card {flight} />
	{/each}
</div>

<style>
	.container {
		display: grid;
		/*make 3 columns and the content will wrap*/
		grid-template-columns: repeat(3, 1fr);
		height: fit-content;
	}
</style>
