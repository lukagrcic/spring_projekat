// src/components/NewGuestModal.tsx
// Modal koji omogućava dodavanje novog gosta u sistem.
// Radi kao zasebna, kontrolisana forma koja se prikazuje kada korisnik klikne "Novi gost" na glavnoj stranici.

import { useEffect, useMemo, useState } from 'react'
import { saveGuest, listCities } from '../services/reservations'
import type { SaveGuestRequest, City } from '../services/reservations'

// Komponenta prima props show/onClose/onCreated.
// - show kontroliše vidljivost modala
// - onClose zatvara modal
// - onCreated obaveštava roditeljsku komponentu da se lista gostiju osveži
type Props = {
  show: boolean
  onClose: () => void
  onCreated: () => void
}

export default function NewGuestModal({ show, onClose, onCreated }: Props) {
  // Čuva listu gradova koju učitavamo iz baze da bi se prikazala u <select> elementu
  const [cities, setCities] = useState<City[]>([])
  // loading označava da li je u toku API zahtev (učitavanje gradova ili snimanje gosta)
  const [loading, setLoading] = useState(false)
  // error sadrži tekst greške koji se prikazuje korisniku ako API padne
  const [error, setError] = useState<string | null>(null)

  // State za formu – svaki input u formi ažurira neko od ovih polja.
  // cityId se popunjava automatski nakon što se učitaju gradovi.
  const [form, setForm] = useState<SaveGuestRequest>({
    jmbg: '', firstName: '', lastName: '', email: '', phoneNumber: '', cityId: 0,
  })

  // Kad se modal otvori (show === true), pozivamo listCities() da učitamo sve gradove.
  // Ako lista gradova uspešno stigne, prvi grad se automatski postavlja kao podrazumevani izbor.
  useEffect(() => {
    if (!show) return // ako je modal zatvoren, ne radimo ništa

    setError(null)
    setLoading(true)

    ;(async () => {
      try {
        const cs = await listCities() // GET /cities/findAll
        setCities(cs)
        // Ako API vrati listu, automatski postavi prvi grad kao izabrani
        setForm((f) => ({ ...f, cityId: cs[0]?.cityId ?? 0 }))
      } catch (e: any) {
        // Ako poziv padne, ispiši poruku greške u alert unutar modala
        setError(e?.message ?? 'Neuspešno učitavanje gradova')
      } finally {
        setLoading(false)
      }
    })()
  }, [show])

  // Pomoćna funkcija za ažuriranje stanja forme.
  // Ovaj pristup (patch objekat) omogućava da menjamo samo jedno polje bez prepisivanja cele forme.
  const onChange = (patch: Partial<SaveGuestRequest>) =>
    setForm((f) => ({ ...f, ...patch }))

  // Validacija forme pre slanja. Koristi alert() umesto inline poruka radi jednostavnosti.
  const validateForm = (): boolean => {
    if (!form) {
      alert('Forma nije inicijalizovana!')
      return false
    }

    // Proveravamo da nijedno obavezno polje nije prazno.
    if (!form.jmbg.trim()) { alert('Polje "JMBG" ne sme biti prazno!'); return false }
    if (!form.firstName.trim()) { alert('Polje "Ime" ne sme biti prazno!'); return false }
    if (!form.lastName.trim()) { alert('Polje "Prezime" ne sme biti prazno!'); return false }
    if (!form.email.trim()) { alert('Polje "Email" ne sme biti prazno!'); return false }
    if (!form.phoneNumber.trim()) { alert('Polje "Telefon" ne sme biti prazno!'); return false }
    if (!form.cityId) { alert('Polje "Grad" ne sme biti prazno!'); return false }

    // Email mora biti u validnom formatu (regex proverava osnovnu strukturu)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      alert('Unesite validnu email adresu!')
      return false
    }

    // JMBG mora imati tačno 13 cifara i sadržati samo brojeve
    if (form.jmbg.length !== 13 || !/^\d+$/.test(form.jmbg)) {
      alert('JMBG mora imati tačno 13 cifara!')
      return false
    }

    return true
  }

  // Memoizovana logika koja proverava da li su sva obavezna polja popunjena.
  // Ako nisu, dugme "Sačuvaj" će biti onemogućeno.
  const canSubmit = useMemo(() => {
    return (
      form.jmbg.trim().length > 0 &&
      form.firstName.trim().length > 0 &&
      form.lastName.trim().length > 0 &&
      form.email.trim().length > 0 &&
      form.phoneNumber.trim().length > 0 &&
      !!form.cityId
    )
  }, [form])

  // Poziva se kada korisnik klikne na dugme “Sačuvaj”.
  // Radi sledeće korake: validira, šalje podatke serveru, prikazuje poruku i zatvara modal.
  const submit = async () => {
    // Dodatna provera – ako nisu popunjena sva polja, prekini
    if (!canSubmit) return
    // Validacija forme (npr. format email-a, broj cifara JMBG-a)
    if (!validateForm()) return

    try {
      setLoading(true)
      setError(null)
      await saveGuest(form) // POST /guests/save

      // Ako zahtev prođe, obaveštavamo korisnika alertom
      alert('Gost je uspešno sačuvan!')

      // Zatvaramo modal i obaveštavamo roditelja da se lista osveži
      onClose()
      onCreated()
    } catch (e: any) {
      // Ako se desi greška (npr. backend vrati 400 ili 500), prikazujemo poruku
      setError(e?.message ?? 'Snimanje gosta nije uspelo')
    } finally {
      setLoading(false)
    }
  }

  // Ako modal nije otvoren, ništa ne renderujemo
  if (!show) return null

  // JSX: struktura Bootstrap modala sa formom za unos podataka
  return (
    <>
      {/* Tamni sloj iza modala */}
      <div className="modal-backdrop fade show"></div>

      {/* Glavni modalni prozor */}
      <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true">
        <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
          <div className="modal-content">
            {/* Gornji deo modala sa naslovom i dugmetom za zatvaranje */}
            <div className="modal-header">
              <h5 className="modal-title">Novi gost</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
            </div>

            {/* Srednji deo – forma za unos podataka */}
            <div className="modal-body">
              {/* Ako postoji tekst greške iz API poziva, prikazujemo ga kao alert */}
              {error && <div className="alert alert-danger">{error}</div>}

              {/* Forma koristi Bootstrap grid sistem, dva inputa po redu */}
              <div className="row g-3">
                {/* Svako polje je controlled input – vrednost dolazi iz state-a, promene idu kroz onChange */}
                <div className="col-sm-6">
                  <label className="form-label">JMBG</label>
                  <input
                    className="form-control"
                    value={form.jmbg}
                    onChange={(e) => onChange({ jmbg: e.target.value })}
                  />
                </div>

                <div className="col-sm-6">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={(e) => onChange({ email: e.target.value })}
                  />
                </div>

                <div className="col-sm-6">
                  <label className="form-label">Ime</label>
                  <input
                    className="form-control"
                    value={form.firstName}
                    onChange={(e) => onChange({ firstName: e.target.value })}
                  />
                </div>

                <div className="col-sm-6">
                  <label className="form-label">Prezime</label>
                  <input
                    className="form-control"
                    value={form.lastName}
                    onChange={(e) => onChange({ lastName: e.target.value })}
                  />
                </div>

                <div className="col-sm-6">
                  <label className="form-label">Telefon</label>
                  <input
                    className="form-control"
                    value={form.phoneNumber}
                    onChange={(e) => onChange({ phoneNumber: e.target.value })}
                  />
                </div>

                {/* Dropdown koji prikazuje listu gradova učitanu sa servera */}
                <div className="col-sm-6">
                  <label className="form-label">Grad</label>
                  <select
                    className="form-select"
                    value={form.cityId}
                    onChange={(e) => onChange({ cityId: Number(e.target.value) })}
                  >
                    {cities.map(c => (
                      <option key={c.cityId} value={c.cityId}>
                        {c.cityName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Donji deo – dugmad za otkazivanje i čuvanje */}
            <div className="modal-footer">
              {/* Dugme za otkazivanje samo zatvara modal, ali je blokirano dok traje API zahtev */}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Otkaži
              </button>

              {/* Dugme za snimanje poziva submit() i blokirano je ako forma nije validna */}
              <button
                type="button"
                className="btn btn-primary"
                onClick={submit}
                disabled={!canSubmit || loading}
              >
                {loading ? 'Čuvam…' : 'Sačuvaj'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

