// src/components/NewReservationModal.tsx
// Modal za KREIRANJE nove rezervacije.

import { getUserId } from '../services/auth'
import { useEffect, useMemo, useState } from 'react'
import { searchGuests, searchRooms, saveReservation } from '../services/reservations'
import type { Guest, Room, SaveReservationRequest } from '../services/reservations'

// Props: kontrola vidljivosti i callback-ovi za zatvaranje i osvežavanje roditelja
type Props = {
  show: boolean
  onClose: () => void
  onCreated: () => void // roditelj osvežava listu nakon uspešnog snimanja
}

export default function NewReservationModal({ show, onClose, onCreated }: Props) {
  // Dva para query/results + selected entitet, jer korisnik bira i GOSTA i SOBU.
  const [guestQuery, setGuestQuery] = useState('')
  const [guestResults, setGuestResults] = useState<Guest[]>([])
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)

  const [roomQuery, setRoomQuery] = useState('')
  const [roomResults, setRoomResults] = useState<Room[]>([])
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

  // Datumi kao ISO stringovi (HTML date input vraća "YYYY-MM-DD").
  const [dateFrom, setDateFrom] = useState('') // YYYY-MM-DD
  const [dateTo, setDateTo] = useState('')
  const [breakfastIncluded, setBreakfastIncluded] = useState(false)
  const [note, setNote] = useState('')

  // UI statusi: slanje forme i prikaz greške
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Kada se modal zatvori (show pređe na false), vraćamo sve u početno stanje.
  // Time se izbegava curenje prethodnih vrednosti pri sledećem otvaranju.
  useEffect(() => {
    if (show) return // reset sledi SAMO kad prelazimo iz otvorenog u zatvoren modal
    setGuestQuery(''); setGuestResults([]); setSelectedGuest(null)
    setRoomQuery(''); setRoomResults([]); setSelectedRoom(null)
    setDateFrom(''); setDateTo(''); setBreakfastIncluded(false); setNote('')
    setError(null); setSubmitting(false)
  }, [show])

  // Ideja: ne gađaj server na svako slovo. Sačekaj 350 ms nakon poslednjeg unosa pa pozovi API.
  // Ako korisnik nastavi da kuca pre isteka 350 ms → prethodni timeout se čisti (clearTimeout).
  useEffect(() => {
    if (!show) return // nema pretrage dok modal nije otvoren
    const id = setTimeout(async () => {
      // Minimalna dužina upita za gosta: 2, da se izbegnu suviše široke pretrage.
      if (guestQuery.trim().length < 2) { setGuestResults([]); return }
      try {
        // Koristimo trenutnu vrednost guestQuery iz zatvorenog scope-a
        // jer je to snapshot u času kreiranja timeout-a (debounce pattern).
        setGuestResults(await searchGuests(guestQuery))
      } catch (e: any) {
        // Grešku prijavljujemo korisniku; ne bacamo dalje jer je UX važniji.
        setError(e?.message ?? 'Greška pri pretrazi gostiju')
      }
    }, 350)
    return () => clearTimeout(id) // ključ debouncing-a: otkaži prethodni tajmer ako se query brzo menja
  }, [guestQuery, show])

  // Ista logika kao za goste. Minimalna dužina 1 je ok jer broj sobe može biti 1 cifra.
  useEffect(() => {
    if (!show) return
    const id = setTimeout(async () => {
      if (roomQuery.trim().length < 1) { setRoomResults([]); return }
      try {
        setRoomResults(await searchRooms(roomQuery))
      } catch (e: any) {
        setError(e?.message ?? 'Greška pri pretrazi soba')
      }
    }, 350)
    return () => clearTimeout(id)
  }, [roomQuery, show])

  // ---------- OBRAČUN NOĆENJA ----------
  // useMemo sprečava nepotrebna računanja na svaki render.
  // Račun: razlika u danima, uz zaštitu od negativnih vrednosti (npr. ako je dateTo pre dateFrom).
  const nights = useMemo(() => {
    if (!dateFrom || !dateTo) return 0
    // Dodajemo T00:00:00 da eliminisemo probleme sa vremenskom zonom pri new Date('YYYY-MM-DD').
    const start = new Date(dateFrom + 'T00:00:00')
    const end = new Date(dateTo + 'T00:00:00')
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    // Math.floor: 2.9 dana je 2 noći. Negativno → 0 (nevalidan opseg).
    return diff > 0 ? Math.floor(diff) : 0
  }, [dateFrom, dateTo])

  // Napomena: pricePerNight može doći kao string iz backend-a; ovde ga ne parsiramo agresivno
  // jer fmtPrice prikaz rešava formatiranje. Za total koristimo aritmetiku tipova
  // koja u JS pretvara string u broj ako je numeričan, ili daje NaN ako nije.
  const pricePerNight = selectedRoom?.roomType?.pricePerNight ?? 0

  // ---------- OBRAČUN UKUPNE CENE ----------
  // Ako je pricePerNight string "120", nights * pricePerNight u JS daje broj 120 * 3 = 360.
  // Ako je npr. "120 EUR", rezultat bi bio NaN — UI će to videti kroz fmtPrice.
  const totalPrice = useMemo(() => (nights * pricePerNight), [nights, pricePerNight])

  // ---------- VALIDACIJA pre slanja ----------
  // Mora postojati izabran gost i soba, oba datuma, i nights > 0.
  // Ovim izbegavamo slanje nepotpunih podataka i nepotreban round-trip do servera.
  const canSubmit = !!(selectedGuest && selectedRoom && dateFrom && dateTo && nights > 0)

  // ---------- SUBMIT: formiranje payload-a i POST ----------
  // 1) Zaključamo UI (submitting = true), 
  // 2) pročistimo prethodne greške,
  // 3) sastavimo DTO (SaveReservationRequest), 
  // 4) pozovemo saveReservation,
  // 5) po uspehu zatvorimo modal i javimo roditelju da osveži listu.
  const submit = async () => {
    if (!canSubmit) return // dodatna zaštita, iako je dugme disable-ovano
    setSubmitting(true)
    setError(null)

    // Uzimamo ID trenutno prijavljenog korisnika (zaposlenog) iz localStorage-a.
    // Ovaj ID backend koristi kao "employeeId" koji je kreirao rezervaciju.
    const employeeIdValue = getUserId()

    // SelectedGuest i selectedRoom su ovde definisani jer canSubmit to garantuje.
    // TypeScript non-null assertion (!) je bezbedan u ovom grananju.
    const payload: SaveReservationRequest = {
      dateFrom,
      dateTo,
      breakfastIncluded,
      note,
      employeeId: employeeIdValue, 
      guestId: selectedGuest!.id,
      roomId: selectedRoom!.roomId,
    }

    try {
      await saveReservation(payload) // POST /reservations/save
      alert('Rezervacija je sačuvana!')
      onClose()    // zatvori modal odmah po uspehu
      onCreated()  // signal roditelju da re-fetchuje listu
    } catch (e: any) {
      // Prikazujemo korisničku poruku. Ne gasimo modal automatski da korisnik vidi poruku.
      setError(e?.message ?? 'Snimanje nije uspelo')
    } finally {
      setSubmitting(false) // uvek otključaj dugme
    }
  }

  // Ne renderuj modalni DOM uopšte dok je zatvoren — performanse i čist DOM.
  if (!show) return null

  // ---------- JSX: UI struktura i interakcije ----------
  return (
    <>
      {/* Backdrop: poluprovidni sloj koji onemogućava klik na pozadinu i vizuelno fokusira modal. */}
      <div className="modal-backdrop fade show"></div>

      <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true">
        <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
          <div className="modal-content">
            {/* HEADER: naslov + dugme za zatvaranje; onClick zove roditeljski onClose bez side efekata. */}
            <div className="modal-header">
              <h5 className="modal-title">Nova rezervacija</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              {/* Globalna greška iz submit-a ili pretraga; prikazuje se iznad forme. */}
              {error && <div className="alert alert-danger">{error}</div>}

              {/* ---------- GOST: pretraga + izbor iz liste ---------- */}
              {/* position-relative omogućava da lista rezultata (.list-group) apsolutno legne ispod inputa. */}
              <div className="mb-3 position-relative">
                <label className="form-label">Gost</label>
                <input
                  className="form-control"
                  placeholder="Pretraga gosta (ime, prezime, JMBG, telefon...)"
                  // Ako je izabran gost, prikazujemo "sastavljen" string umesto query-ja.
                  // Ovo je UX obrazac: input se ponaša kao "display" dok je izbor aktivan.
                  value={selectedGuest
                    ? `${selectedGuest.firstName} ${selectedGuest.lastName} — ${selectedGuest.jmbg}`
                    : guestQuery}
                  // Na svaki unos rušimo izbor i tretiramo polje kao pretragu.
                  onChange={(e) => { setSelectedGuest(null); setGuestQuery(e.target.value) }}
                />
                {/* Dinamička padajuća lista rezultata.
                   Zatvara se čim korisnik odabere gosta (postavljamo selectedGuest). */}
                {!selectedGuest && guestResults.length > 0 && (
                  <div className="list-group position-absolute w-100 z-3 shadow">
                    {guestResults.map(g => (
                      <button
                        key={g.id}
                        type="button"
                        className="list-group-item list-group-item-action"
                        onClick={() => setSelectedGuest(g)} // klik → fiksiramo izbor; query više nije relevantan
                      >
                        <div className="fw-semibold">{g.firstName} {g.lastName}</div>
                        <div className="small text-muted">
                          JMBG: {g.jmbg} • {g.email} • {g.phoneNumber}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {/* Informativna poruka nakon izbora, korisniku jasno da sistem "pamti" izbor. */}
                {selectedGuest && (
                  <div className="form-text">
                    Izabran: {selectedGuest.firstName} {selectedGuest.lastName} (ID: {selectedGuest.id})
                  </div>
                )}
              </div>

              {/* ---------- SOBA: pretraga + izbor ---------- */}
              {/* Identican UX kao za goste. Dodatno prikazujemo cenu/noć u listi. */}
              <div className="mb-3 position-relative">
                <label className="form-label">Soba</label>
                <input
                  className="form-control"
                  placeholder="Pretraga sobe (broj, sprat, tip...)"
                  value={selectedRoom
                    ? `Soba ${selectedRoom.roomNumber} (sprat ${selectedRoom.floor}) — ${selectedRoom.roomType?.category}`
                    : roomQuery}
                  onChange={(e) => { setSelectedRoom(null); setRoomQuery(e.target.value) }}
                />
                {!selectedRoom && roomResults.length > 0 && (
                  <div className="list-group position-absolute w-100 z-3 shadow">
                    {roomResults.map(r => (
                      <button
                        key={r.roomId}
                        type="button"
                        className="list-group-item list-group-item-action"
                        onClick={() => setSelectedRoom(r)}
                      >
                        <div className="fw-semibold">
                          Soba {r.roomNumber} — {r.roomType?.category /* optional chaining štiti od undefined */}
                        </div>
                        <div className="small text-muted">
                          {/* Tooltip-like informacije: sprat, status i cena/noć */}
                          Sprat {r.floor} • Status: {r.status} • {fmtPrice(r.roomType?.pricePerNight ?? 0)}/noć
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {selectedRoom && (
                  <div className="form-text">
                    Izabrana: soba {selectedRoom.roomNumber} (ID: {selectedRoom.roomId}), {selectedRoom.roomType?.category}
                  </div>
                )}
              </div>

              {/* ---------- DATUMI: controlled inputs ---------- */}
              {/* Controlled pattern: input value dolazi iz state-a, onChange ažurira state.
                 Zbog toga UI uvek odražava tačno stanje aplikacije. */}
              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <label className="form-label">Datum od</label>
                  <input type="date" className="form-control" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </div>
                <div className="col-sm-6">
                  <label className="form-label">Datum do</label>
                  <input type="date" className="form-control" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </div>
              </div>

              {/* ---------- OPCIJE + NAPOMENA ---------- */}
              <div className="form-check mb-3">
                {/* Checkbox je takođe controlled: checked je iz state-a, a onChange menja state. */}
                <input
                  id="brk"
                  className="form-check-input"
                  type="checkbox"
                  checked={breakfastIncluded}
                  onChange={(e) => setBreakfastIncluded(e.target.checked)}
                />
                <label htmlFor="brk" className="form-check-label">Doručak uključen</label>
              </div>

              <div className="mb-3">
                <label className="form-label">Napomena</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              {/* ---------- REZIME CENE: noćenja * cena/noć ---------- */}
              {/* Ovaj blok je "read-only" pregled pre slanja — skraćuje povratne iteracije s korisnikom. */}
              <div className="alert alert-secondary d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-semibold">Noćenja: {nights}</div>
                  <div className="small text-muted">Cena po noći: {fmtPrice(pricePerNight)}</div>
                </div>
                <div className="fs-5 fw-bold">Ukupno: {fmtPrice(totalPrice)}</div>
              </div>
            </div>

            {/* FOOTER: kontrolna dugmad.
               Disabled stanja sprečavaju dvostruko slanje i slanje nevalidne forme. */}
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
                Otkaži
              </button>
              <button type="button" className="btn btn-primary" onClick={submit} disabled={!canSubmit || submitting}>
                {submitting ? 'Čuvam…' : 'Sačuvaj'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Pomoćna funkcija: formatiranje valute (EUR). Bez promene logike prikaza.
function fmtPrice(n: number) {
  try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(n) } catch { return String(n) }
}


