// src/main.tsx
// Ovo je entry point React aplikacije — ovde se sve pokreće.
// Ovaj fajl povezuje React aplikaciju sa realnim DOM stablom u browseru.
// Sve što React prikazuje na ekranu, zapravo se renderuje u HTML element sa id-jem "root".

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import 'bootstrap/dist/css/bootstrap.min.css' // uvoz Bootstrap CSS-a da bi stilovi bili dostupni svuda u aplikaciji

// ReactDOM.createRoot je nova metoda uvedena u React 18.
// Kreira tzv. “root” kontejner koji upravlja prikazom cele React aplikacije.
// document.getElementById('root') hvata <div id="root"></div> iz index.html fajla.
// Oznaka "!" govori TypeScript-u da sigurno postoji (non-null assertion).
ReactDOM.createRoot(document.getElementById('root')!).render(
  // StrictMode je pomoćni alat koji pomaže u razvoju — upozorava na potencijalne probleme
  // (npr. zastarele API-je, nečiste efekte ili duplo renderovanje u development modu).
  <React.StrictMode>
    {/* App je glavna komponenta aplikacije — sadrži sve rute i stranice */}
    <App />
  </React.StrictMode>
)

/*
🔍 Objašnjenje ključnih koncepata:
- React.StrictMode ne utiče na produkciju; koristi se samo u razvojnom okruženju za dodatne provere.
- ReactDOM.createRoot pokreće tzv. “Concurrent Rendering” — moderniji način renderovanja u React 18+.
- Bootstrap CSS se učitava globalno, tako da sve komponente mogu koristiti Bootstrap klase bez dodatnog importa.
- Ovaj fajl ne sadrži nikakvu poslovnu logiku; njegova uloga je isključivo da poveže aplikaciju sa DOM-om.
*/

