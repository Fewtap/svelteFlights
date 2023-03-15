import moment from 'moment';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://uzkphhitjjeooktrkyud.supabase.co';

const supabase = createClient(
	SUPABASE_URL,
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6a3BoaGl0amplb29rdHJreXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzg1OTcxNTYsImV4cCI6MTk5NDE3MzE1Nn0.eoNOoKc10Z7WmiqVTpyHogh7e1HzeAipxNmIKX1n_rc'
);

const fetchFlightWithRooms = async (flighthash) => {
	const { data, error } = await supabase
		.from('flights')
		.select(
			`
      *,
      rooms (
        *
      )
    `
		)
		.eq('flighthash', flighthash);

	if (error) {
		console.error('Error fetching flight with rooms:', error);
	} else {
		console.log('Flight with rooms:', data);
	}
};

supabase
	.from('flights')
	.select('*, rooms(*)')
	.eq('flighthash', '9f650e635c68a96b277868fb96a1b10f11d0214665336510c040d24b5d294905')
	.then((data) => {
		console.log(data.data[0].rooms);
	});
