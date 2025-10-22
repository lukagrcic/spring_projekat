// src/components/ReservationInfoModal.tsx
// Modalni prozor koji prikazuje detalje konkretne rezervacije.
// Koristi Bootstrap modal strukturu i React useEffect za kontrolu scroll-a pozadine.

import { useEffect, useRef } from 'react'
import type { Reservation } from '../services/reservations'

// Tipizacija props-a — koristi TypeScript interface-like strukturu
// show: da li je modal vidljiv, onClose: callback za zatvaranje,
// data: objekat sa detaljima rezervacije, loading/error: indikatori stanja.
type Props = {
  show: boolean
  onClose: () => void
  data: Reservation | null
  loading?: boolean
  error?: string | null
}

export default function ReservationInfoModal({ show, onClose, data, loading, error }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null) // čuva referencu na <div> dialog radi pristupa DOM-u

  // ----------------------------
  // useEffect — zaključava scroll pozadine dok je modal otvoren
  // ----------------------------
  // Ovaj efekat menja CSS overflow svojstvo body-ja.
  // Kad je modal otvoren (show === true), scroll pozadina se onemogućava.
  // Cleanup funkcija vraća prethodno stanje scrolla kada se modal zatvori.
  useEffect(() => {
    if (show) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [show]) // efekat se aktivira svaki put kad se show promeni

  // Ako modal nije aktivan → ne renderuje se uopšte.
  // Ovo smanjuje nepotrebne elemente u DOM-u.
  if (!show) return null

  // ----------------------------
  // JSX — struktura modalnog prozora
  // ----------------------------
  // Bootstrap modal koristi "backdrop" sloj i "modal-dialog" element u centru ekrana.
  return (
    <>
      {/* Backdrop — poluprovidni sloj iza modala koji onemogućava interakciju sa pozadinom */}
      <div className="modal-backdrop fade show"></div>

      {/* Glavni modalni kontejner */}
      <div
        className="modal fade show d-block"  // "d-block" zadržava vidljivost bez JavaScript animacija Bootstrap-a
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal dialog — centriran kontejner unutar Bootstrap strukture */}
        <div className="modal-dialog modal-dialog-centered" role="document" ref={dialogRef}>
          <div className="modal-content">

            {/* Header modala — naslov + dugme za zatvaranje */}
            <div className="modal-header">
              <h5 className="modal-title">Detalji rezervacije</h5>
              {/* Dugme koristi onClick callback (zatvaranje modala bez re-renderovanja roditelja) */}
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
            </div>

            {/* Telo modala — glavni sadržaj se menja u zavisnosti od stanja */}
            <div className="modal-body">
              {/* Conditional rendering — prikazuje se samo jedan od sledećih blokova */}
              {loading && <div className="alert alert-info mb-0">Učitavanje…</div>} 
              {/* Ako postoji greška, prikazuje se crveni alert */}
              {error && !loading && <div className="alert alert-danger mb-0">{error}</div>}

              {/* Ako nema greške ni učitavanja, prikazuju se podaci o rezervaciji */}
              {!loading && !error && data && (
                <div className="table-responsive">
                  {/* Mala tabela — koristi Bootstrap klasu table-sm za kompaktniji prikaz */}
                  <table className="table table-sm">
                    <tbody>
                      {/* Svaki red prikazuje jedno svojstvo rezervacije */}
                      <tr>
                        <th style={{ width: 200 }}>Šifra (ID)</th>
                        <td>{data.id}</td>
                      </tr>
                      <tr>
                        <th>Soba</th>
                        <td>{data.room.roomNumber}</td>
                      </tr>
                      <tr>
                        <th>Datum od</th>
                        {/* fmtDate formatira ISO string u čitljiv datum */}
                        <td>{fmtDate(data.dateFrom)}</td>
                      </tr>
                      <tr>
                        <th>Datum do</th>
                        <td>{fmtDate(data.dateTo)}</td>
                      </tr>
                      <tr>
                        <th>Gost</th>
                        {/* Kombinuje ime i prezime iz ugnježdenog objekta guest */}
                        <td>{data.guest.firstName} {data.guest.lastName}</td>
                      </tr>
                      <tr>
                        <th>Doručak uključen</th>
                        {/* Logička vrednost prikazana kao "Da" ili "Ne" */}
                        <td>{data.breakfastIncluded ? 'Da' : 'Ne'}</td>
                      </tr>
                      <tr>
                        <th>Ukupna cena</th>
                        {/* fmtPrice formatira broj kao valutu */}
                        <td>{fmtPrice(data.totalPrice)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer modala — sadrži samo dugme za zatvaranje */}
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Zatvori
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ----------------------------
// Pomoćne funkcije za formatiranje datuma i cene
// ----------------------------
// fmtDate pretvara string (ISO format) u kraći format "YYYY-MM-DD".
function fmtDate(d: string) {
  try { return new Date(d).toISOString().slice(0, 10) } catch { return d }
}

// fmtPrice koristi Intl.NumberFormat da prikaže broj u lokalnom formatu valute (EUR).
function fmtPrice(n: number) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'EUR',
    }).format(n)
  } catch {
    return String(n)
  }
}

