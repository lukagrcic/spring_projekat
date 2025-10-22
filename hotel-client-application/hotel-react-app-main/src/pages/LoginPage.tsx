// src/pages/LoginPage.tsx
// Komponenta za prijavu korisnika u aplikaciju (frontend deo login logike)

import { useState } from 'react'
import type {FormEvent} from 'react'
import { login, saveAuth } from '../services/auth'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
    // ----------------------------
    // React state hooks
    // ----------------------------
    // useState hook se koristi za upravljanje lokalnim stanjem komponente.
    // Svaka promenljiva ispod se automatski re-renderuje kada se promeni.

    const [username, setUsername] = useState('')           // unos korisničkog imena
    const [password, setPassword] = useState('')           // unos lozinke
    const [loading, setLoading] = useState(false)          // indikator da je zahtev u toku
    const [error, setError] = useState<string | null>(null)// eventualna greška pri prijavi
    const navigate = useNavigate()                         // hook iz react-router-dom-a za navigaciju između stranica

    // ----------------------------
    // Obrada događaja forme
    // ----------------------------
    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()          // sprečava podrazumevano osvežavanje stranice nakon submit-a
        setError(null)              // briše prethodnu grešku ako postoji
        setLoading(true)            // prikazuje stanje učitavanja

        try {
            // Poziva login servis (HTTP POST ka /auth/login)
            // login vraća objekat sa tokenom, korisničkim imenom i ID-jem.
            const { token, username: u, id: uid } = await login(username, password)

            // Čuvamo podatke o korisniku u localStorage
            // Ovaj korak održava sesiju aktivnom i nakon refresh-a stranice
            saveAuth(token, u, uid)

            // Resetujemo lozinku radi sigurnosti (ne čuvamo je u memoriji)
            setPassword('')

            // Navigacija korisnika na početnu stranicu rezervacija
            navigate('/reservations')

            // Jednostavan vizuelni feedback korisniku
            alert('Uspesna prijava!')
        } catch (err: any) {
            // Ako dođe do greške (npr. pogrešni kredencijali ili greška servera)
            // ispisuje se jednostavna poruka korisniku
            setError('Prijava nije uspela')
        } finally {
            // finally blok se uvek izvršava — resetuje stanje dugmeta
            setLoading(false)
        }
    }

    // ----------------------------
    // JSX struktura (UI deo)
    // ----------------------------
    // JSX je sintaksa slična HTML-u, ali dozvoljava umetanje JS izraza unutar {}
    // Bootstrap klase se koriste za brzi vizuelni dizajn forme

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="card shadow" style={{ width: '100%', maxWidth: 420 }}>
                <div className="card-body p-4">
                    <h1 className="h4 mb-3 text-center">Hotel — Prijava</h1>

                    {/* Prikaz poruke o grešci ako postoji */}
                    {error && <div className="alert alert-danger">{error}</div>}

                    {/* Forma za unos korisničkog imena i lozinke */}
                    <form onSubmit={onSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Korisničko ime</label>
                            <input
                                className="form-control"
                                autoComplete="username"              // HTML5 atribut za automatsko popunjavanje
                                value={username}                     // vrednost preuzeta iz React state-a
                                onChange={(e) => setUsername(e.target.value)} // ažurira state pri svakom unosu
                                required                             // HTML validacija
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Lozinka</label>
                            <input
                                type="password"                      // skrivanje unosa
                                className="form-control"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} // ažurira lozinku u state-u
                                required
                            />
                        </div>

                        {/* Dugme za prijavu. Onemogućeno dok traje loading. */}
                        <button className="btn btn-primary w-100" disabled={loading}>
                            {loading ? 'Prijavljivanje…' : 'Prijavi se'}
                        </button>
                    </form>
                </div>

                {/* Footer kartice — verzija aplikacije */}
                <div className="card-footer text-center text-muted small">v0.1</div>
            </div>
        </div>
    )
}