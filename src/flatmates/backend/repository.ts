// @ts-nocheck
/**
 * Flatmates BACKEND — data access layer (ports).
 * Frontend code must never import the raw localStorage store; it goes through
 * this repository so the persistence engine can be swapped (Cloud/DB) later
 * without touching a single screen.
 */
import {
  People,
  Rooms,
  Flats,
  Groups,
  Threads,
  Interests,
  Meetings,
  Notifs,
  Events,
  getMe,
  setMe,
  subscribe,
  notify,
  track,
  useFM,
} from "@/flatmates/backend/store/store";
import { seedFlatmates, READY_STAYS, AREA_LIST } from "@/flatmates/backend/store/seed";

export const repo = {
  people: People,
  rooms: Rooms,
  flats: Flats,
  groups: Groups,
  threads: Threads,
  interests: Interests,
  meetings: Meetings,
  notifs: Notifs,
  events: Events,
  me: { get: getMe, set: setMe },
  ready: () => READY_STAYS,
  areas: () => AREA_LIST,
  ensureSeed: (force = false) => seedFlatmates(force),
};

export { subscribe, notify, track, useFM };
export type FlatmatesRepo = typeof repo;
