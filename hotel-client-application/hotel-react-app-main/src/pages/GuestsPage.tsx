// src/pages/GuestsPage.tsx
// Stranica za prikaz, pretragu, dodavanje i brisanje gostiju.

import { useEffect, useState } from 'react'
import TopBar from '../components/TopBar'
import type { Guest } from '../services/reservations'
import { listGuests, searchGuests, deleteGuestById } from '../services/reservations'
import NewGuestModal from '../components/NewGuestModal'
import GuestInfoModal from '../components/GuestInfoModal'

export default function GuestsPage() {
  // ----------------------------
  // React state (lokalno stanje komponente)
  // ----------------------------
  const [data, setData] = useState<Guest[]>([])                  // lista gostiju prikazana u tabeli
  const [loading, setLoading] = useState(true)                   // indikator inicijalnog učitavanja
  const [error, setError] = useState<string | null>(null)        // poruka o grešci
  const [query, setQuery] = useState('')                         // tekst za pretragu
  const [searching, setSearching] = useState(false)              // indikator aktivne pretrage
  const [createOpen, setCreateOpen] = useState(false)            // kontrola modala za novog gosta
  const [openId, setOpenId] = useState<number | null>(null)      // ID gosta koji je otvoren u info modalu
  const [deletingId, setDeletingId] = useState<string | number | null>(null) // ID gosta koji se trenutno briše

  // ----------------------------
  // refreshList — dinamičko učitavanje gostiju
  // ----------------------------
  // Ova pomoćna funkcija učitava listu gostiju.
  // Ako je "term" prazan → dohvata sve; inače koristi endpoint za pretragu.
  const refreshList = async (term: string) => {
    setSearching(true)
    setError(null)
    try {
      const t = term.trim() // uklanja prazne razmake iz pretrage
      if (!t) {
        // Ako nema pretrage — GET /guests/findAll
        setData(await listGuests())
      } else {
        // Ako postoji upit — GET /guests/search?query=...
        setData(await searchGuests(t))
      }
    } catch (e: any) {
      // hvata potencijalnu grešku (npr. mrežnu ili backend)
      setError(e?.message ?? 'Učitavanje nije uspelo')
    } finally {
      setSearching(false)
    }
  }

  // ----------------------------
  // useEffect — učitavanje podataka pri prvom renderu
  // ----------------------------
  // useEffect se izvršava samo jednom (prazan dependency array [])
  // async IIFE (Immediately Invoked Function Expression) jer useEffect ne može biti direktno async.
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        // Inicijalno učitavanje svih gostiju
        setData(await listGuests())
      } catch (e: any) {
        setError(e?.message ?? 'Neuspešno učitavanje gostiju')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // ----------------------------
  // Brisanje gosta
  // ----------------------------
  // Traži potvrdu korisnika, poziva backend, a zatim ažurira lokalni state.
  const onDelete = async (id: string | number) => {
    const yes = window.confirm(
      'Da li ste sigurni da želite da obrišete ovog gosta? (brisanje nece biti moguce ako postoje rezervacije vezane za njega)'
    )
    if (!yes) return
    try {
      setDeletingId(id) // koristi se za disable stanja ako bi se naknadno dodalo
      await deleteGuestById(id) // HTTP DELETE /guests/deleteById?id=...
      // Lokalno uklanjamo obrisanog gosta iz prikazane liste bez ponovnog API poziva
      setData((prev) => prev.filter((r) => String(r.id) !== String(id)))
      alert('Gost je uspešno obrisan!')
    } catch (e: any) {
      alert(e?.message ?? 'Brisanje nije uspelo')
    } finally {
      setDeletingId(null)
    }
  }

  // ----------------------------
  // Obrada pretrage
  // ----------------------------
  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()     // sprečava reload stranice
    refreshList(query)     // poziva helper koji pretražuje goste
  }

  // ----------------------------
  // JSX render deo
  // ----------------------------
  // Korišćen je Bootstrap za izgled i layout.
  // Conditional rendering se koristi za prikaz loading/error stanja.

  return (
    <div className="bg-light min-vh-100">
      <TopBar />

      <div className="container py-4">
        {/* Gornji deo — naslov, pretraga, dugme Novi gost */}
        <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
          <h1 className="h4 mb-0">Gosti</h1>

          {/* Forma za pretragu */}
          <form className="d-flex ms-auto" onSubmit={onSearchSubmit} role="search">
            <input
              className="form-control me-2"
              style={{ width: 260 }}
              type="search"
              placeholder="Pretraga (ime, prezime, JMBG)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}  // ažurira tekst pretrage
            />
            <button className="btn btn-outline-secondary" type="submit" disabled={searching}>
              {searching ? 'Tražim…' : 'Traži'}
            </button>
          </form>

          {/* Dugme za otvaranje modala za kreiranje novog gosta */}
          <button className="btn btn-primary ms-2" onClick={() => setCreateOpen(true)}>
            Novi gost
          </button>
        </div>

        {/* Error i loading indikatori */}
        {error && <div className="alert alert-danger">{error}</div>}
        {(loading || searching) && <div className="alert alert-info">Učitavanje…</div>}

        {/* Tabela sa podacima */}
        {!loading && !error && (
          <div className="card shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 140 }}>Šifra gosta</th>
                    <th>JMBG</th>
                    <th>Ime</th>
                    <th>Prezime</th>
                    <th>Email</th>
                    <th>Telefon</th>
                    <th style={{ width: 120 }} className="text-end">Akcije</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Ako nema rezultata — prikazuje se prazna poruka */}
                  {data.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center text-muted p-4">Nema rezultata.</td>
                    </tr>
                  )}

                  {/* Render svake stavke (reda) iz niza data */}
                  {data.map((g) => (
                    <tr key={g.id}>
                      <td className="text-monospace">{g.id}</td>
                      <td>{g.jmbg}</td>
                      <td>{g.firstName}</td>
                      <td>{g.lastName}</td>
                      <td>{g.email}</td>
                      <td>{g.phoneNumber}</td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2 flex-nowrap">
                          {/* Dugme otvara modal sa detaljima gosta */}
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setOpenId(g.id)}
                            style={{ minWidth: 88 }}
                          >
                            Info
                          </button>

                          {/* Dugme pokreće brisanje gosta */}
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => onDelete(g.id)}
                            style={{ minWidth: 88 }}
                          >
                            Obriši
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ---------------------------- */}
      {/* Modali (dijalozi)             */}
      {/* ---------------------------- */}

      {/* GuestInfoModal prikazuje informacije o gostu.
          onUpdated → automatski osvežava listu ako je gost izmenjen. */}
      <GuestInfoModal
        id={openId}
        show={openId != null}
        onClose={() => setOpenId(null)}
        onUpdated={() => refreshList(query)}
      />

      {/* Modal za kreiranje novog gosta.
          Nakon uspešnog kreiranja → refreshuje prikaz liste. */}
      <NewGuestModal
        show={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => refreshList(query)}
      />
    </div>
  )
}

