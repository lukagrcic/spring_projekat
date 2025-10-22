// src/api/http.ts
// Ovaj fajl definiše generičnu HTTP funkciju koja centralizuje komunikaciju između React frontenda i backend API-ja.
// Svi API pozivi u aplikaciji koriste ovu funkciju za slanje zahteva i obradu odgovora.
// Konceptualno, ovo je "servisni sloj" koji dodaje token u zaglavlje (ako postoji) i uniformno hendluje greške.

export const apiBase =
  // VITE_API_BASE_URL je environment promenljiva definisana u .env fajlu i koristi se za podešavanje baze API URL-a.
  // Ako nije definisana (npr. u lokalnom razvoju), koristi se podrazumevana adresa backend servera.
  (import.meta.env.VITE_API_BASE_URL as string) ?? 'http://localhost:8082'

// Pomoćna funkcija koja bezbedno čita token iz localStorage-a.
// Ako browser ne podržava localStorage ili dođe do greške u pristupu, vraća null umesto da sruši aplikaciju.
function getStoredToken(): string | null {
  try {
    return localStorage.getItem('authToken')
  } catch {
    return null
  }
}

// Glavna funkcija koja obavlja HTTP zahtev.
// T predstavlja generički tip — funkcija može vratiti bilo koji tip podataka u zavisnosti od API endpointa.
// Primer upotrebe: http<User[]>('/users/findAll') → vraća niz korisnika tipa User[].
export async function http<T>(path: string, options: RequestInit = {}): Promise<T> {
  // Pre svakog poziva pokušavamo da uzmemo JWT token iz localStorage-a,
  // jer ga backend koristi za autentifikaciju korisnika.
  const token = getStoredToken()

  // fetch je ugrađena browser funkcija za slanje HTTP zahteva.
  // Ovde se spaja bazu URL-a i relativnu putanju (path), i dodaju se opcije (metoda, telo, zaglavlja).
  const res = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      // Svaki zahtev ima Content-Type: application/json jer backend očekuje JSON telo.
      'Content-Type': 'application/json',

      // Ako postoji token, dodajemo ga kao Authorization header u formatu “Bearer <token>”.
      ...(token ? { Authorization: `Bearer ${token}` } : {}),

      // Ako korisnik eksplicitno prosledi dodatna zaglavlja u options, spajamo ih ovde.
      ...(options.headers || {}),
    },

    // credentials: 'omit' znači da fetch neće automatski slati kolačiće.
    // Oslanjamo se na JWT u zaglavlju umesto cookie-based autentifikacije.
    credentials: 'omit',
  })

  // Ako backend vrati status koji nije “OK” (200–299),
  // čitamo tekst iz odgovora i bacamo grešku sa porukom.
  // Ovo omogućava da gornji slojevi (npr. UI) prikažu poruku korisniku.
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }

  // Ako je backend odgovorio sa statusom 204 (No Content),
  // vraćamo undefined jer nema tela u odgovoru.
  if (res.status === 204) return undefined as T

  // U svim ostalim slučajevima vraćamo JSON telo konvertovano u očekivani tip (Promise<T>).
  // Ovo omogućava da funkcija automatski dekodira odgovor.
  return res.json() as Promise<T>
}

