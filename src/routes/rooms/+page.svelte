<script lang="ts">
	import PocketBase from 'pocketbase';
	import { onMount, onDestroy } from 'svelte';
	import { identity, object_without_properties, select_value } from 'svelte/internal';
	import { fade, fly, scale, slide, blur } from 'svelte/transition';

	let roomsLoaded: boolean = true;
	let selectedDate: Date = new Date();
	let dataExists: boolean = true;
	let roomnumber: string = '';
	let amountPeople: number = 1;
	let rooms: any = [];
	let totalpeopele: number = 0;
	let roomnumberinput: any = null;
	let getdepartures: boolean = true;
	const pb = new PocketBase('http://176.58.101.163:8080');

	//pb.autoCancellation(false);

	/**
	 * @type {any[]}
	 */
	let flights: any[] = [];

	const getflightpocketbase = async (_date: Date) => {
		let collectionstring: string = '';
		flights = [];

		_date.setHours(0, 0, 0, 0);
		let datestring = _date.toISOString().slice(0, 10);

		if (getdepartures) collectionstring = 'departures';
		else collectionstring = 'arrivals';

		const result = await pb.collection(collectionstring).getFullList(500, {
			filter: 'planned ~ "' + datestring + '"'
		});

		result.forEach((doc) => {
			doc.planned = new Date(doc.planned);
			if (doc.actual) doc.actual = new Date(doc.actual);
			if (doc.estimated != '') {
				doc.estimated = new Date(doc.estimated);
				//make a new key for busdeparture which is 90 minutes before estimated
				doc.busdeparture = new Date(doc.estimated.setMinutes(doc.estimated.getMinutes() - 90));
			} else {
				doc.busdeparture = new Date(doc.planned.setMinutes(doc.planned.getMinutes() - 90));
			}
			doc.selected = false;
			doc.rooms = [];
			doc.totalpeople = 0;

			flights.push(doc);
		});

		flights = flights.sort((a, b) => {
			return a.planned.getTime() - b.planned.getTime();
		});

		if (flights.length > 0) flights[0].selected = true;

		if (flights.length == 0) dataExists = false;
		else dataExists = true;

		flights = flights;
	};

	let selectedFlight: any = null;
	onMount(async () => {
		await getflightpocketbase(selectedDate);
		selectedFlight = flights[0];
		subscribetodb();
		getallRooms();
	});

	//TODO: fix this function
	async function getallRooms() {
		roomsLoaded = false;

		for (let i = 0; i < flights.length; i++) {
			let rooms = await getRooms(flights[i].flighthash);
			rooms.forEach((room) => {
				flights[i].totalpeople += room.amount;
			});
			flights[i].rooms = rooms;

			console.log(flights[i].totalpeople);
		}

		roomsLoaded = true;
	}

	onDestroy(() => {
		pb.collection('rooms').unsubscribe('*');
	});

	function subscribetodb() {
		pb.collection('rooms').subscribe('*', async ({ action, record }) => {
			if (action == 'create') {
				selectedFlight.rooms.push(record);
				selectedFlight.totalpeople += record.amount;
				selectedFlight.rooms = selectedFlight.rooms;
				selectedFlight.rooms = selectedFlight.rooms;
				flights.find((flight) => flight.id == selectedFlight.id).rooms = selectedFlight.rooms;
				flights.find((flight) => flight.id == selectedFlight.id).totalpeople =
					selectedFlight.totalpeople;

				flights = flights;
			} else if (action == 'delete') {
				selectedFlight.rooms = selectedFlight.rooms.filter(
					(room: { id: string }) => room.id != record.id
				);
				selectedFlight.totalpeople -= record.amount;
				console.log('Total people:' + selectedFlight.totalpeople);
				selectedFlight.rooms = selectedFlight.rooms;
				flights.find((flight) => flight.id == selectedFlight.id).rooms = selectedFlight.rooms;
				flights.find((flight) => flight.id == selectedFlight.id).totalpeople =
					selectedFlight.totalpeople;
				if (selectedFlight.rooms.length == 0) {
					if (getdepartures) {
						await pb.collection('departures').update(selectedFlight.id, { hasrooms: false });
					} else {
						await pb.collection('arrivals').update(selectedFlight.id, { hasrooms: false });
					}
				}

				flights = flights;
			}
		});
	}
	async function togglegetdepartures() {
		getdepartures = !getdepartures;

		await getflightpocketbase(selectedDate);
		if (flights.length > 0) selectedFlight = flights[0];
		else return;
		selectedFlight = flights[0];
		flights.forEach((flight) => {
			flight.selected = false;
		});
		selectedFlight.selected = true;
		await getallRooms();
	}

	async function nextDay() {
		selectedDate.setDate(selectedDate.getDate() + 1);
		selectedDate = selectedDate;
		await getflightpocketbase(selectedDate);
		if (flights.length > 0) selectedFlight = flights[0];
		else return;
		flights.forEach((flight) => {
			flight.selected = false;
		});
		selectedFlight.selected = true;
		getallRooms();
	}

	async function prevDay() {
		selectedDate.setDate(selectedDate.getDate() - 1);
		selectedDate = selectedDate;
		await getflightpocketbase(selectedDate);
		selectedFlight = flights[0];
		flights.forEach((flight) => {
			flight.selected = false;
		});
		selectedFlight.selected = true;
		getallRooms();
	}

	function selectFlight(id: String) {
		flights.forEach((flight) => {
			if (flight.id == id) {
				if (flight.selected) {
					flight.selected = false;
				} else {
					flight.selected = true;
					selectedFlight = flight;
				}
			} else flight.selected = false;
		});

		flights = flights;

		roomnumberinput.focus();
		roomnumberinput.value = '';
	}

	async function getRooms(flighthash: String) {
		totalpeopele = 0;
		rooms = [];
		let querystring = 'flighthash = "' + flighthash + '"';

		const result = await pb.collection('rooms').getFullList(500, {
			filter: querystring
		});

		return result;
	}

	function selecttext(e: MouseEvent) {
		//select all text in input
		(e.target as HTMLInputElement).select();
	}

	async function deleteRoom(idnumber: string) {
		await pb.collection('rooms').delete(idnumber);
		rooms = rooms;
		fetch(
			'http://176.58.101.163:5000/api/rooms' + '?date=' + selectedDate.toISOString().split('T')[0],
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			}
		).then((response) => {
			console.log(response);
		});
	}

	async function printSheet() {
		let neutraldate = new Date(selectedDate);
		neutraldate.setHours(0, 0, 0, 0);
		console.log(neutraldate.toISOString().split('T')[0]);
		let query = 'date ~ "' + neutraldate.toISOString().split('T')[0] + '"';
		console.log(query);
		let record = await pb.collection('sheet').getFullList(1, {
			filter: 'date ~ "' + neutraldate.toISOString().split('T')[0] + '"'
		});

		let downloadurl = pb.getFileUrl(record[0], record[0].excelfile);
		window.open(downloadurl, 'Excel File');
	}

	async function submit() {
		if (roomnumber == '' || roomnumber == 'Enter room number: ') {
			alert('Please enter a room number');
			return;
		}

		await pb.collection('rooms').create({
			flighthash: selectedFlight.flighthash,
			roomnumber: roomnumber,
			amount: amountPeople
		});
		if (getdepartures) {
			await pb.collection('departures').update(selectedFlight.id, {
				hasrooms: true
			});
		} else {
			await pb.collection('arrivals').update(selectedFlight.id, {
				hasrooms: true
			});
		}

		console.log(selectedFlight.rooms);
		roomnumber = '';
		amountPeople = 1;
		roomnumberinput.value = '';
		console.log('Element value: ' + roomnumberinput.value);
		console.log('Roomnumber variable: ' + roomnumber);
		roomnumberinput.focus();
		//Add a parameter to the url containing the selected date

		fetch(
			'http://176.58.101.163:5000/api/rooms' + '?date=' + selectedDate.toISOString().split('T')[0],
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	}
</script>

<div class="panel">
	<div class="controlscontainer">
		<div class="buttons">
			<button on:click={() => prevDay()}>Previous Day</button>
			{#if getdepartures}
				<h2 in:fade={{ delay: 800 }}>Departures</h2>
			{:else}
				<h2 in:fade={{ delay: 800 }}>Arrivals</h2>
			{/if}
			<h1>{selectedDate.toDateString()}</h1>
			<button on:click={() => nextDay()}>Next Day</button>
			<button
				on:click={() => {
					togglegetdepartures();
				}}>Switch</button
			>
			<button on:click={() => printSheet()}>Print Sheet</button>
		</div>
		<div class="inputcontainer">
			<input
				bind:this={roomnumberinput}
				placeholder="Enter room number:"
				type="text"
				bind:value={roomnumber}
				on:click={(e) => selecttext(e)}
				on:keydown={(e) => (e.key == 'Enter' ? submit() : '')}
			/>
			<input
				type="number"
				bind:value={amountPeople}
				on:click={(e) => selecttext(e)}
				on:keydown={(e) => (e.key == 'Enter' ? submit() : '')}
			/>
		</div>

		{#if selectedFlight}
			{#key selectedFlight.id}
				<h2 in:slide={{ duration: 500, delay: 100 }}>{selectedFlight.rute}</h2>
			{/key}
			{#if !roomsLoaded}
				<h1 transition:fade>Loading...</h1>
			{:else if selectedFlight.rooms.length > 0}
				{#key selectedFlight.totalpeople}
					<h3 in:slide={{ duration: 500, delay: 100 }}>
						Total amount of people: {selectedFlight.totalpeople}
					</h3>
				{/key}

				{#each selectedFlight.rooms as room}
					<div
						in:slide={{ duration: 200 }}
						out:slide={{ delay: 0, duration: 100 }}
						class="roomcard"
					>
						<div class="roomtext">
							<h3>Roomnumber: {room.roomnumber} Amount: {room.amount}</h3>
						</div>
						<div class="roomdelete">
							<button on:click={() => deleteRoom(room.id)}>X</button>
						</div>
					</div>
				{/each}
			{:else}
				<h3 in:fade={{ delay: 1000 }}>No rooms</h3>
			{/if}
		{/if}
	</div>

	<div class="cardcontainer">
		{#if dataExists}
			{#each flights as flight (flight.flighthash)}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div
					transition:fade
					class={flight.selected ? 'selected card' : 'card'}
					on:click={() => selectFlight(flight.id)}
				>
					<h2>{flight.rute}</h2>
					{#if getdepartures}
						<h4>Destination: {flight.arrivalairport}</h4>
					{:else}
						<h4>Origin Airport: {flight.departureairport}</h4>
					{/if}
					<h4 transition:fade>People: {flight.totalpeople}</h4>
					<h4 transition:fade>Rooms: {flight.rooms.length}</h4>
				</div>
			{/each}
		{:else}
			<h1>No data</h1>
		{/if}
	</div>
</div>

<style>
	.inputcontainer {
		display: flex;
		flex-direction: column;
		justify-content: space-evenly;
		align-items: center;
		width: 50%;
	}

	.inputcontainer input {
		width: 100%;
		height: 50%;
		border-radius: 10px;
		border: none;
		margin: 10px 0;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
	}
	.roomcard {
		display: flex;
		justify-content: space-evenly;
		align-items: center;
		width: 50%;
		height: 50px;
		background-color: #f5f5f5;
		border-radius: 10px;
		margin: 10px 0;
		padding: 0 10px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
	}

	.roomtext {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 90%;
		height: 100%;
	}

	.roomdelete {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 10%;
		height: 100%;
	}

	.roomdelete button {
		width: 100%;
		height: 75%;
		border: none;
		background-color: #f5f5f5;
		border-radius: 10px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
	}

	input:hover {
		cursor: text;
	}

	.roomdelete button:hover {
		background-color: red;
		transition: cubic-bezier(1, 0, 0, 1);
	}

	.buttons {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.panel {
		display: flex;

		justify-content: center;
		align-items: center;
		margin: 0 auto;
		width: 100vw;
		height: 100vh;
		background-color: #f5f5f5;
	}
	.controlscontainer {
		display: flex;
		flex-direction: column;
		justify-content: start;
		align-items: center;
		margin: 0 auto;
		width: 50%;
		height: 100%;
	}

	input {
		width: 50%;
		height: 50px;
		font-size: 20px;
		border-radius: 10px;
		border: none;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
		padding: 20px;
		cursor: pointer;
		font-size: large;
	}

	.buttons > * {
		margin: 100px 10px;
	}

	.buttons > button {
		background-color: #fff;
		border: none;
		border-radius: 10px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
		padding: 20px;
		cursor: pointer;
		font-size: large;
	}

	.buttons > button:hover {
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
		background-color: antiquewhite;
	}

	.cardcontainer {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		/*The cardcontainer will be centered*/
		margin: 0 auto;
		width: 50%;
		height: 100%;
	}

	.card {
		width: 300px;
		height: 100px;
		background-color: #fff;
		border-radius: 10px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
		margin: 10px;
		padding: 10px;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.card:hover {
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
		background-color: antiquewhite;

		transition: 0.2s;
		transition-timing-function: ease-in-out;
		/*The mouse cursor will change to a pointer when hovering over the card*/
		cursor: pointer;
	}

	.card > * {
		margin: 0;
		padding: 0;
		text-align: center;
	}

	.selected {
		border: antiquewhite 10px solid;
		/*there will be a radial splash effect when the card is selected*/
	}
</style>
