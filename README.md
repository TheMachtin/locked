# Locked

Persönliche Tracking-PWA — speichert Events und Tages-Flags, berechnet ein
Punkte-System mit Streaks und stellt das Ganze als Dashboard dar.

Läuft als Single-Page-App, hostet auf GitHub Pages, schreibt die Daten als
JSON in das eigene OneDrive (Microsoft Graph API). Keine eigene Datenbank,
kein Server, kein Tracking — alles bleibt im eigenen Microsoft-Konto.

## Features

- **Schnelleintrag** der täglichen Events mit einem Tap (aktuelle Uhrzeit)
- **Long-Press** öffnet Zeit-Picker für nachträgliche Einträge
- **Drei Tages-Flags** als Toggle pro Tag
- **Live-Dashboard** mit Punkte-Verlauf (Monat/Woche/Tag), Modell-Donut,
  Rekord-Streaks, Wochentag-Statistik
- **24-h-Timeline** pro Tag
- **Auto-Save** nach jeder Änderung in OneDrive
- **Installierbar** als PWA (Android Chrome → "App installieren")
- **CSV- und JSON-Backup-Export**

## Tech

- Single-File `index.html` mit Inline-CSS + Vanilla JS, keine Build-Pipeline
- MSAL.js (Microsoft Authentication Library) für OAuth via persönlichem MS-Konto
- Microsoft Graph API für OneDrive-Datei-IO
- Minimaler Service Worker für PWA-Install
- Hosting: GitHub Pages (HTTPS, kostenlos)

## Setup für eigene Nutzung

Wer das selbst betreiben will, muss drei Sachen einrichten:

1. **App-Registrierung bei Microsoft Entra**
   - https://portal.azure.com → "App registrations" → "New registration"
   - Name beliebig, Account-Typ: "Personal Microsoft accounts" (oder beide)
   - Redirect URI: Single-page application → deine spätere Hosting-URL
   - Bei "API permissions": Microsoft Graph → Delegated → `Files.ReadWrite`
   - Application (client) ID kopieren

2. **`index.html` anpassen** — im JS oben:
   ```js
   const CFG = {
     clientId: 'DEINE-CLIENT-ID',
     oneDrivePath: '/Pfad/zur/locked.json',
   };
   ```

3. **GitHub Pages aktivieren**
   - Repo erstellen → `index.html`, `sw.js`, `manifest.webmanifest`,
     Icons hochladen
   - Settings → Pages → Source: Branch `main`, Folder `/ (root)`

## Daten-Format

`locked.json` (im OneDrive):

```json
{
  "version": 2,
  "events": [
    { "date": "2026-05-17", "time": "08:30", "type": "HT" },
    { "date": "2026-05-17", "time": "21:15", "type": "OR" }
  ],
  "days": {
    "2026-05-17": { "orgasmusfrei": true, "ungeoeffnet": true, "hoursLocked": 24 }
  },
  "notes": {
    "2026-05-01": "Freitext-Notiz"
  }
}
```

- `events[].type` ∈ `HT` `NS` `PC` `KK` `OR`
- `days[].hoursLocked` überschreibt die berechnete Stundenzahl (manueller Override)
- Berechnung läuft komplett im Browser — Excel-Export via `export.py`

## Scripts (Python)

Im Repo nicht eingecheckt, liegen lokal:

- `migrate.py` — initiale Migration der Quell-Excel → `locked.json`
- `migrate_history.py` — historische Jahre aus älteren Excels nachimportieren
- `export.py` — `locked.json` zurück in die Excel-Vorlage schreiben
  (alle Formeln/Dashboards bleiben erhalten)

## Sicherheit / Privatsphäre

- Keine Daten verlassen die eigene Microsoft-Cloud
- Auth-Tokens nur im Browser-LocalStorage
- App ist Open Source — überprüfbar
- Empfehlung: Repo public lassen (für GitHub Pages im Free-Plan nötig),
  aber **keine** persönlichen Daten ins Repo committen — die `locked.json`
  liegt ausschließlich im privaten OneDrive

## Lizenz

Persönliches Projekt, ungeordnet. Wer Teile übernehmen will: gern, aber
ohne Gewähr.
