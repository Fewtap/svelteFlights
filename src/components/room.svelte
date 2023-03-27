<script lang="ts">
	import supabaseutil from '../scripts/supabaseutil';
	import type { IRoom, IFlight } from '../scripts/interfaces';
	import { fade } from 'svelte/transition';
	import { flights, selectedCard, typestore, roomswithoutflight } from '../scripts/stores';
	import { onDestroy } from 'svelte';

	export let room: IRoom;
	let flightslist: IFlight[] = [];
	let type = '';
	let roomswithoutflightlist: IRoom[] = [];

	const unsubscribe = flights.subscribe((value) => {
		flightslist = value;
	});

	const unsubscribe2 = roomswithoutflight.subscribe((value) => {
		roomswithoutflightlist = value as IRoom[];
	});

	typestore.subscribe((value) => {
		type = value;
	});

	onDestroy(() => {
		unsubscribe();
	});

	async function deleteRoom(room: IRoom) {
		if (room.flighthash == null) {
			let roomsleft = roomswithoutflightlist.filter((roominlist) => room.id != roominlist.id);
			const { data, error } = await supabaseutil.from('rooms').delete().eq('id', room.id);
			console.log(data);
			console.log(error);
			roomswithoutflight.set(roomsleft);
			return;
		} else {
			//get the index of the flight with the same flighthash as the room
			let index = flightslist.findIndex((flight) => flight.flighthash == room.flighthash);

			flightslist[index].rooms = flightslist[index].rooms.filter((room) => room.id != room.id);
			flights.set(flightslist);

			const { data, error } = await supabaseutil.from('rooms').delete().eq('id', room.id);
		}
	}
</script>

<div class="roomcontainer" transition:fade>
	<button on:click={() => deleteRoom(room)}>X</button>
	<h1>{room.roomnumber}</h1>
	<h2>{room.amount}</h2>
</div>

<style>
	.roomcontainer {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		background-color: white;
		border-radius: 10px;
		padding: 1em;
		margin: 1em;
		gap: 5em;
	}

	button {
		border: none;
		background-color: white;
		color: red;
		font-size: 1.5em;
	}

	button:hover {
		cursor: pointer;
		background: black;
	}
</style>
