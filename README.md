# Locked

Persönliche Tracking-PWA — speichert Events und Tages-Flags, berechnet ein
Punkte-System mit Streaks und stellt das Ganze als Dashboard dar.

Läuft als Single-Page-App, hostet auf GitHub Pages, schreibt die Daten als
JSON in das eigene OneDrive (Microsoft Graph API). Keine eigene Datenbank,
kein Server, kein Tracking — alles bleibt im eigenen Microsoft-Konto.

## Features

### Eingabe
- **Press-and-hold-Schnelleintrag** (~1 s halten) für 5 Event-Typen mit aktueller Uhrzeit, visuelle Füllanimation + Vibration als Bestätigung. Schützt vor versehentlichen Taps.
- **Datum-Pillen** für Heute / Gestern / Vorgestern / Vor 1 Woche
- **24-h-Timeline** pro Tag mit Modell-Farben + Orgasmus-Markern
- **Event-Editieren** — Modell und Uhrzeit jedes Eintrags nachträglich anpassbar
- **Tages-Toggles** für Orgasmusfrei / Ungeöffnet / Nicht Verschlossen mit Auto-Ableitung; explizite Overrides möglich
- **Stunden-Override** mit Auto-Wert-Anzeige im Placeholder
- **Aktuelles Modell** wird live unter dem Datum angezeigt

### Dashboard
- **Jahresfilter** (Alle / einzelne Jahre), persistiert über localStorage
- **Stand-KPIs**: Punktestand, Ø Pkt/Tag, Ø Std/Tag, Orgasmusfrei- und Ungeöffnet-Streak
- **Übersicht-KPIs**: Punktestand, Tage erfasst, Tage mit Orgasmus, Stunden verschlossen, Beste Wertung, Jahres-**Prognose**
- **Punkte-Verlauf-Chart** mit Toggle Monat/Woche/Tag, Y-Achse asymmetrisch (positiv auto-skaliert, negativ auf −1000 gedeckelt)
- **Modell-Donut** + Liste der Tragezeiten
- **Streak-Verlauf-Chart**: OF- und UÖ-Streak in Tagen über Zeit
- **Kalender-Heatmap** im GitHub-Stil pro Jahr, gefärbt nach Tagespunkten
- **Aufklappbare Details**: Monatstabelle, Rekord-Streaks, Wochentag-Statistik, Zähler
- **Drilldown**: Tap auf Punkte-Chart-Balken oder Heatmap-Tag → springt zu Eintrag-Tab mit passendem Datum

### Daten & Robustheit
- **OneDrive-Auto-Sync** via Microsoft Graph nach jeder Änderung (mit Queue gegen Race-Conditions)
- **ETag-Konflikt-Erkennung** beim Schreiben — schützt vor Überschreiben paralleler Bearbeitungen
- **Offline-fähig** — Service Worker cached statische Assets, Saves bei Verbindungsrückkehr automatisch
- **Sanity-Check** beim Laden — kaputte Events / unbekannte Keys melden
- **Service-Worker-Update-Banner** zeigt neue Version + Aktualisieren-Knopf
- **JSON-Backup**, **Excel-Export** (SheetJS) und **CSV-Export** in der App
- **Installierbar** als PWA (Android Chrome → "App installieren")

## Tech

- Single-File `index.html` mit Inline-CSS + Vanilla JS, keine Build-Pipeline
- **MSAL.js** für OAuth via persönlichem Microsoft-Konto
- **Microsoft Graph API** für OneDrive-Datei-IO
- **SheetJS** für Excel-Export im Browser
- **Service Worker** für Offline + PWA-Install + Update-Detection
- Hosting: **GitHub Pages** (HTTPS, kostenlos)
- Charts inline als SVG (keine Chart-Library)

## Setup für eigene Nutzung

Wer das selbst betreiben will, braucht drei Sachen:

1. **App-Registrierung bei Microsoft Entra**
   - <https://portal.azure.com> → "App registrations" → "New registration"
   - Account-Typ: "Personal Microsoft accounts" (oder beide)
   - Redirect URI: Single-page application → spätere Hosting-URL
   - API permissions: Microsoft Graph → Delegated → `Files.ReadWrite`
   - Application (client) ID kopieren

2. **`index.html` anpassen** — im `CFG`-Block oben:
   ```js
   const CFG = {
     clientId: 'DEINE-CLIENT-ID',
     oneDrivePath: '/Pfad/zur/locked.json',
   };
   ```

3. **GitHub Pages aktivieren**
   - Repo erstellen → `index.html`, `sw.js`, `manifest.webmanifest`, Icons hochladen
   - Settings → Pages → Source: Branch `main`, Folder `/ (root)`

## Punkte-Formel

Pro Tag:
```
Tagespunkte =  OF-Streak       (wenn orgasmusfrei)
             + UÖ-Streak       (wenn ungeöffnet)
             + Stunden × 0,5
             − 10              (wenn Orgasmus)
             − 5               (wenn nicht verschlossen)
```

Streaks wachsen exponentiell:
```
Streak heute = Streak gestern × 1,07 + Basis      (Basis: 3 für OF, 5 für UÖ)
```
Sobald ein Flag-Tag ausfällt → Streak zurück auf 0.

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
- `days[].orgasmusfrei / ungeoeffnet / keinKG` als explizite Overrides; ohne Override greift Auto-Ableitung
- `days[].hoursLocked` überschreibt die berechnete Stundenzahl
- Berechnung läuft komplett im Browser

## Auto-Ableitungs-Regeln

Ohne expliziten Override:
- **Orgasmusfrei** = kein OR-Event an dem Tag
- **Ungeöffnet** = kein Modell-Event den Tag (HT/NS/PC/KK) — jeder eingetragene Modellwechsel impliziert „geöffnet"
- **Nicht Verschlossen** = mehr als 12 h KK den Tag

Toggle in der App: 1. Klick setzt expliziten Gegenwert, 2. Klick zurück zur Auto-Ableitung.

## Scripts (Python, im Repo nicht eingecheckt)

Liegen lokal im Schwester-Ordner `scripts/`:

- `migrate.py` — initiale Migration der `Keusch'26 Neu.xlsx` → `locked.json`
- `migrate_ursprung.py` — bereinigte historische Daten (2024+2025) aus `locked ursprungsdaten.xlsx` einlesen
- `export.py` — `locked.json` zurück in die Excel-Vorlage schreiben (alle Formeln/Dashboards bleiben erhalten)

## Sicherheit / Privatsphäre

- Keine Daten verlassen die eigene Microsoft-Cloud
- Auth-Tokens nur im Browser-LocalStorage
- App ist Open Source — überprüfbar
- Empfehlung: Repo public lassen (für GitHub Pages im Free-Plan nötig), aber **keine** persönlichen Daten ins Repo committen — die `locked.json` liegt ausschließlich im privaten OneDrive

## Lizenz

Persönliches Projekt, ungeordnet. Wer Teile übernehmen will: gern, aber ohne Gewähr.
