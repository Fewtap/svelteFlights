<script lang="ts">
	import supabase from '../scripts/supabase';
	import type { Room, Flight } from '../scripts/interfaces';
	import { fade } from 'svelte/transition';

	export let room: Room;

	function deleteRoom(room: Room) {
		let fh = room.flighthash;

		supabase
			.from('rooms')
			.delete()
			.eq('id', room.id)
			.select('*')
			.then((data) => {
				console.log('Deleted room: ', data);
			});
	}
</script>

<div class="roomcontainer" transition:fade>
	<button on:click={() => deleteRoom(room)}>X</button>
	<h1>{room.roomnumber}</h1>
</div>

<style>
	.roomcontainer {
		display: grid;
		align-items: center;
		justify-items: center;
		grid-template-columns: 10% 90%;
		align-items: center;
		background-color: white;
		border-radius: 5px;
		width: 20em;
		margin: 1em;
		padding: 10px;
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
