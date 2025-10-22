// src/App.tsx
// Ovo je glavni ulaz u React aplikaciju – ovde se konfigurišu rute, zaštita stranica i početna logika navigacije.
// Koristi se React Router v6 koji omogućava deklarativno upravljanje rutama u SPA (Single Page Application).

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RoomsPage from './pages/RoomsPage'
import GuestsPage from './pages/GuestsPage'
import ReservationsPage from './pages/ReservationsPage'
import { getToken } from './services/auth'

// Komponenta “RequireAuth” služi kao zaštitni sloj (guard) za rute.
// Svaka ruta koja zahteva autentifikaciju se obavija ovom komponentom.
// Ako korisnik nije prijavljen (nema JWT token), biće preusmeren na login stranicu.
function RequireAuth({ children }: { children: JSX.Element }) {
  const token = getToken() // čitamo token iz localStorage-a pomoću pomoćne funkcije iz auth servisa
  // Ako token ne postoji, korisnik nije prijavljen → redirektujemo ga na “/” (login stranicu)
  if (!token) return <Navigate to="/" replace />
  // Ako postoji token, vraćamo dete-komponentu (npr. ReservationsPage)
  return children
}

// Glavna aplikaciona komponenta.
// BrowserRouter omogućava da aplikacija koristi HTML5 istoriju (pushState) bez reloadovanja stranica.
// Routes sadrži sve definisane putanje (Route komponente).
export default function App() {
  return (
    // BrowserRouter mora obuhvatiti celu aplikaciju da bi routing radio ispravno.
    <BrowserRouter>
      {/* Routes je kontejner za sve rute u aplikaciji */}
      <Routes>
        {/* Login ruta – jedina koja nije zaštićena jer je javna */}
        <Route path="/" element={<LoginPage />} />

        {/* Zaštićene rute – RequireAuth proverava da li postoji token */}
        <Route
          path="/reservations"
          element={
            <RequireAuth>
              <ReservationsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/guests"
          element={
            <RequireAuth>
              <GuestsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/rooms"
          element={
            <RequireAuth>
              <RoomsPage />
            </RequireAuth>
          }
        />

        {/* Ruta “*” hvata sve nepostojeće putanje i vraća korisnika na početnu rutu */}
        <Route path="*" element={<Navigate to="/reservations" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

/*
💡 Ključni koncepti:
- <BrowserRouter> koristi HTML5 istoriju, pa aplikacija funkcioniše kao SPA bez ponovnog učitavanja stranice.
- <Routes> i <Route> definišu URL putanje i komponente koje treba prikazati.
- <Navigate> je komponenta za programatsko preusmeravanje (koristi se u RequireAuth).
- “replace” atribut znači da se trenutna ruta zamenjuje u istoriji, umesto da se dodaje nova.
- RequireAuth implementira “protected routes” obrazac — često korišćen u aplikacijama sa JWT autentifikacijom.
*/

