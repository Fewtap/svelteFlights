<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import { fetchFlights } from '../../scripts/flightutils';
	import { createClient } from '@supabase/supabase-js';
	import type { Flight, flighttype } from '../../scripts/interfaces';
	import { converttimes } from '../../scripts/flightutils';
	import Card from '../../components/card.svelte';
	import supabase from '../../scripts/supabase';

	import moment from 'moment';

	let currentDate = moment().format('YYYY-MM-DD');
	console.log(currentDate);
	let selectedFlight: any = null;

	let type: string = 'departure';
	let roomwithflightinput = '';

	let flightslist: Flight[] = [];

	onMount(async () => {
		await getflights();
	});

	async function getflights() {
		console.log(new Date(currentDate));
		flightslist = [];
		flightslist = (await fetchFlights(supabase, currentDate, type)) as Flight[];
		flightslist.forEach((flight) => {
			flight = converttimes(flight);
		});
		flightslist = flightslist;
		console.log(flightslist.length);
	}

	function changeDate(datechange: string) {
		if (datechange == 'next') {
			currentDate = moment(currentDate).add(1, 'day').format('YYYY-MM-DD');
		} else if (datechange == 'previous') {
			currentDate = moment(currentDate).subtract(1, 'day').format('YYYY-MM-DD');
		}
		getflights();
	}

	function changeType() {
		flightslist = [];
		if (type == 'departure') {
			type = 'arrival';
		} else if (type == 'arrival') {
			type = 'departure';
		}
		getflights();
	}
</script>

<div class="container">
	<div class="halfcontainer">
		<div class="datecontainer">
			<button on:click={() => changeDate('previous')}>Previous Day</button>
			<h1>{currentDate}</h1>
			<h1>{type.toLocaleUpperCase()}</h1>
			<button on:click={() => changeDate('next')}>Next Day</button>
			<button on:click={changeType}>Change Type</button>
		</div>

		<div class="inputcontainer">
			<input type="text" placeholder="Input room without flight" />
			<div class="withoutflights">
				<h1>Without rooms</h1>
			</div>
			<input type="text" bind:value={roomwithflightinput} placeholder="Input room with flight" />
			<div class="withflights">
				{#if selectedFlight != null}
					{#each selectedFlight.rooms as room}
						<div class="roomcontainer">
							<button>X</button>
							<h1>{room.roomnumber}</h1>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</div>
	<div class="halfcontainer flightdisplay">
		{#if flightslist.length == 0}
			<h1>No flights found</h1>
		{/if}
		{#each flightslist as flight (flight.flighthash)}
			<Card {flight} />
		{/each}
	</div>
</div>

<style>
	.withflights {
		overflow-y: auto;
		height: 500px;
		min-width: 40%;
	}

	.roomcontainer {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		border: 1px solid black;
		margin: 1em;
		padding: 1em;
		min-width: 40%;
	}
	.halfcontainer {
		height: 95vh;
		width: 50vw;
		border: 1px solid black;
	}

	.flightdisplay {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		overflow-y: scroll;
	}

	.flight {
	}

	.flight:hover {
		background-color: #185318;
		transition: cubic-bezier(0.075, 0.82, 0.165, 1) 0.5s;
	}
	h1 {
		margin-inline: auto;
		text-align: center;
	}

	:global(.selected) {
		background-color: #b0d8b0;
	}

	.datecontainer {
		display: flex;
		flex-direction: row;
		width: 80%;

		justify-content: space-between;
		align-items: center;
		margin-inline: auto;
		border: 1px solid black;
		padding: 1em;
	}

	.datecontainer > * {
		margin: 10px;
	}

	.datecontainer button {
		width: 10%;
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
		width: fit-content;
		justify-content: space-between;
		align-items: center;
		margin-inline: auto;
		border: 1px solid black;
		padding: 1em;
		min-width: 50%;
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
