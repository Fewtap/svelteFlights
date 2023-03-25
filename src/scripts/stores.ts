import { writable, type Writable } from "svelte/store";

import type { IFlight, IRoom } from "../scripts/interfaces";

export const selectedCard: Writable<string | null> = writable(null);

export const flights: Writable<IFlight[]> = writable([]);
export const roomswithoutflight: Writable<IRoom[]> = writable([]);
export const typestore = writable('departure');