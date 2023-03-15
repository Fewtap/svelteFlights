<script lang="ts">
	import moment from 'moment';
	import { createClient } from '@supabase/supabase-js';
	import { onMount } from 'svelte';
	import { fade, slide } from 'svelte/transition';

	const SUPABASE_URL = 'https://uzkphhitjjeooktrkyud.supabase.co';

	const supabase = createClient(
		SUPABASE_URL,
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6a3BoaGl0amplb29rdHJreXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzg1OTcxNTYsImV4cCI6MTk5NDE3MzE1Nn0.eoNOoKc10Z7WmiqVTpyHogh7e1HzeAipxNmIKX1n_rc'
	);

	let flightslist: any = [];

	onMount(async () => {
		let startofday = moment().startOf('day').format('YYYY-MM-DDTHH:mm:ss');
		let endofday = moment().endOf('day').format('YYYY-MM-DDTHH:mm:ss');

		let { data: flights, error } = await supabase
			.from('flights')
			.select('*')
			.gte('planned', startofday)
			.lte('planned', endofday)
			.eq('type', 'departure')
			.order('planned', { ascending: true });

		for (let i = 0; i < flights.length; i++) {
			let flight = flights[i];
			flight = converttimes(flight);

			flightslist.push(flight);
		}

		flightslist = flightslist;

		supabase
			.channel('any')
			.on('postgres_changes', { event: '*', schema: 'public', table: 'flights' }, (payload) => {
				if (payload.new.type != 'departure') {
					return;
				}

				if (payload.eventType == 'UPDATE') {
					let flight = flightslist.find((flight) => flight.flighthash == payload.new.flighthash);
					flight = converttimes(payload.new);
					flightslist = flightslist.filter((flight) => flight.flighthash != payload.new.flighthash);
					flightslist.push(flight);
					//sort the list by planned time
					flightslist.sort((a, b) => {
						return moment(a.planned).diff(moment(b.planned));
					});
					flightslist = flightslist;
				} else if (payload.eventType == 'INSERT') {
					console.log('insert');
					let flight = converttimes(payload.new);
					if (flight.planned > moment().endOf('day')) return;
					flightslist.push(flight);
					//sort the list by planned time
					flightslist.sort((a, b) => {
						return moment(a.planned).diff(moment(b.planned));
					});
					flightslist = flightslist;
				} else if (payload.eventType == 'DELETE') {
					console.log('delete');
					flightslist = flightslist.filter((flight) => flight.flighthash != payload.old.flighthash);
				}
			})
			.subscribe();
	});

	function converttimes(flight) {
		flight.planned = moment(flight.planned).subtract(3, 'hours');
		if (flight.estimated) flight.estimated = moment(flight.estimated).subtract(3, 'hours');
		if (flight.actual) flight.actual = moment(flight.actual).subtract(3, 'hours');
		flight.busdeparture = moment(flight.planned).subtract(90, 'minutes');

		if (flight.estimated != null) {
			if (flight.estimated < flight.planned) {
				flight.en = 'Early';
				flight.busdeparture = moment(flight.estimated).subtract(90, 'minutes');
			} else if (flight.estimated > flight.planned) {
				flight.en = 'Delayed';
				flight.busdeparture = moment(flight.estimated).subtract(90, 'minutes');
			}
			flight.delayed = true;
		} else {
			flight.en = 'On Time';
			flight.delayed = false;
		}

		return flight;
	}
</script>

<div class="container">
	{#each flightslist as flight}
		<div class="card" transition:fade>
			<h2>{flight.rute}</h2>
			<div class="seperator" />
			<h3>Planned: {flight.planned.format('HH:mm')}</h3>

			<h3>Bus Departure: {flight.busdeparture.format('HH:mm')}</h3>

			{#if flight.estimated}
				<h3>Estimated: {flight.estimated.format('HH:mm')}</h3>
				<div class="badge" class:delayed={flight.delayed}>
					{flight.en}
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.card {
		background-color: #185318;
		border-radius: 10px;
		padding: 2em;
		margin: 1em;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		position: relative;
		color: aliceblue;
	}

	.seperator {
		width: 80%;
		height: 2px;
		background-color: #000;
	}

	.container {
		display: grid;
		/*make 3 columns and the content will wrap*/
		grid-template-columns: repeat(3, 1fr);
		height: fit-content;
	}

	h3 {
		font-size: 1.5em;
	}

	h2 {
		font-size: 2em;
	}

	/* Make the badge float in the top right corner of the button */
	.badge {
		border-radius: 50px;
		color: black;

		padding: 10px;
		font-size: 1.5em;
		width: fit-content;
		position: absolute; /* Position the badge within the relatively positioned button */
		top: -10px;
		right: -10px;
	}

	.cancelled {
		background-color: #ff0000;
	}

	.delayed {
		background-color: #e1ff00;
	}

	.on-time {
		background-color: #00ff00;
	}
</style>
