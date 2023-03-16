<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import { fetchFlights } from './scripts/flightutils';

	import moment from 'moment';

	let currentDate = moment().format('YYYY-MM-DD');
	let selectedFlight: any = null;

	let roomwithflightinput = '';

	let flightslist: any = [];

	onMount(async () => {
		flightslist = await fetchFlights(new Date(), 'departure');
		console.log(flightslist);
	});
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
		{#each flightslist as flight}
			<div class="flight" id={flight.flighthash} on:click={selectFlight(flight.flighthash)}>
				<h1>{flight.rute}</h1>
				<h2>Flight Departure: {moment(flight.planned).format('HH:mm')}</h2>
			</div>
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
		display: flex;
		flex-direction: column;
		justify-content: start;
		align-items: center;
		border: 1px solid black;
		margin: 1em;

		padding: 1em;
	}

	.flight:hover {
		background-color: #185318;
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
