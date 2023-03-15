import moment from 'moment';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://uzkphhitjjeooktrkyud.supabase.co';

const supabase = createClient(
	SUPABASE_URL,
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6a3BoaGl0amplb29rdHJreXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzg1OTcxNTYsImV4cCI6MTk5NDE3MzE1Nn0.eoNOoKc10Z7WmiqVTpyHogh7e1HzeAipxNmIKX1n_rc'
);
supabase
	.channel('any')
	.on('postgres_changes', { event: '*', schema: 'public', table: 'flights' }, (payload) => {
		console.log('Change received!', payload);
	})
	.subscribe();

async function getflights(option) {
	const url =
		'https://www.mit.gl/wp-content/themes/mitgl/webservice.php?type=' + option + '&icao=BGJN';
	fetch(url)
		.then((res) => res.json())
		.then((newdata) => {
			let spreadflights = [];
			for (let i = 0; i < newdata.length; i++) {
				const flight = newdata[i];
				let spreadflight = { ...flight, ...flight.Status };
				delete spreadflight.Status;

				if (option == 'Arrivals' && spreadflight.ArrivalICAO == spreadflight.DepartureICAO) {
					console.log(spreadflight.ArrivalICAO + ' == ' + spreadflight.DepartureICAO);

					console.log('Skipping flight');
					continue;
				}

				if (option == 'Arrivals') {
					spreadflight.type = 'arrival';
				} else {
					spreadflight.type = 'departure';
				}

				const formattedDate = moment.utc(spreadflight.Planned).format('YYYY-MM-DDTHH:mm:ss');
				spreadflight.Planned = formattedDate;

				if (spreadflight.Estimated != null) {
					const formattedDate = moment.utc(spreadflight.Estimated).format('YYYY-MM-DDTHH:mm:ss');
					spreadflight.Estimated = formattedDate;
				}
				if (spreadflight.Actual != null) {
					const formattedDate = moment.utc(spreadflight.Actual).format('YYYY-MM-DDTHH:mm:ss');
					spreadflight.Actual = formattedDate;
				}

				const keys = Object.keys(spreadflight);
				const n = keys.length;
				const newobj = {};
				for (let j = 0; j < n; j++) {
					newobj[keys[j].toLowerCase()] = spreadflight[keys[j]];
				}
				spreadflight = newobj;

				spreadflights.push(spreadflight);
			}

			spreadflights.forEach(async (flight) => {
				let { error, data } = await supabase
					.from('flights')
					.select('*')
					.eq('flighthash', flight.flighthash);

				if (data != null || data.length == 0) {
					if (data.length == 0 || data == null) {
						if (flight.rute == 'GL 571') {
						}
						console.log('Inserting flight');
						let { error, data } = await supabase.from('flights').insert(flight);
					}
				} else {
					let difference = false;
					for (var key in flight) {
						if (flight.rute == 'GL 571') {
							console.log(key + ' ' + flight[key]);
						}
						if (flight[key] != data[0][key]) {
							if (key == 'estimated' && flight.rute == 'GL 571') {
								console.log('Old value: ' + data[0][key]);
								console.log('New value: ' + flight[key]);
							}
							//print the difference
							console.log('Old value: ' + data[0][key]);
							console.log('New value: ' + flight[key]);
							difference = true;
						}
					}
					if (difference) {
						console.log('Updating flight', flight.rute);
						let { error, data } = await supabase
							.from('flights')
							.update(flight)
							.eq('flighthash', flight.flighthash);
					}
				}
			});
		});
}

getflights('Arrivals');
getflights('Departures');

setInterval(() => {
	console.log('Updating flights...');
	getflights('Arrivals');
	getflights('Departures');
}, 10000);
