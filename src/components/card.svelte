<script lang="ts">
	import type { Flight } from '../scripts/interfaces';
	import moment from 'moment';
	import { fade, slide } from 'svelte/transition';
	import { selectedCard } from '../scripts/stores';
	import { writable } from 'svelte/store';

	export let flight: Flight;
	let selected = false;

	const English = {
		destination: 'Destination',
		origin: 'Origin',
		planned: 'Planned',
		estimated: 'Estimated',
		busdeparture: 'Bus Departure'
	};
	const Danish = {
		destination: 'Destination',
		origin: 'Oprindelse',
		planned: 'Planlagt',
		estimated: 'Anslået',
		busdeparture: 'Busafgang'
	};

	let language = Danish;

	// create a writable store to keep track of the selected card

	function handleclick() {
		if (document.location.pathname == '/rooms') {
			selectedCard.set(flight.flighthash);
		}
	}

	// subscribe to the store and update the selected variable
	selectedCard.subscribe((value) => {
		if (value == flight.flighthash) selected = true;
		else selected = false;
	});

	const route = document.location.pathname;

	$: if (route == '/') {
		toggle();
	}

	const languageStore = writable(Danish);
	const flightStatus = writable('');

	//a function that will alternate between the english and danish text every 2 seconds
	function toggle() {
		let en = '';
		let da = '';
		if (flight.delayed || flight.cancelled) {
			en = flight.delayed ? 'Delayed' : 'Cancelled';
			da = flight.delayed ? 'Forsinket' : 'Aflyst';
			console.log(en, da);
		}

		let i = 0;
		setInterval(() => {
			flightStatus.set(i % 2 === 0 ? en : da);
			i++;
			// Update the language store
			languageStore.set(language === English ? Danish : English);
			language = language === English ? Danish : English;
		}, 10 * 1000);

		//toggle the language object
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->

<div on:click={handleclick} class:selected class="card" transition:fade id={flight.flighthash}>
	<h2>{flight.rute}</h2>
	<div class="seperator" />
	{#if flight.type == 'departure'}
		<h3>{$languageStore.destination}: {flight.arrivalairport}</h3>
	{:else if flight.type == 'arrival'}
		<h3>{$languageStore.origin}: {flight.departureairport}</h3>
	{/if}

	<h3 in:fade={{ duration: 200 }}>
		{$languageStore.planned}: {moment(flight.planned).format('HH:mm')}
	</h3>

	<h3>{$languageStore.busdeparture}: {moment(flight.busdeparture).format('HH:mm')}</h3>

	{#key flight.estimated}
		{#if flight.estimated}
			<h3>{$languageStore.estimated}: {moment(flight.estimated).format('HH:mm')}</h3>
		{/if}
	{/key}
	{#if flight.cancelled || flight.delayed || moment(flight.planned) < moment()}
		<div
			class="badge"
			class:delayed={flight.delayed}
			class:cancelled={flight.cancelled}
			transition:fade
		>
			{#key $flightStatus}
				<h5>{$flightStatus}</h5>
			{/key}
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

	h5 {
		font-size: 1.2em;
		margin: 5px;
		font-weight: lighter;
		color: white;
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
		min-width: 150px;
		padding: 10px;
		font-size: 2em;
		max-width: 150px;
		height: 50px;
		text-align: center;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 10px;
		position: absolute; /* Position the badge within the relatively positioned button */
		top: -20px;
		right: -50px;
		font-size: 30px;
	}

	.cancelled {
		background-color: #ff0000;
	}

	.delayed {
		background-color: #99a824;
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
