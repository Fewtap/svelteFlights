const flight = {
	Rute: 'GL 502',
	DepartureAirport: 'Kangerlussuaq',
	ArrivalAirport: 'Ilulissat',
	Planned: '2023-03-13T12:10:00+00:00',
	Estimated: null,
	Actual: null,
	Status: { kl: '', en: '', da: '' },
	FlightHash: '84e73c241baa807528336d5236bd73de058ddb06f76ae002ff5e0e04fc7bc74a',
	ArrivalICAO: 'BGJN',
	DepartureICAO: 'BGSF'
};

const spreadStatus = { ...flight, ...flight.Status };
delete spreadStatus.Status;
console.log(spreadStatus);
