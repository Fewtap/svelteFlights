import { createClient, SupabaseClient } from '@supabase/supabase-js';
import moment from 'moment';
import { element } from 'svelte/internal';

const SUPABASE_URL = 'https://uzkphhitjjeooktrkyud.supabase.co';
const supabase = createClient(
	SUPABASE_URL,
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6a3BoaGl0amplb29rdHJreXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzg1OTcxNTYsImV4cCI6MTk5NDE3MzE1Nn0.eoNOoKc10Z7WmiqVTpyHogh7e1HzeAipxNmIKX1n_rc'
);


/**
 * Fetches all flights for a given date and type
 * @param date Date to fetch flights for
 * @param type Type of flight to fetch (arrival or departure)
 * @returns Array of flights
 * @example
 * const flights = await fetchFlights(new Date(), 'arrival');
 */
export async function fetchFlights( supabase: SupabaseClient,date: Date, type: string){

	const { start, end } = getTimeSpan(date);

	const { data, error } = await supabase
			.from('flights')
			.select('*, rooms(*)')
			.gte('planned', start.format('YYYY-MM-DDTHH:mm:ss'))
			.lte('planned', end.format('YYYY-MM-DDTHH:mm:ss'))
			.eq('type', type)
			.order('planned', { ascending: true });

	if(error != null){
		return Promise.reject(error);
	}
	else{
		return Promise.resolve(data);
	}
}





/**
 * Adds a room to a flight
 * @param flighthash Hash of the flight to add the room to
 * @param room Room to add to the flight
 * @returns Promise that resolves when the room has been added
 * @example
 * await addRoomToFlight('fjlaskdj10293812olkajsdasd98', '201');
 * 
 */
export async function addRoomToFlight(flighthash: string, room: string): Promise<void>{
	const { data, error } = await supabase
		.from('rooms')
		.insert([
			{
				flighthash: flighthash,
				roomnumber: room
			}
		]);
	if(error != null){
		return Promise.reject(error);
	}
	else{
		return Promise.resolve();
	}
}

/**
 * Returns the start and end of a given date
 * @param date Date to get start and end of
 * @returns Object containing start and end of date
 * @example
 * const { start, end } = getTimeSpan(new Date());
 * 
 */
function getTimeSpan(date: Date): { start: moment.Moment; end: moment.Moment; }{
	const startofDay = moment(date).startOf('day');
	const endofDay = moment(date).endOf('day');

	return {
		start: startofDay,
		end: endofDay
	}
}