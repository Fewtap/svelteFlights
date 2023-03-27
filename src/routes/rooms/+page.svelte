<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { fetchFlights, converttimes } from '../../scripts/flightutils';

	import type { IFlight, flighttype, IRoom } from '../../scripts/interfaces';

	import Card from '../../components/card.svelte';
	import supabaseutil from '../../scripts/supabaseutil';
	import { selectedCard, flights, roomswithoutflight, typestore } from '../../scripts/stores';
	import moment from 'moment';
	import Room from '../../components/room.svelte';

	let currentDate = moment().format('YYYY-MM-DD');
	console.log(currentDate);
	let selectedFlight: any = null;
	let type = '';

	let roomwithflightinput = '';
	let roomwithflightamount = '1';

	let roomwithoutflightinput = '';
	let roomwithoutflightamount = '1';

	let roomswithoutflightlist: IRoom[] = [];
	let flightslist: IFlight[] = [];

	flights.subscribe((value) => {
		flightslist = value;
	});

	roomswithoutflight.subscribe((value) => {
		roomswithoutflightlist = value;
	});

	typestore.subscribe(async (value) => {
		type = value;
		let start = moment(currentDate).startOf('day').format('YYYY-MM-DD HH:mm:ss');
		let end = moment(currentDate).endOf('day').format('YYYY-MM-DD HH:mm:ss');
		let temp = await supabaseutil
			.from('rooms')
			.select('*')
			.gte('planned', start)
			.lte('planned', end)
			.eq('flighthash', null);
	});

	onMount(async () => {
		getroomswithoutrooms(currentDate);
		await getflights();
		if (flightslist.length > 0) selectedCard.set(flightslist[0].flighthash);
	});

	function getroomswithoutrooms(date: string) {
		let start = moment(date).startOf('day').format('YYYY-MM-DD HH:mm:ss');
		let end = moment(date).endOf('day').format('YYYY-MM-DD HH:mm:ss');
		console.log(start, end);
		supabaseutil
			.from('rooms')
			.select('*')
			.gte('planned', start)
			.lte('planned', end)
			.eq('type', type)
			.select('*')
			.then((data) => {
				roomswithoutflight.set(data.data as IRoom[]);
			});
	}

	$: selectedFlight = flightslist.find((flight) => flight.flighthash == $selectedCard);

	async function getflights() {
		let templist = (await fetchFlights(supabaseutil, currentDate, type)) as IFlight[];

		flights.set(templist);
	}

	async function changeDate(datechange: string) {
		if (datechange == 'next') {
			currentDate = moment(currentDate).add(1, 'day').format('YYYY-MM-DD');
		} else if (datechange == 'previous') {
			currentDate = moment(currentDate).subtract(1, 'day').format('YYYY-MM-DD');
		}
		await getflights();
		if (flightslist.length > 0) selectedCard.set(flightslist[0].flighthash);
		getroomswithoutrooms(currentDate);
	}

	const channel = supabaseutil
		.channel('public')
		.on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public',
				table: 'rooms'
			},
			(payload) => {
				switch (payload.eventType) {
					case 'INSERT':
						updatesingleFlight(payload.new.flighthash);
						break;
					case 'UPDATE':
						getflights();
						break;
					case 'DELETE':
						updatesingleFlight(payload.old.flighthash);
						break;
				}
			}
		)
		.subscribe();

	async function changeType() {
		flightslist = [];
		if (type == 'departure') {
			typestore.set('arrival');
		} else if (type == 'arrival') {
			typestore.set('departure');
		}
		await getflights();
		getroomswithoutrooms(currentDate);

		setTimeout(() => {}, 2000);
		selectedCard.set(flightslist[0].flighthash);
	}

	function addRoom(hasflight: boolean) {
		let room: IRoom = {
			id: undefined,
			roomnumber: '',
			amount: '1',
			flighthash: null,
			planned: moment(currentDate).format('YYYY-MM-DD HH:mm:ss'),
			type: null
		};

		if (hasflight) {
			room.roomnumber = roomwithflightinput;
			room.amount = roomwithflightamount;
			room.flighthash = selectedFlight.flighthash;
			selectedFlight.rooms.push(room);
			selectedFlight = selectedFlight;
			roomwithflightinput = '';
			roomwithflightamount = '1';
			updatesingleFlight(selectedFlight.flighthash);
		} else {
			room.roomnumber = roomwithoutflightinput;
			room.amount = roomwithoutflightamount;
			room.flighthash = null;
			room.type = type;
			roomswithoutflightlist.push(room);
			roomswithoutflight.set(roomswithoutflightlist);
			roomwithoutflightinput = '';
			roomwithoutflightamount = '1';
		}

		supabaseutil
			.from('rooms')
			.insert(room)
			.select('*')
			.then((data) => {
				if (data.data != null) {
					if (data.data.length > 0) {
						let newroom = data.data[0] as IRoom;
						if (hasflight) {
							const index = selectedFlight.rooms.findIndex((room) => room.id == newroom.id);
							selectedFlight.rooms[index] = newroom;
							selectedFlight = selectedFlight;
						} else {
							const index = roomswithoutflightlist.findIndex((room) => room.id == undefined);
							roomswithoutflightlist[index] = newroom;
							roomswithoutflight.set(roomswithoutflightlist);
						}
					}
				}
			});
	}

	function updatesingleFlight(flighthash: string) {
		supabaseutil
			.from('flights')
			.select('*, rooms(*)')
			.eq('flighthash', flighthash)
			.then((data) => {
				if (data.data != null) {
					if (data.data.length > 0) {
						let newflight = data.data[0] as IFlight;
						const index = flightslist.findIndex((flight) => flight.flighthash == flighthash);
						flightslist[index] = newflight;
						flights.set(flightslist);
					}
				}
			});
	}

	function downloadsheet() {
		const { data } = supabaseutil.storage
			.from('sheets')
			.getPublicUrl(`${moment(currentDate).format('YYYY-MM-DD')}`, {
				download: false
			});
		open(data.publicUrl);
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
			<button on:click={downloadsheet}>Download sheet</button>
		</div>

		<div class="inputcontainer">
			<form on:submit|preventDefault={() => addRoom(false)} class="inputform">
				<input
					type="text"
					bind:value={roomwithoutflightinput}
					placeholder="Input room without flight"
				/>
				<input type="number" bind:value={roomwithoutflightamount} placeholder="Amount" />
				<button type="submit" class="submitbutton" style="margin-inline: auto;">Add Room</button>
			</form>
			<div class="withoutflights">
				{#if selectedFlight != null}
					{#each roomswithoutflightlist as room}
						<Room {room} />
					{/each}
				{/if}
			</div>
			<form on:submit|preventDefault={() => addRoom(true)} class="inputform">
				<input type="text" bind:value={roomwithflightinput} placeholder="Input room with flight" />
				<input type="number" bind:value={roomwithflightamount} placeholder="Amount" />
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
		padding: 1em;
	}

	.container {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
	}

	.withoutflights {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		/*cannot be higher than 30vh*/
		max-height: 200px;
		overflow-y: auto;
	}

	.withflights {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		overflow-y: auto;
		/*cannot be higher than 30vh*/
		max-height: 300px;
	}
</style>
