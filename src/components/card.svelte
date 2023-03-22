<script lang="ts">
	import type { Flight } from '../scripts/interfaces';
	import moment from 'moment';
	import { fade, slide } from 'svelte/transition';
	import { selectedCard } from '../scripts/stores';

	export let flight: Flight;
	let selected = false;

	// create a writable store to keep track of the selected card

	function handleclick() {
		selectedCard.set(flight.flighthash);
	}

	// subscribe to the store and update the selected variable
	selectedCard.subscribe((value) => {
		if (value == flight.flighthash) selected = true;
		else selected = false;
	});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div on:click={handleclick} class:selected class="card" transition:fade id={flight.flighthash}>
	<h2>{flight.rute}</h2>
	<div class="seperator" />
	{#if flight.type == 'departure'}
		<h3>Destination: {flight.arrivalairport}</h3>
	{:else if flight.type == 'arrival'}
		<h3>Origin: {flight.departureairport}</h3>
	{/if}

	<h3>Planned: {moment(flight.planned).format('HH:mm')}</h3>

	<h3>Bus Departure: {moment(flight.busdeparture).format('HH:mm')}</h3>

	{#if flight.estimated}
		<h3>Estimated: {moment(flight.estimated).format('HH:mm')}</h3>
	{/if}
	{#if flight.cancelled || flight.cancelled || moment(flight.planned) < moment()}
		<div
			class="badge"
			class:delayed={flight.delayed}
			class:cancelled={flight.cancelled}
			class:departed={() => {
				if (moment(flight.planned) < moment() && !flight.cancelled && !flight.delayed) return true;
				else return false;
			}}
		>
			{flight.en}
		</div>
	{/if}
</div>

<style>
	.card {
		background-color: #185318;
		border-radius: 10px;
		padding: 5%;
		width: 80%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		position: relative;
		color: aliceblue;
		text-align: center;
		transition: cubic-bezier(0.075, 0.82, 0.165, 1) 0.5s;
		transform: scale(1);
	}

	.card:hover {
		/*change the mouse cursor to a pointer*/
		cursor: pointer;
	}

	h3 {
		font-size: 1.5em;
	}

	h2 {
		font-size: 2em;
	}

	.selected {
		transform: scale(0.8);
	}

	/* Make the badge float in the top right corner of the button */
	.badge {
		border-radius: 50px;
		color: black;

		padding: 10px;
		font-size: 2em;
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

	.departed {
		background-color: #00ff00;
	}

	.seperator {
		width: 80%;
		height: 2px;
		background-color: #000;
	}
</style>
