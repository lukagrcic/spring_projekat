// src/components/GuestInfoModal.tsx
// Modal prikazuje detalje o gostu i omogućava njihovo uređivanje.
// Koristi se na stranici “Gosti” kada korisnik klikne na dugme “Info”.

import { useEffect, useMemo, useState } from 'react'
import type { Guest, UpdateGuestRequest, City } from '../services/reservations'
import { findGuestById, updateGuest, listCities } from '../services/reservations'

type Props = {
  id: number | null
  show: boolean
  onClose: () => void
  onUpdated: () => void
}

export default function GuestInfoModal({ id, show, onClose, onUpdated }: Props) {
  // loading označava da li trenutno traje poziv ka serveru (učitavanje ili snimanje)
  const [loading, setLoading] = useState(false)
  // error se koristi da se prikaže poruka o grešci u alertu unutar modala
  const [error, setError] = useState<string | null>(null)
  // guest sadrži podatke o gostu koje dobijamo iz API-ja
  const [guest, setGuest] = useState<Guest | null>(null)
  // cities sadrži listu svih gradova, potrebnu za dropdown u formi
  const [cities, setCities] = useState<City[]>([])
  // edit označava da li su polja forme omogućena za izmenu (switch dugme na dnu)
  const [edit, setEdit] = useState(false)

  // form čuva kopiju podataka gosta koji se prikazuju u inputima.
  // U ovoj kopiji se prave izmene dok se ne klikne “Sačuvaj”.
  const [form, setForm] = useState<UpdateGuestRequest | null>(null)

  // Kada se modal otvori (show === true) i postoji id,
  // učitavaju se istovremeno detalji gosta i lista svih gradova.
  useEffect(() => {
    if (!show || id == null) return
    setEdit(false)
    setLoading(true)
    setError(null)

    ;(async () => {
      try {
        // Promise.all omogućava paralelno učitavanje podataka gosta i gradova
        const [g, cs] = await Promise.all([findGuestById(id), listCities()])

        // Debug ispis (može pomoći prilikom razvoja)
        console.log('Guest data:', g)
        console.log('Guest cityId:', g.city.cityId)
        console.log('Available cities:', cs)

        // Nakon uspešnog poziva, ažuriramo state
        setGuest(g)
        setCities(cs)

        // Inicijalizujemo formu trenutnim podacima gosta
        setForm({
          id: g.id,
          jmbg: g.jmbg,
          firstName: g.firstName,
          lastName: g.lastName,
          email: g.email,
          phoneNumber: g.phoneNumber,
          cityId: g.city.cityId ?? null, // ako nema grada, postavljamo null
        })
      } catch (e: any) {
        setError(e?.message ?? 'Neuspelo učitavanje detalja')
      } finally {
        setLoading(false)
      }
    })()
  }, [show, id])

  // onChange ažurira lokalni state forme prilikom svake promene inputa
  const onChange = (patch: Partial<UpdateGuestRequest>) => {
    setForm((f) => ({ ...(f as UpdateGuestRequest), ...(patch as any) }))
  }

  // Validacija polja — osigurava da su svi potrebni podaci uneseni pre slanja
  const validateForm = (): boolean => {
    if (!form) return false

    if (!form.jmbg.trim()) return alert('Polje "JMBG" ne sme biti prazno!'), false
    if (!form.firstName.trim()) return alert('Polje "Ime" ne sme biti prazno!'), false
    if (!form.lastName.trim()) return alert('Polje "Prezime" ne sme biti prazno!'), false
    if (!form.email.trim()) return alert('Polje "Email" ne sme biti prazno!'), false
    if (!form.phoneNumber.trim()) return alert('Polje "Telefon" ne sme biti prazno!'), false
    if (!form.cityId) return alert('Polje "Grad" ne sme biti prazno!'), false

    // Regex proverava osnovni format email adrese
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) return alert('Unesite validnu email adresu!'), false

    // JMBG mora imati tačno 13 cifara
    if (form.jmbg.length !== 13 || !/^\d+$/.test(form.jmbg))
      return alert('JMBG mora imati tačno 13 cifara!'), false

    return true
  }

  // Kreiranje <option> elemenata za dropdown gradova pomoću useMemo
  const cityOptions = useMemo(
    () => [
      <option key="empty" value="">
        Izaberi grad
      </option>,
      ...cities.map((c) => (
        <option key={c.cityId} value={c.cityId}>
          {c.cityName}
        </option>
      )),
    ],
    [cities]
  )

  // Funkcija koja šalje izmenjene podatke serveru
  const submit = async () => {
    if (!form) return
    if (!validateForm()) return

    try {
      setLoading(true)
      await updateGuest(form) // PUT /guest/update
      setEdit(false)
      onUpdated() // obaveštava roditelja da osveži listu
      onClose()
      alert('Podaci o gostu su uspešno ažurirani!')
    } catch (e: any) {
      setError(e?.message ?? 'Ažuriranje nije uspelo')
    } finally {
      setLoading(false)
    }
  }

  // Ako modal nije otvoren, ne renderujemo ništa
  if (!show) return null

  // JSX struktura modala
  return (
    <>
      {/* Poluprovidna pozadina iza modala */}
      <div className="modal-backdrop fade show"></div>

      {/* Glavni okvir modala */}
      <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true">
        <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
          <div className="modal-content">
            
            {/* Header modala sa naslovom */}
            <div className="modal-header">
              <h5 className="modal-title">Detalji gosta</h5>
            </div>

            {/* Telo modala gde se nalaze svi inputi i poruke o učitavanju */}
            <div className="modal-body">
              {/* Prikaz statusa učitavanja i grešaka */}
              {loading && <div className="alert alert-info mb-0">Učitavanje…</div>}
              {error && !loading && <div className="alert alert-danger mb-0">{error}</div>}

              {/* Glavna forma se prikazuje tek kad imamo podatke o gostu */}
              {!loading && !error && guest && form && (
                <div className="row g-3">
                  {/* Svaki <div> predstavlja jednu kolonu forme */}
                  {/* Polje JMBG – onemogućeno ako nije uključen režim “Uredi” */}
                  <div className="col-sm-6">
                    <label className="form-label">JMBG</label>
                    <input
                      className="form-control"
                      value={form.jmbg}
                      onChange={(e) => onChange({ jmbg: e.target.value })}
                      disabled={!edit}
                    />
                  </div>

                  {/* Polje Email */}
                  <div className="col-sm-6">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={form.email}
                      onChange={(e) => onChange({ email: e.target.value })}
                      disabled={!edit}
                    />
                  </div>

                  {/* Ime i Prezime */}
                  <div className="col-sm-6">
                    <label className="form-label">Ime</label>
                    <input
                      className="form-control"
                      value={form.firstName}
                      onChange={(e) => onChange({ firstName: e.target.value })}
                      disabled={!edit}
                    />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label">Prezime</label>
                    <input
                      className="form-control"
                      value={form.lastName}
                      onChange={(e) => onChange({ lastName: e.target.value })}
                      disabled={!edit}
                    />
                  </div>

                  {/* Telefon */}
                  <div className="col-sm-6">
                    <label className="form-label">Telefon</label>
                    <input
                      className="form-control"
                      value={form.phoneNumber}
                      onChange={(e) => onChange({ phoneNumber: e.target.value })}
                      disabled={!edit}
                    />
                  </div>

                  {/* Grad – dropdown koji koristi cityOptions generisan iz liste gradova */}
                  <div className="col-sm-6">
                    <label className="form-label">Grad</label>
                    <select
                      className="form-select"
                      value={form.cityId ?? ''}
                      onChange={(e) => onChange({ cityId: Number(e.target.value) })}
                      disabled={!edit}
                    >
                      {cityOptions}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Footer modala – sadrži switch za uključivanje edit moda i dugmad za akcije */}
            <div className="modal-footer">
              {/* Switch omogućava uključivanje režima uređivanja */}
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="editSwitch"
                  checked={edit}
                  onChange={(e) => setEdit(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="editSwitch">
                  Uredi
                </label>
              </div>

              {/* Dugme za zatvaranje modala */}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Zatvori
              </button>

              {/* Dugme za snimanje izmena – aktivno samo ako je edit uključen */}
              <button
                type="button"
                className="btn btn-primary"
                onClick={submit}
                disabled={!edit || loading || !form}
              >
                Sačuvaj izmene
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

