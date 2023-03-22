import { writable, type Writable } from "svelte/store";

export const selectedCard: Writable<string | null> = writable(null);