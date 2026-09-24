# 🐴 Jolinas Ponyhof

Ein gemütliches Open-World-Pferdeabenteuer für den Browser – warm, pastellig und verspielt wie ein Bilderbuch.
Oma Hilde übergibt dir ihren alten, verwilderten Ponyhof. Freunde dich mit Pferden an, reite durch sieben
Gebiete, hilf den Leuten im Dorf Kleeberg, sammle Hufeisen und Tiere fürs Album – und erwecke den Hof bis zum
großen Sommerfest wieder zum Leben. Kein Game Over, kein Zeitdruck (außer bei den freiwilligen Rennen).

## ▶️ Spielen

**Direkt im Browser:** <https://freemertxy.github.io/ponyhof/>

Läuft in Chrome, Edge und Firefox am PC – ohne Installation. Die Musik startet nach dem ersten Klick.
Das Spiel speichert automatisch (alle 30 Sekunden und bei jedem Fortschritt); im Titelmenü geht es mit
„Fortsetzen“ weiter.

### Steuerung

| Taste | Aktion |
| --- | --- |
| `W A S D` / Pfeiltasten | laufen (oder linke Maustaste gedrückt halten) |
| `Shift` | rennen bzw. galoppieren |
| `E` | sprechen, streicheln, pflücken, benutzen (oder anklicken) |
| `R` | auf-/absteigen – ist das Pferd weit weg, wird es herbeigepfiffen |
| `Leertaste` | zu Pferd springen (klappt an niedrigen Zäunen auch automatisch) |
| `F` | Pferde-Trick (ab Freundschaftslevel 2) |
| `I` / `Q` / `M` / `T` / `P` | Tasche, Aufgaben, Karte, Tieralbum, Pferde |
| `Esc` | Menü (Einstellungen, Speichern, „Zurück zum Hof“) |

Alles ist auch mit der Maus über die Knöpfe unten rechts, die Minikarte und das Aufgabenfeld bedienbar.

## 💻 Lokal starten

Das Spiel besteht nur aus statischen Dateien (HTML, CSS, JavaScript-Module). Wegen der ES-Module braucht es
einen kleinen lokalen Webserver – z. B.:

```bash
npm start            # startet http-server auf http://localhost:8080
# oder
python3 -m http.server 8080
```

Dann <http://localhost:8080> im Browser öffnen.

### Tests

```bash
npm test             # node --test: Welt & Kollision, Aufgaben, Speichern/Laden, Inventar, Laden, Zähmen
```

Die Tests prüfen u. a., dass alle Personen, Wildpferde, Sammelsachen und Rennstrecken erreichbar sind und dass
man die komplette Geschichte bis zum Sommerfest durchspielen kann.

## 🗂️ Aufbau des Codes

```
index.html            Grundgerüst, HUD, Dialog, Fenster
style.css             runder Pastell-Look der Oberfläche
src/
  main.js             Einstieg
  game.js             Spielschleife, Zeit & Wetter, Interaktionen, Garten, Baumodus, Zähmen, Speichern
  world.js            fest designte Welt (180×180 Kacheln, 7 Gebiete), Wege, Kollision, Erreichbarkeit
  render.js           Renderer: Gelände-Chunks im Offscreen-Canvas, y-sortierte Objekte, Licht, Wetter
  player.js           Spielfigur: laufen, rennen, reiten, springen
  horses.js           Pferde: Freundschaft, Zähm-Logik, Verhalten (Koppel, wild, Herde, Fohlen)
  animals.js          14 Tierarten mit Reaktionen und Tieralbum
  npcs.js             Dorfbewohner in der Welt
  quests.js           Aufgaben-Engine (Schritte, Ereignisse, Belohnungen)
  dialog.js           Sprechblasen mit Porträt, Tippeffekt, Auswahl
  inventory.js        Gegenstände, Münzen, Freischaltungen
  shop.js             Laden (Kaufen/Verkaufen)
  stall.js            Stall-Menü, Zubehör, Pflege & Striegel-Minispiel
  race.js             Rennen & Hindernisparcours (Checkpoints, Gegner, Medaillen)
  ending.js           Sommerfest, Sonnenuntergang, Feuerwerk, Fohlen
  screens.js          Titel, Charakter-Editor, Intro, Namenseingabe, Bilderbuch-Abspann
  ui.js               HUD, Minikarte, Karte, Inventar, Aufgabenbuch, Album, Einstellungen
  audio.js            Musik & Geräusche – komplett mit der Web Audio API erzeugt
  save.js             versionierter Speicherstand in localStorage (mit Fehlerbehandlung)
  particles.js        Staub, Herzen, Glitzer, Konfetti, Herz-Feuerwerk
  input.js, util.js   Eingabe und Helfer
  draw/               alle Grafiken, im Code gezeichnet (Figuren, Pferde, Tiere, Gebäude, Gelände, Symbole)
  data/               Spielinhalte als Daten: Aufgaben & Dialoge, Personen, Tiere, Pferde, Gegenstände, Laden
tests/                automatische Tests (node --test)
tools/                Hilfsskripte für Browser-Screenshots und den automatischen Komplett-Durchlauf
.github/workflows/    Tests + Veröffentlichung auf GitHub Pages bei jedem Push auf main
```

### Inhalte erweitern

Neue Aufgaben, Dialoge, Tiere, Gegenstände oder Zubehör werden in `src/data/` als einfache Objekte ergänzt –
z. B. eine neue Nebenaufgabe in `src/data/quests.js` (Schritttypen stehen oben in der Datei). `{name}` wird im
Text automatisch durch den Namen der Spielerin ersetzt, `{horse}` durch den Namen des Reitpferds.

## 🎨 Technik

- Vanilla JavaScript (ES-Module) + HTML5 Canvas 2D, keine Frameworks, keine Bild- oder Tondateien.
- Alle Grafiken werden im Code gezeichnet (Formen, Verläufe, weiche Schatten), alle Klänge per Web Audio API.
- Gelände wird in Chunks einmalig vorgezeichnet (weiche Kanten per Marching Squares), Objekte werden nach
  y-Position sortiert, gezeichnet wird nur, was sichtbar ist → 60 fps.
- Schrift: „Fredoka“ von Google Fonts mit Fallback auf Systemschriften.

Viel Spaß auf dem Ponyhof! ♥
