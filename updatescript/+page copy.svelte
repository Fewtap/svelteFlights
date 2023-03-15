<script lang="ts">
	// Import the functions you need from the SDKs you need
	import PocketBase from 'pocketbase';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import Ads from '../src/routes/ads.svelte';

	/**
	 * @type {any[]}
	 */
	let todaysflights: any = [];
	let todaysDate: Date = new Date();
	let tomorrowsflights: any = [];
	let tomorrowsdate: Date = new Date();
	const pb = new PocketBase('http://176.58.101.163:8080');
	tomorrowsdate.setDate(tomorrowsdate.getDate() + 1);

	const getflightpocketbase = async (date: Date) => {
		let flights: any = [];

		date.setHours(0, 0, 0, 0);
		let datestring = date.toISOString().slice(0, 10);
		console.log(
			'Getting flights for: ' + date.toLocaleDateString() + ' with datestring: ' + datestring
		);

		const result = await pb.collection('departures').getFullList(500, {
			filter: 'planned ~ "' + datestring + '"'
		});

		console.table(result);

		result.forEach((doc) => {
			doc.planned = new Date(doc.planned);
			if (doc.estimated) doc.estimated = new Date(doc.estimated);

			let busdeparture = new Date(doc.planned);
			busdeparture.setMinutes(busdeparture.getMinutes() - 90);
			doc.busdeparture = busdeparture;

			flights.push(doc);
		});

		flights = flights.sort((a: any, b: any) => {
			return a.planned.getTime() - b.planned.getTime();
		});

		//remove flights where the date is more than the planned and the estimated

		return flights;
	};

	onMount(async () => {
		todaysflights = await getflightpocketbase(new Date());
		todaysflights = todaysflights.filter((flight: any) => {
			return flight.planned > new Date() || flight.estimated > new Date();
		});

		console.log('Todays flights: ' + todaysflights.length);
		let tomorrowsDate = new Date();
		tomorrowsDate.setDate(tomorrowsDate.getDate() + 1);

		tomorrowsflights = await getflightpocketbase(tomorrowsDate);
	});

	setInterval(() => {
		todaysflights = todaysflights.filter((flight: any) => {
			return flight.planned > new Date() || flight.estimated > new Date();
		});
		todaysflights = todaysflights;
	}, 1000);

	//Check if todays date has changed
</script>

<div class="cardContainer">
	<h1 style="text-align: center;">
		{new Date().toLocaleDateString('default', {
			numberingSystem: 'latn',
			weekday: 'long',
			month: 'long',
			day: 'numeric'
		})}
	</h1>
	{#if todaysflights.length == 0}
		<div class="noflights">
			<h1>No more flights</h1>
		</div>
	{:else}
		<div class="cards">
			{#each todaysflights as flight}
				{#if new Date() < flight.planned || new Date() < flight.estimated}
					<!--{#if new Date() < flight.planned || new Date() < flight.estimated}-->
					<!--Each card will contain information about the flight-->
					<div transition:slide class="card">
						<div class="cardheader">
							<h2 class="cardtitle">{flight.rute}</h2>
							<h2 class="cardtitle">
								{#if flight.estimated}
									Estimated:
									{flight.estimated.toLocaleTimeString([], {
										hour: '2-digit',
										minute: '2-digit',
										hour12: false
									})}
								{:else}
									Planned:
									{flight.planned.toLocaleTimeString([], {
										hour: '2-digit',
										minute: '2-digit',
										hour12: false
									})}
								{/if}
							</h2>
						</div>
						<div class="cardbody">
							<p>Destination: {flight.arrivalairport}</p>
							<p>
								Bus departure {flight.busdeparture.toLocaleTimeString([], {
									hour: '2-digit',
									minute: '2-digit',
									hour12: false
								})}
							</p>
						</div>
					</div>
				{/if}
			{/each}
		</div>
	{/if}
	<div>
		<h1 style="text-align: center;">
			{tomorrowsdate.toLocaleDateString('default', {
				numberingSystem: 'latn',
				weekday: 'long',
				month: 'long',
				day: 'numeric'
			})}
		</h1>
	</div>

	{#if tomorrowsflights.length == 0}
		<div class="noflights">
			<h1>No flights tomorrow</h1>
		</div>
	{:else}
		<div class="cards">
			{#each tomorrowsflights as flight}
				<!--{#if new Date() < flight.planned || new Date() < flight.estimated}-->
				<!--Each card will contain information about the flight-->
				<div class="card">
					<div class="cardheader">
						<h2 class="cardtitle">{flight.rute}</h2>
						<h2 class="cardtitle">
							{#if flight.estimated}
								Estimated:
								{flight.estimated.toLocaleTimeString([], {
									hour: '2-digit',
									minute: '2-digit',
									hour12: false
								})}
							{:else}
								Planned:
								{flight.planned.toLocaleTimeString([], {
									hour: '2-digit',
									minute: '2-digit',
									hour12: false
								})}
							{/if}
						</h2>
					</div>
					<div class="cardbody">
						<p>Destination: {flight.arrivalairport}</p>
						<p>
							Bus departure {flight.busdeparture.toLocaleTimeString([], {
								hour: '2-digit',
								minute: '2-digit',
								hour12: false
							})}
						</p>
					</div>
				</div>
				<!--{/if}-->
			{/each}
		</div>
	{/if}
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital@0;1&display=swap');
	@import url('https://fonts.googleapis.com/css2?family=Arvo&family=Barlow+Condensed:ital@0;1&display=swap');

	.noflights {
		margin-inline: auto;
		height: 100%;
		width: 40%;
		display: flex;
		justify-content: center;
		background: rgb(88, 144, 182);
		border-radius: 20px;
	}

	.cardheader {
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		align-items: center;
		max-height: 25%;
		padding: 10px;
	}

	.cardtitle {
		font-size: 1em;
	}

	.cards {
		align-items: center;
		margin-inline: auto;
		/*display: flex;
		flex-wrap: wrap;
		justify-content: space-around;*/
		/*a grid with 3 columns and infinite rows*/
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		grid-template-rows: repeat(auto-fill, 1fr);
	}

	/*media query for screens above 1080 width*/
	@media screen and (min-width: 2000px) {
		/*make the cards a grid with 4 columns and center the div*/
		.cards {
			grid-template-columns: 1fr 1fr 1fr 1fr;
			justify-items: center;
		}
	}
	.card {
		/*shadow effect*/
		box-shadow: 0 16px 8px 0 rgba(0, 0, 0, 0.2);
		background: burlywood;
		background-size: 100% 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		margin: 1em;
		height: clamp(20rem, 20vw, 20rem);
		width: clamp(20rem, 20vw, 20rem);
		border-radius: 10px;
	}
	p {
		margin-right: 1em;
		margin-left: 1em;
	}

	.card > * {
		margin: 0.5em;
		text-align: center;
		font-size: 1.5em;
		color: chocolate;
		font-family: 'Arvo', serif;
	}

	h1 {
		/*add an underline to the title*/
		text-decoration: underline;
	}
</style>
