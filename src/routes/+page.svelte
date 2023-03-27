<script lang="ts">
	import moment from 'moment';
	import supabaseutil from '../scripts/supabaseutil';
	import { onMount } from 'svelte';
	import type { IFlight } from '../scripts/interfaces';
	import Card from '../components/card.svelte';
	import { flights } from '../scripts/stores';
	import { converttimes, gettime, fetchFlights } from '../scripts/flightutils';

	let flightslist: IFlight[] = [];
	let currenttime = moment();

	setInterval(() => {
		currenttime = gettime();
	}, 1000);

	flights.subscribe((value) => {
		flightslist = value;
	});

	onMount(async () => {
		const templist = (await fetchFlights(
			supabaseutil,
			currenttime.format('YYYY-MM-DD'),
			'departure'
		)) as IFlight[];

		flights.set(templist);

		supabaseutil
			.channel('custom-all-channel')
			.on('postgres_changes', { event: '*', schema: 'public', table: 'flights' }, (payload) => {
				updateflights(payload);
			})
			.subscribe();
	});

	function updateflights(payload: any) {
		console.log(payload);
		let flight = payload.new as IFlight;
		flight = converttimes(flight);

		//if the flight is today and is a departure
		if (moment(flight.planned).isSame(moment(currenttime), 'day') && flight.type == 'departure') {
			//if the flight is already in the list
			if (flightslist.some((f) => f.flighthash == flight.flighthash)) {
				//update the flight
				flightslist = flightslist.map((f) => (f.flighthash == flight.flighthash ? flight : f));
			} else {
				//add the flight
				flightslist.push(flight);
			}

			flights.set(flightslist);
		}
	}
</script>

<div class="outercontainer">
	<div class="imgcontainer">
		<img
			src="https://static.wixstatic.com/media/015531_11331bde76244c9db30c799c6b22fc00~mv2.png/v1/fill/w_363,h_127,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/Hotel%20Ilulissat%20Logo%20-SORTSKRIFT.png"
			alt="logo"
		/>
		<h1>{currenttime.format('HH:mm:ss')}</h1>
	</div>
	<div class="container" class:overflow={flightslist.length > 9}>
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
		overflow-x: hidden;
		justify-items: center;
	}

	.overflow {
		grid-template-columns: repeat(4, 1fr);
	}

	:global(.overflow > *) {
		font-size: 12px;
	}

	@media screen and (max-width: 1080px) {
		.imgcontainer {
			display: flex;
			justify-content: center;
			gap: 5em;
			margin: 1em;
			font-size: 2em;
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

		.container > * {
			font-size: 12px;
		}
	}
</style>
