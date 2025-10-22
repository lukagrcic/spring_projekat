// src/services/auth.ts
// Servis koji se bavi autentifikacijom korisnika i čuvanjem njegovih podataka u localStorage-u.

import { http } from '../api/http'  // Pomoćna funkcija za slanje HTTP zahteva ka backendu

// ----------------------------
// Tipovi
// ----------------------------

export type LoginResponse = {
    id: string        // ID korisnika koji dolazi sa servera
    token: string     // JWT token ili sličan token za autentifikaciju
    username: string  // Korisničko ime (za prikaz i praćenje sesije)
}

// ----------------------------
// Funkcije za autentifikaciju
// ----------------------------

export async function login(username: string, password: string): Promise<LoginResponse> {
    // Funkcija šalje POST zahtev na /auth/login sa korisničkim kredencijalima.
    // Backend proverava validnost korisnika i vraća JWT token i osnovne podatke.
    return http<LoginResponse>('/auth/login', {
        method: 'POST',                                  // POST jer se šalju poverljivi podaci
        body: JSON.stringify({ username, password }),    // Telo zahteva se šalje kao JSON string
    })
}

// ----------------------------
// Upravljanje localStorage-om
// ----------------------------

export function saveAuth(token: string, username: string, userId: string) {
    // Čuva podatke o sesiji u localStorage-u browsera.
    // Ovo omogućava da korisnik ostane prijavljen i posle osvežavanja stranice.
    localStorage.setItem('authToken', token)     // JWT token
    localStorage.setItem('authUser', username)   // korisničko ime
    localStorage.setItem('authUserId', userId)   // ID korisnika
}

export function getToken(): string | null {
    // Vraća token iz localStorage-a (koristi se za slanje autorizovanih zahteva)
    return localStorage.getItem('authToken')
}

export function getUsername(): string | null {
    // Vraća trenutno prijavljeno korisničko ime
    return localStorage.getItem('authUser')
}

export function getUserId(): string | null {
    // Vraća ID korisnika iz localStorage-a
    return localStorage.getItem('authUserId')
}

export function logout() {
    // Briše sve podatke o sesiji iz localStorage-a.
    // Time se korisnik efektivno odjavljuje iz aplikacije.
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    localStorage.removeItem('authUserId')
}

