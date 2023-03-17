import moment from 'moment';
import { createClient } from '@supabase/supabase-js';
import { spread } from 'svelte/internal';

const SUPABASE_URL = 'https://uzkphhitjjeooktrkyud.supabase.co';

const supabase = createClient(
	SUPABASE_URL,
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6a3BoaGl0amplb29rdHJreXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzg1OTcxNTYsImV4cCI6MTk5NDE3MzE1Nn0.eoNOoKc10Z7WmiqVTpyHogh7e1HzeAipxNmIKX1n_rc'
);


interface Flight {
  actual: string | null;
  arrivalairport: string;
  arrivalicao: string;
  da: string;
  departureairport: string;
  departureicao: string;
  en: string;
  estimated: string | null;
  flighthash: string;
  kl: string;
  planned: string;
  rooms: Room[] | null; // Replace with a more specific type if possible
  rute: string;
  type: string;
}

interface Room{
	  flighthash: string;
	  roomnumber: string;
	  amount: number | null;
	  planned: string | null;
}

supabase
	.channel('any')
	.on('postgres_changes', { event: '*', schema: 'public', table: 'flights' }, (payload) => {
		console.log('Change received!', payload);
	})
	.subscribe();

async function getflights(option:string) {
	const url =
		'https://www.mit.gl/wp-content/themes/mitgl/webservice.php?type=' + option + '&icao=BGJN';
	fetch(url)
		.then((res) => res.json())
		.then((newdata) => {
			const spreadflights: any[] = [];
			for (let i = 0; i < newdata.length; i++) {
				const flight = newdata[i];
				let spreadflight = { ...flight, ...flight.Status };
				delete spreadflight.Status;

				spreadflight = toLowerCaseKeys(spreadflight);
				spreadflight = fixTimestamps(spreadflight);

				const _flight: Flight = spreadflight as Flight;

				console.log(_flight.rute);

			}});
		}



/**
 * 
 * @param flight The flight to fix the timestamps for
 * @returns  The flight with the timestamps fixed
 * 
 * This function fixes the timestamps for the flight
 */
function fixTimestamps(flight: any) {
	flight.Planned = moment.utc(flight.Planned).format('YYYY-MM-DDTHH:mm:ss');
	if (flight.Estimated != null) {
		flight.Estimated = moment.utc(flight.Estimated).format('YYYY-MM-DDTHH:mm:ss');
	}
	if (flight.Actual != null) {
		flight.Actual = moment.utc(flight.Actual).format('YYYY-MM-DDTHH:mm:ss');
	}

	return flight;
}

/**
 * 
 * @param flight The flight to convert the keys to lowercase
 * @returns  The flight with the keys converted to lowercase
 *  This function converts the keys of the flight to lowercase
 */
function toLowerCaseKeys(flight:any){
	const keys = Object.keys(flight);
	const n = keys.length;
	const newobj:any = {};
	for (let j = 0; j < n; j++) {
		newobj[keys[j].toLowerCase()] = flight[keys[j]];
	}
	return newobj;
}

getflights('Arrivals');
getflights('Departures');

setInterval(() => {
	console.log('Updating flights...');
	getflights('Arrivals');
	getflights('Departures');
}, 10000);
