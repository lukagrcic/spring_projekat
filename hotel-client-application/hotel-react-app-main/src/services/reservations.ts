// src/services/reservations.ts
// Servis sloj za komunikaciju sa backend API-jem koji upravlja rezervacijama, gostima, sobama i gradovima.

import { http } from '../api/http'  // Uvoz generičke HTTP funkcije koja obavlja sve API pozive

// -----------------------
// Tipovi podataka (TypeScript tipovi koji opisuju strukturu podataka iz backend-a)
// -----------------------

export type Employee = {
    id: number
    firstName: string
    lastName: string
    username: string
}

export type City = {
    cityId: number
    cityName: string
}

export type Guest = {
    id: number
    jmbg: string
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    city: City  // svaki gost ima povezan objekat grada
}

export type RoomType = {
    roomTypeId: number
    category: string
    pricePerNight: string
    description: string
}

export type Room = {
    roomId: number
    roomNumber: string
    floor: string
    status: string
    roomType: RoomType // svaka soba ima pridruženi tip
}

export type Reservation = {
    id: number
    dateFrom: string
    dateTo: string
    status: string
    breakfastIncluded: boolean
    note: string
    employee: Employee
    guest: Guest
    room: Room
    totalPrice: number
}

// DTO za slanje novih rezervacija (koristi se u POST zahtevu)
export type SaveReservationRequest = {
  dateFrom: string // format datuma YYYY-MM-DD
  dateTo: string   // format datuma YYYY-MM-DD
  breakfastIncluded: boolean
  note: string
  employeeId: string
  guestId: number
  roomId: number
}

// DTO za ažuriranje postojećeg gosta
export type UpdateGuestRequest = {
  id: number
  jmbg: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  cityId: number
}

// DTO za kreiranje novog gosta
export type SaveGuestRequest = {
  jmbg: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  cityId: number
}

// -----------------------
// Funkcije za rezervacije
// -----------------------

export async function listReservations(): Promise<Reservation[]> {
    // GET zahtev ka backend endpointu koji vraća sve rezervacije u sistemu
    // http helper automatski parsira JSON odgovor u niz objekata tipa Reservation
    return http<Reservation[]>('/reservations/findAll')
}

export async function searchReservations(query: string): Promise<Reservation[]> {
  // Uklanjamo razmake sa početka i kraja stringa
  // Ako je query prazan (null/undefined), postavlja se na prazan string
  const q = query?.trim() ?? ''

  // encodeURIComponent koristi se da se specijalni karakteri (npr. razmak) pravilno kodiraju u URL
  // Na primer: "Ana Marković" → "Ana%20Markovi%C4%87"
  return http<Reservation[]>(`/reservations/search?query=${encodeURIComponent(q)}`)
}

export async function findReservationById(id: number | string): Promise<Reservation> {
    // GET zahtev koji pretražuje rezervaciju po njenom ID-u
    // ID se šalje kao query parametar npr. ?id=5
    return http<Reservation>(`/reservations/findById?id=${id}`)
}

export async function deleteReservationById(id: number | string): Promise<void> {
  // DELETE zahtev ka endpointu /reservations/deleteById
  // Metoda 'DELETE' govori backendu da treba da obriše resurs sa tim ID-jem
  await http<void>(`/reservations/deleteById?id=${id}`, { method: 'DELETE' })
}

export async function saveReservation(payload: SaveReservationRequest): Promise<void> {
  // POST zahtev za kreiranje nove rezervacije
  // 'payload' je JS objekat koji sadrži podatke o novoj rezervaciji
  // JSON.stringify ga konvertuje u JSON string pre slanja
  await http<void>('/reservations/save', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// -----------------------
// Funkcije za goste
// -----------------------

export async function listGuests(): Promise<Guest[]> {
  // Vraća listu svih gostiju
  // Standardni GET zahtev bez dodatnih parametara
  return http<Guest[]>('/guests/findAll')
}

export async function searchGuests(query: string): Promise<Guest[]> {
  // Trimujemo i proveravamo da li postoji upit
  const q = query?.trim() ?? ''
  // Ako korisnik nije uneo tekst (query je prazan), vraćamo prazan niz — ne šaljemo zahtev
  if (!q) return []
  // Ako upit postoji, formira se URL sa query parametrom
  return http<Guest[]>(`/guests/search?query=${encodeURIComponent(q)}`)
}

export async function findGuestById(id: number | string): Promise<Guest> {
  // Dohvata podatke o gostu po ID-u
  return http<Guest>(`/guests/findById?id=${id}`)
}

export async function deleteGuestById(id: number | string): Promise<void> {
  // Briše gosta iz baze
  // DELETE zahtev sa query parametrom id
  await http<void>(`/guests/deleteById?id=${id}`, { method: 'DELETE' })
}

export async function updateGuest(payload: UpdateGuestRequest): Promise<void> {
  // PUT zahtev za ažuriranje već postojećeg gosta
  // PUT se koristi kada menjamo postojeći entitet (za razliku od POST koji pravi novi)
  await http<void>('/guests/update', {
    method: 'PUT',
    body: JSON.stringify(payload), // Pretvaramo objekat u JSON
  })
}

export async function saveGuest(payload: SaveGuestRequest): Promise<void> {
  // POST zahtev za dodavanje novog gosta u bazu
  // Payload sadrži sve potrebne podatke (ime, jmbg, grad itd.)
  await http<void>('/guests/save', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// -----------------------
// Funkcije za sobe
// -----------------------

export async function searchRooms(query: string): Promise<Room[]> {
  // Trimujemo upit, ako nema teksta ne šaljemo zahtev
  const q = query?.trim() ?? ''
  if (!q) return []
  // Vraćamo rezultat GET zahteva sa query parametrom
  return http<Room[]>(`/rooms/search?query=${encodeURIComponent(q)}`)
}

export async function listRooms(): Promise<Room[]> {
  // Dohvata sve sobe iz baze podataka
  return http<Room[]>('/rooms/findAll')
}

// -----------------------
// Funkcije za gradove
// -----------------------

export async function listCities(): Promise<City[]> {
  // GET zahtev koji vraća sve gradove iz baze
  // Koristi se npr. u dropdown listi prilikom dodavanja gosta
  return http<City[]>('/cities/findAll')
}

export async function searchCities(query: string): Promise<City[]> {
  // Pretražuje gradove po unetom tekstu
  const q = query?.trim() ?? ''
  // Ako nema upita, ne šalje se zahtev
  if (!q) return []
  // Inače, formira se URL sa query parametrom i šalje GET zahtev
  return http<City[]>(`/cities/search?query=${encodeURIComponent(q)}`)
}

