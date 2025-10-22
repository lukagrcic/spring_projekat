// src/pages/ReservationsPage.tsx
// Stranica za pregled, pretragu, detaljan prikaz i brisanje hotelskih rezervacija.
// Koristi React hook-ove (useState, useEffect), asinhrone API pozive i Bootstrap za UI.

import { useEffect, useState } from 'react'
import TopBar from '../components/TopBar'
import { listReservations, findReservationById, deleteReservationById, searchReservations } from '../services/reservations'
import type { Reservation } from '../services/reservations'
import NewReservationModal from '../components/NewReservationModal'
import ReservationInfoModal from '../components/ReservationInfoModal'

// Pomoćna funkcija za formatiranje datuma u format YYYY-MM-DD
function fmt(d: string) {
  try { return new Date(d).toISOString().slice(0, 10) } catch { return d }
}

export default function ReservationsPage() {
  // ----------------------------
  // React state — lokalno stanje komponente
  // ----------------------------
  // useState je osnovni hook u React-u koji omogućava komponenti da čuva i menja vrednosti
  // bez potrebe za klasama. Svaka promena state-a izaziva re-render komponente.

  const [data, setData] = useState<Reservation[]>([])         // lista svih rezervacija (tabela)
  const [loading, setLoading] = useState(true)                // indikator da li je API poziv u toku
  const [error, setError] = useState<string | null>(null)     // tekst greške ako poziv ne uspe

  // Kontrola prikaza modalnih prozora
  const [modalOpen, setModalOpen] = useState(false)           // prikazuje info modal
  const [createOpen, setCreateOpen] = useState(false)         // prikazuje modal za dodavanje nove rezervacije

  // Stanje koje čuva detalje o konkretnoj rezervaciji (za info modal)
  const [detail, setDetail] = useState<Reservation | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  // Parametri za pretragu
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)

  // ID rezervacije koja se trenutno briše
  const [deletingId, setDeletingId] = useState<string | number | null>(null)

  // ----------------------------
  // useEffect — efekat koji se izvršava jednom nakon mount-a
  // ----------------------------
  // Ovo je tzv. *side effect* hook — koristi se za asinhrone pozive (učitavanje podataka sa servera)
  // async IIFE (Immediately Invoked Function Expression) se koristi jer useEffect ne podržava async direktno.
  useEffect(() => {
    (async () => {
      setLoading(true)
      setError(null)
      try {
        // GET /reservations/findAll
        const res = await listReservations()
        setData(res) // kada se state postavi, React automatski re-renderuje komponentu
      } catch (e: any) {
        setError(e?.message ?? 'Neuspešno učitavanje rezervacija')
      } finally {
        setLoading(false)
      }
    })()
  }, []) // prazan dependency array znači da se efekat izvršava samo jednom (componentDidMount ekvivalent)

  // ----------------------------
  // refresh — ponovno učitavanje liste
  // ----------------------------
  // Koristi se nakon što se napravi nova rezervacija ili obriše postojeća.
  // Demonstrira “state lifting” — child komponenta (NewReservationModal) može izazvati refresh roditelja.
  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await listReservations())
    } catch (e: any) {
      setError(e?.message ?? 'Neuspešno učitavanje rezervacija')
    } finally {
      setLoading(false)
    }
  }

  // ----------------------------
  // openInfo — otvara modal sa detaljima rezervacije
  // ----------------------------
  // Ovaj obrazac koristi asinhroni poziv pre otvaranja modalnog prozora.
  // U React-u je ovo čest pattern: *lazy fetch on demand* (učitavanje podataka tek kada ih korisnik zatraži).
  const openInfo = async (id: string | number) => {
    setModalOpen(true)
    setDetail(null)
    setDetailError(null)
    setDetailLoading(true)
    try {
      // Backend koristi Long tip → ako je string, konvertujemo u broj.
      const rid = typeof id === 'string' ? Number(id) : id
      const res = await findReservationById(rid)
      setDetail(res)
    } catch (e: any) {
      setDetailError(e?.message ?? 'Neuspešno učitavanje detalja')
    } finally {
      setDetailLoading(false)
    }
  }

  // ----------------------------
  // onDelete — brisanje rezervacije
  // ----------------------------
  // Demonstrira *optimistic UI update* — ažurira se prikaz odmah po uspešnom DELETE zahtevu.
  const onDelete = async (id: string | number) => {
    const yes = window.confirm('Da li ste sigurni da želite da obrišete ovu rezervaciju?')
    if (!yes) return
    try {
      setDeletingId(id)
      await deleteReservationById(id) // DELETE /reservations/deleteById?id=...
      // Lokalno uklanjanje bez novog API poziva — performance-friendly pristup
      setData((prev) => prev.filter((r) => String(r.id) !== String(id)))
      alert('Rezervacija je uspešno obrisana!')
    } catch (e: any) {
      alert(e?.message ?? 'Brisanje nije uspelo')
    } finally {
      setDeletingId(null)
    }
  }

  // ----------------------------
  // runSearch — pretraga rezervacija
  // ----------------------------
  // Conditional logic: ako je unos prazan → prikazuje sve; inače koristi backend search endpoint.
  // Ovo pokazuje *conditional async flow* — isti pattern koji se koristi u dashboard filtrima.
  const runSearch = async (q: string) => {
    const term = q.trim()
    if (!term) {
      setSearching(true)
      try {
        const all = await listReservations()
        setData(all)
      } finally {
        setSearching(false)
      }
      return
    }

    setSearching(true)
    try {
      const res = await searchReservations(term)
      setData(res)
    } catch (e: any) {
      setError(e?.message ?? 'Pretraga nije uspela')
    } finally {
      setSearching(false)
    }
  }

  // Obrada submit događaja forme — klasičan React pattern:
  // preventDefault sprečava reload, pozivamo custom funkciju za pretragu.
  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    runSearch(query)
  }

  // ----------------------------
  // JSX render deo (UI sloj)
  // ----------------------------
  // Koristi Bootstrap klase za layout i tabele.
  // Demonstrira *conditional rendering* — prikaz loading, error ili rezultata.
  // U React-u, svaka sekcija se renderuje uslovno na osnovu state-a.

  return (
    <div className="bg-light min-vh-100">
      <TopBar />

      <div className="container py-4">
        {/* Header sekcija: naslov, pretraga i dugme za dodavanje nove rezervacije */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h1 className="h4 mb-0">Rezervacije</h1>
          <div className="ms-auto" />

          {/* Forma za pretragu rezervacija */}
          <form className="d-flex" onSubmit={onSearchSubmit} role="search">
            <input
              className="form-control me-2"
              style={{ width: 260 }}
              type="search"
              placeholder="Pretraga (gost, soba, ID…)"
              value={query}
              onChange={(e) => setQuery(e.target.value)} // ažurira stanje — controlled komponenta
            />
            <button className="btn btn-outline-secondary" type="submit" disabled={searching}>
              {searching ? 'Tražim…' : 'Traži'}
            </button>
          </form>

          {/* Dugme koje otvara modal za novu rezervaciju */}
          <button className="btn btn-primary ms-2" onClick={() => setCreateOpen(true)}>
            Nova rezervacija
          </button>
        </div>

        {/* Conditional rendering — prikaz greške ili loading statusa */}
        {error && <div className="alert alert-danger">{error}</div>}
        {loading && <div className="alert alert-info">Učitavanje…</div>}

        {/* Tabela sa podacima o rezervacijama */}
        {!loading && !error && (
          <div className="card shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 160 }}>Šifra rezervacije</th>
                    <th>Soba</th>
                    <th>Datum od</th>
                    <th>Datum do</th>
                    <th>Gost</th>
                    <th style={{ width: 100 }} className="text-end">Akcije</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Ako nema rezultata — prikazuje se fallback poruka */}
                  {data.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center text-muted p-4">
                        Nema rezervacija.
                      </td>
                    </tr>
                  )}

                  {/* Render svake rezervacije (mapiranje kroz niz) */}
                  {data.map((r) => (
                    <tr key={r.id}>
                      <td className="text-monospace">{r.id}</td>
                      <td>{r.room.roomNumber}</td>
                      <td>{fmt(r.dateFrom)}</td>
                      <td>{fmt(r.dateTo)}</td>
                      <td>{r.guest.firstName} {r.guest.lastName}</td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2 flex-nowrap">
                          {/* Dugme za prikaz detalja — koristi “lazy fetch” pattern */}
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openInfo(r.id)}
                            style={{ minWidth: 88 }}
                          >
                            Info
                          </button>

                          {/* Dugme za brisanje rezervacije — koristi optimistic update */}
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => onDelete(r.id)}
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
      {/* Modalni prozori (child komponente) */}
      {/* ---------------------------- */}

      {/* ReservationInfoModal — prikazuje detalje rezervacije.
          Demonstrira “props down” princip — roditelj prosleđuje data, loading i error vrednosti. */}
      <ReservationInfoModal
        show={modalOpen}
        onClose={() => setModalOpen(false)}
        data={detail}
        loading={detailLoading}
        error={detailError}
      />

      {/* NewReservationModal — modal za kreiranje nove rezervacije.
          Prosleđuje callback onCreated koji poziva refresh roditelja (lifting state up). */}
      <NewReservationModal
        show={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={refresh}
      />
    </div>
  )
}

