<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import { fetchFlights } from '../../scripts/flightutils';
	import { createClient } from '@supabase/supabase-js';
	import type { Flight, flighttype } from '../../scripts/interfaces';
	import { converttimes } from '../../scripts/flightutils';
	import Card from '../../components/card.svelte';
	import supabase from '../../scripts/supabase';
	import { selectedCard } from '../../scripts/stores';
	import moment from 'moment';
	import Room from '../../components/room.svelte';

	let currentDate = moment().format('YYYY-MM-DD');
	console.log(currentDate);
	let selectedFlight: any = null;

	let type: string = 'departure';
	let roomwithflightinput = '';
	let amount = '1';

	let flightslist: Flight[] = [];

	onMount(async () => {
		await getflights();

		selectedCard.set(flightslist[0].flighthash);
	});

	$: selectedFlight = flightslist.find((flight) => flight.flighthash == $selectedCard);

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

	const channel = supabase
		.channel('public')
		.on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public',
				table: 'rooms'
			},
			(payload) => {
				if (payload.new['flighthash'] == null || payload.new['flighthash'] == undefined) {
					supabase
						.from('flights')
						.select('*, rooms(*)')
						.eq('flighthash', payload.old['flighthash'])
						.then((data) => {
							let flight = data.data[0];
							flight = converttimes(flight);
							flightslist.forEach((flight) => {
								if (flight.flighthash == data.data[0].flighthash) {
									flight.rooms = data.data[0].rooms;
									flightslist = [...flightslist];
								}
							});
						});
				} else {
					supabase
						.from('flights')
						.select('*, rooms(*)')
						.eq('flighthash', payload.new['flighthash'])
						.then((data) => {
							let flight = data.data[0];
							flight = converttimes(flight);
							flightslist.forEach((flight) => {
								if (flight.flighthash == data.data[0].flighthash) {
									flight.rooms = data.data[0].rooms;
									flightslist = [...flightslist];
								}
							});
						});
				}
			}
		)
		.subscribe();

	async function changeType() {
		flightslist = [];
		if (type == 'departure') {
			type = 'arrival';
		} else if (type == 'arrival') {
			type = 'departure';
		}
		await getflights();
		setTimeout(() => {}, 2000);
		selectedCard.set(flightslist[0].flighthash);
	}

	function addRoom() {
		const room = {
			roomnumber: roomwithflightinput,
			amount: amount,
			flighthash: selectedFlight.flighthash,
			planned: moment(currentDate).format('YYYY-MM-DDTHH:mm:ss')
		};

		supabase
			.from('rooms')
			.insert(room)
			.select('*')
			.then((data) => {
				console.log(data);
			});
		roomwithflightinput = '';
		amount = '1';
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
			<form on:submit|preventDefault={addRoom} class="inputform">
				<input type="text" bind:value={roomwithflightinput} placeholder="Input room with flight" />
				<input type="number" bind:value={amount} placeholder="Amount" />
				<button type="submit" class="submitbutton" style="margin-inline: auto;">Add Room</button>
			</form>
			<div class="withflights">
				{#if selectedFlight != null}
					{#each selectedFlight.rooms as room}
						<Room {room} />
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
	.submitbutton {
		margin-inline: auto;
		width: 30%;
		padding: 20px;
		border-radius: 10px;
		border: none;
	}

	button:hover {
		cursor: pointer;
	}

	.halfcontainer {
		height: 95vh;
		width: 50vw;
	}

	.inputform {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}

	.flightdisplay {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		overflow-y: scroll;
		gap: 1em;
		align-items: center; /* Center the cards vertically within the grid columns */
		justify-items: center; /* Center the cards horizontally within the grid columns */
		padding: 20px;
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

	.inputcontainer {
		display: flex;
		flex-direction: column;
		width: fit-content;
		justify-content: space-between;
		align-items: center;
		margin-inline: auto;

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
