import moment from 'moment';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://uzkphhitjjeooktrkyud.supabase.co';

const supabase = createClient(
	SUPABASE_URL,
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6a3BoaGl0amplb29rdHJreXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzg1OTcxNTYsImV4cCI6MTk5NDE3MzE1Nn0.eoNOoKc10Z7WmiqVTpyHogh7e1HzeAipxNmIKX1n_rc'
);

async function getflights(option) {
	const url =
		'https://www.mit.gl/wp-content/themes/mitgl/webservice.php?type=' + option + '&icao=BGJN';
	fetch(url)
		.then((res) => res.json())
		.then((newdata) => {
			newdata.forEach((flight) => {
				// parse the planned key to a date and format it to the desired format
				const plannedDate = new Date(flight.Planned);
				const plannedString = moment.utc(plannedDate).format('YYYY-MM-DDTHH:mm:ss+00:00');
				flight.Planned = plannedString;
				if (flight.Estimated !== null) {
					// parse the estimated key to a date and format it to the desired format
					const estimatedDate = new Date(flight.Estimated);
					const estimatedString = moment.utc(estimatedDate).format('YYYY-MM-DDTHH:mm:ss+00:00');
					flight.Estimated = estimatedString;
				}
				if (flight.Actual !== null) {
					// parse the actual key to a date and format it to the desired format
					const actualDate = new Date(flight.Actual);
					const actualString = moment.utc(actualDate).format('YYYY-MM-DDTHH:mm:ss+00:00');
					flight.Actual = actualString;
				}
			});

			newdata.forEach((flight) => {
				let changes = false;
				supabase
					.from('flights')
					.select('*')
					.eq('FlightHash', flight.FlightHash)
					.then((response) => {
						if (response.data.length === 0) {
							supabase
								.from('flights')
								.insert(flight)
								.then((response) => {
									console.log('inserted flight');
								});
						} else {
							const oldflight = response.data[0];
							const newflight = flight;

							for (var key in oldflight) {
								//if the values are different upsert the flight
								if (oldflight[key] !== newflight[key]) {
									if (key === 'Status') {
										for (var key2 in oldflight[key]) {
											//TODO: check if this is the correct way to check for changes in the status object
											if (oldflight[key][key2] != newflight[key][key2]) {
												changes = true;
											}
										}
									} else {
										changes = true;
									}
								}
							}
							if (!changes) {
								console.log('no changes');
							} else {
								supabase
									.from('flights')
									.upsert(newflight)
									.then((response) => {
										console.log('updated flight');
									});
							}
						}
					});
			});
		});
}

getflights('Arrivals');
getflights('Departures');

setInterval(() => {
	getflights('Arrivals');
	getflights('Departures');
}, 10000);
