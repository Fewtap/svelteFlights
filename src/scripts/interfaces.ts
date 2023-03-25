
/**
 * @description
 * The interface for the flight object.
 * @property {string | null} actual - Idk what this is
 * @property {string} arrivalairport - The arrival airport
 * @property {string} arrivalicao - The arrival ICAO
 * @property {string} da - Danish Status
 * @property {string} en - English Status
 * @property {string} kl - Greenlandic Status
 * @property {string} planned - The planned time of flight
 * @property {string} departureairport - The departure airport
 * @property {string} departureicao - The departure ICAO
 * @property {string | null} estimated - The estimated time of flight
 * @property {string} flighthash - The flight hash
 * @property {string} rute - The route of the flight
 * @property {string} type - The type of the flight
 * @property {string | null} busdeparture - The departure time of the bus
 * @property {boolean} delayed - Whether the flight is delayed or not
 * @property {boolean} cancelled - Whether the flight is cancelled or not
 * @property {Room[]} rooms - The rooms in the flight
 */
export interface IFlight {
    actual: string | null;
    arrivalairport: string;
    arrivalicao: string;
    da: string;
    departureairport: string;
    departureicao: string;
    en: string;
    estimated: string | null;
    flighthash: string | null;
    kl: string;
    planned: string;
    rooms: IRoom[] | null; // Replace with a more specific type if possible
    rute: string;
    type: string;
    busdeparture: string | null;
    delayed: boolean;
    cancelled: boolean;
}

/**
 * @description
 * The interface for the room object.
 * @property {string} roomnumber - The room number
 * @property {string} flighthash - The flight hash
 * @property {string} planned - The planned time of flight
 * @property {number} amount - The amount of people in the room, default 1
 */
export interface IRoom {
    id: string;
    roomnumber: string;
    flighthash: string;
    planned: string | null;
    amount: number | 1;
}

export interface flighttype {
	departure: 'departure',
	arrival: 'arrival'
}