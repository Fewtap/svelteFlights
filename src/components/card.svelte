<script lang="ts">
	import type { Flight } from '../scripts/interfaces';
	import moment from 'moment';
	import { fade, slide } from 'svelte/transition';

	export let flight: Flight;
</script>

<div class="card" transition:fade id={flight.flighthash}>
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
	{#if flight.cancelled || flight.cancelled}
		<div class="badge" class:delayed={flight.delayed} class:cancelled={flight.cancelled}>
			{flight.en}
		</div>
	{/if}
</div>

<style>
	.card {
		background-color: #185318;
		border-radius: 10px;
		padding: 2em;
		margin: 1em;
		width: 80%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		position: relative;
		color: aliceblue;
		text-align: center;
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

	.seperator {
		width: 80%;
		height: 2px;
		background-color: #000;
	}
</style>
