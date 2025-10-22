// src/pages/RoomsPage.tsx
// Stranica za prikaz svih soba (smeštajnih jedinica) i pretragu po broju, spratu ili tipu.
// Koristi React hook-ove (useState, useEffect), asinhrone API pozive i Bootstrap za izgled.

import { useEffect, useState } from 'react'
import TopBar from '../components/TopBar'
import { listRooms, searchRooms } from '../services/reservations'
import type { Room } from '../services/reservations'

// ----------------------------
// Pomoćna funkcija za formatiranje cene
// ----------------------------
// Intl.NumberFormat je ugrađeni JavaScript API koji formatira brojeve prema lokalnim pravilima.
// U ovom slučaju, koristi se za prikaz u evrima, npr. "€120.00".
function fmtPrice(p: string | number | undefined) {
  if (p == null) return '' // ako nema cene (null/undefined) → prazan string
  const n = typeof p === 'string' ? Number(p) : p // ako je string, konvertuje u broj
  if (Number.isNaN(n)) return String(p) // ako konverzija ne uspe, vraća original
  try {
    // Intl.NumberFormat može baciti grešku ako ne prepozna lokalni format
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'EUR',
    }).format(n)
  } catch {
    return String(p)
  }
}

export default function RoomsPage() {
  // ----------------------------
  // React state — lokalno stanje komponente
  // ----------------------------
  // useState vraća par [vrednost, setter] koji React automatski prati i re-renderuje pri promeni.
  const [data, setData] = useState<Room[]>([])               // lista soba za prikaz u tabeli
  const [loading, setLoading] = useState(true)               // indikator da li je učitavanje u toku
  const [error, setError] = useState<string | null>(null)    // tekst greške ako API poziv ne uspe
  const [query, setQuery] = useState('')                     // unos za pretragu
  const [searching, setSearching] = useState(false)          // indikator aktivne pretrage

  // ----------------------------
  // loadAll — učitava sve sobe iz baze
  // ----------------------------
  // Ova funkcija koristi asinhroni API poziv. Koristi try/catch/finally blok radi upravljanja greškama.
  const loadAll = async () => {
    setLoading(true)   // postavlja loading stanje → prikazuje spinner/info poruku
    setError(null)     // resetuje eventualnu staru grešku
    try {
      // await čeka da se asinhroni HTTP zahtev završi pre nego što nastavi dalje
      // listRooms() → GET /rooms/findAll
      setData(await listRooms())
    } catch (e: any) {
      // Ako dođe do greške (npr. mrežni problem), postavlja se tekstualna poruka za korisnika
      setError(e?.message ?? 'Neuspešno učitavanje soba')
    } finally {
      // finally blok se uvek izvršava — ovde resetuje loading bez obzira na ishod
      setLoading(false)
    }
  }

  // ----------------------------
  // useEffect — React lifecycle hook
  // ----------------------------
  // Pokreće se samo jednom (prilikom mountovanja komponente).
  // Prazan dependency array [] znači da se efekat ne ponavlja.
  useEffect(() => {
    loadAll() // inicijalno učitavanje svih soba po otvaranju stranice
  }, [])

  // ----------------------------
  // runSearch — pretraga soba
  // ----------------------------
  // Korisnik unosi tekst (query), i na submit se poziva ova funkcija.
  // Ako API pretraga ne uspe, postavlja se greška u state-u.
  const runSearch = async (q: string) => {
    setSearching(true) // prikazuje loading poruku dok traje pretraga
    try {
      // searchRooms poziva endpoint: /rooms/search?query=...
      const results = await searchRooms(q)
      setData(results) // uspešan odgovor → ažurira tabelu bez reloadovanja stranice
    } catch (e: any) {
      setError(e?.message ?? 'Pretraga nije uspela')
    } finally {
      setSearching(false)
    }
  }

  // ----------------------------
  // onSearchSubmit — submit handler forme
  // ----------------------------
  // React koristi synthetic events. preventDefault() sprečava reload stranice (default HTML ponašanje).
  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()  // zadržava stranicu i sprečava browser da pošalje formu klasičnim putem
    runSearch(query)    // pokreće pretragu sa trenutnim unosom iz state-a
  }

  // ----------------------------
  // JSX — render sloj komponente
  // ----------------------------
  // JSX je kombinacija HTML-a i JavaScript izraza. React pretvara ovo u stvarne DOM elemente.
  // Ova komponenta koristi *conditional rendering* — prikazuje različite sekcije u zavisnosti od stanja.

  return (
    <div className="bg-light min-vh-100">
      <TopBar /> {/* Uobičajena navigaciona traka koja se koristi na svim stranicama */}

      <div className="container py-4">
        {/* Naslov i forma za pretragu soba */}
        <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
          <h1 className="h4 mb-0">Smeštajne jedinice</h1>

          {/* Controlled form — input polje čija vrednost dolazi iz React state-a */}
          <form className="d-flex ms-auto" onSubmit={onSearchSubmit} role="search">
            <input
              className="form-control me-2"
              style={{ width: 260 }}
              type="search"
              placeholder="Pretraga (broj sobe, cena)"
              value={query}                             // kontrolisana vrednost inputa iz state-a
              onChange={(e) => setQuery(e.target.value)} // svaki unos u polje ažurira state
            />
            <button className="btn btn-outline-secondary" type="submit" disabled={searching}>
              {/* Dinamički tekst dugmeta u zavisnosti od stanja pretrage */}
              {searching ? 'Tražim…' : 'Traži'}
            </button>
          </form>
        </div>

        {/* Conditional rendering — prikaz poruka o grešci ili učitavanju */}
        {error && <div className="alert alert-danger">{error}</div>}
        {(loading || searching) && <div className="alert alert-info">Učitavanje…</div>}

        {/* Kada nema ni loading ni greške, prikazuje se tabela sa podacima */}
        {!loading && !error && (
          <div className="card shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 140 }}>Šifra sobe</th>
                    <th>Broj sobe</th>
                    <th>Sprat</th>
                    <th>Kategorija</th>
                    <th>Cena za noć</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Ako nema rezultata — fallback red */}
                  {data.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center text-muted p-4">
                        Nema rezultata.
                      </td>
                    </tr>
                  )}

                  {/* Map funkcija prolazi kroz sve sobe i renderuje redove tabele */}
                  {data.map((r) => (
                    <tr key={r.roomId}>
                      {/* className="text-monospace" koristi monospace font — vizuelno ističe ID */}
                      <td className="text-monospace">{r.roomId}</td>
                      <td>{r.roomNumber}</td>
                      <td>{r.floor}</td>
                      {/* Operator ?. sprečava grešku ako roomType nije definisan */}
                      <td>{r.roomType?.category}</td>
                      <td>{fmtPrice(r.roomType?.pricePerNight)}</td> {/* formatira vrednost kao EUR */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

