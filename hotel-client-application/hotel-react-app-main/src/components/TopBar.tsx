// src/components/TopBar.tsx
// Navigaciona traka aplikacije — prikazuje naziv, korisničko ime, dugme za odjavu i dropdown meni.
// Koristi React hook-ove (state, ref, effect), React Router navigaciju i Bootstrap layout.

import { getUsername, logout } from '../services/auth'
import { useNavigate, NavLink } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

export default function TopBar() {
  const navigate = useNavigate()                     // omogućava navigaciju unutar aplikacije kroz kod (bez <a> linkova)
  const username = getUsername()                     // dohvata ime korisnika iz localStorage-a
  const [open, setOpen] = useState(false)            // stanje koje kontroliše vidljivost dropdown menija
  const menuRef = useRef<HTMLDivElement>(null)       // referenca na div element koji obuhvata meni

  // ----------------------------
  // Odjava korisnika
  // ----------------------------
  // logout briše sve podatke o sesiji iz localStorage-a,
  // a navigate('/') vraća korisnika na login stranicu.
  const onLogout = () => {
    logout()
    navigate('/')
  }

  // ----------------------------
  // useEffect — sluša klikove van menija i zatvara dropdown
  // ----------------------------
  // Listener se postavlja jednom, pri mountovanju komponente.
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return
      // contains() proverava da li je klik bio unutar elementa na koji ref pokazuje
      if (!menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    // cleanup — uklanja listener kada se komponenta ukloni iz DOM-a
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  // ----------------------------
  // JSX — UI render
  // ----------------------------
  // Koristi Bootstrap klasu "navbar" i sticky-top za fiksiran gornji meni.
  return (
    <nav className="navbar navbar-light bg-white border-bottom sticky-top">
      <div className="container d-flex align-items-center">
        {/* Leva strana — naziv aplikacije */}
        <span className="navbar-brand mb-0 h1">Hotel • Frontdesk</span>

        {/* Desna strana — korisničke kontrole */}
        <div className="d-flex align-items-center gap-2">

          {/* Prikazuje trenutno prijavljenog korisnika */}
          <span className="text-muted small">{username}</span>

          {/* Dugme za odjavu — poziva funkciju onLogout */}
          {/* Ovde koristimo onClick događaj da reagujemo bez potrebe za klasičnim <form> submitom */}
          <button className="btn btn-outline-secondary btn-sm" onClick={onLogout}>
            Logout
          </button>

          {/* Dropdown meni — sadrži linkove ka ostalim stranicama */}
          <div className="position-relative" ref={menuRef}>
            {/* Dugme sa tri linije — vizuelni indikator koji otvara/zatvara dropdown meni */}
            <button
              className="btn btn-outline-secondary btn-sm"
              aria-expanded={open}           // ARIA atribut za čitače ekrana (da znaju da li je meni otvoren)
              aria-haspopup="menu"
              onClick={() => setOpen((v) => !v)}  // koristi funkcionalni update jer novi state zavisi od starog
            >
              {/* Dugme se sastoji od tri male linije kreirane pomoću <span> elemenata i inline stilova */}
              <span className="d-inline-block" style={{ width: 18 }}>
                <span style={{ display: 'block', height: 2, background: 'currentColor', margin: '3px 0' }} />
                <span style={{ display: 'block', height: 2, background: 'currentColor', margin: '3px 0' }} />
                <span style={{ display: 'block', height: 2, background: 'currentColor', margin: '3px 0' }} />
              </span>
            </button>

            {/* Conditional rendering — dropdown se prikazuje samo ako je open === true */}
            {open && (
              <div
                className="dropdown-menu show end-0 mt-2 p-0 shadow"
                style={{ display: 'block', minWidth: 220 }}
              >
                {/* NavLink automatski dodaje klasu “active” ako se putanja poklapa sa trenutnom rutom */}
                {/* className može biti funkcija koja prima objekat sa isActive svojstvom */}
                {/* Nakon klika na bilo koji link, meni se zatvara pomoću setOpen(false) */}
                <NavLink
                  to="/reservations"
                  className={({ isActive }) =>
                    `dropdown-item${isActive ? ' active' : ''}`
                  }
                  onClick={() => setOpen(false)}
                >
                  Rezervacije
                </NavLink>

                <NavLink
                  to="/guests"
                  className={({ isActive }) =>
                    `dropdown-item${isActive ? ' active' : ''}`
                  }
                  onClick={() => setOpen(false)}
                >
                  Gosti
                </NavLink>

                <NavLink
                  to="/rooms"
                  className={({ isActive }) =>
                    `dropdown-item${isActive ? ' active' : ''}`
                  }
                  onClick={() => setOpen(false)}
                >
                  Smeštajne jedinice
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}


