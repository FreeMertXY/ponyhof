# Entwicklungsnotizen & Entscheidungen

Hier sind die Entscheidungen dokumentiert, die ich beim Bauen von „Jolinas Ponyhof“ selbst getroffen habe.

## Persönliche Figuren

- **Jolina** (Hauptfigur) ist dem Foto nachempfunden: lange, glatte braune Haare, helle Haut, Blümchenkleid
  (weiß mit blauen Blüten) mit offener weißer Strickjacke und feiner Goldkette. Das ist die Voreinstellung im
  Charakter-Editor (Name „Jolina“, ohne Hut) – alles bleibt änderbar.
- **Mert**, Jolinas Freund, lebt mit auf dem Hof (steht meist am Stall): kurze dunkle Locken, Vollbart, runde
  Brille, offenes schwarzes Hemd über geripptem Top, Silberkette. Er bekommt die Bretter und **repariert den Stall**,
  baut die neue Koppel, kommentiert jeden Hofausbau, hat die eigene Nebenaufgabe „Kuchen für Mert“ (Belohnung:
  ein Herzbogen für den Hof), ist beim Sommerfest dabei, steht beim Sonnenuntergang an Jolinas Seite und hilft,
  das Fohlen zu benennen. Im Abspann gibt es eine eigene Seite „Eine kleine Familie“.
- **Mira** (Yorkshire-Terrier) begleitet Jolina ständig – zu Fuß und beim Reiten. Sie bellt ab und zu fröhlich
  und **schnüffelt versteckte goldene Hufeisen auf**: Liegt eins in der Nähe, zeigt sie aufgeregt die
  Himmelsrichtung an. Streicheln ist jederzeit möglich (andere Dinge haben beim `E`-Knopf Vorrang).
- **Maumau** (langhaarige Glückskatze, grüne Augen) und **Manni** (grauer Flauschkater mit weißer Brust und
  bernsteinfarbenen Augen) wohnen auf dem Hof, schnurren beim Streicheln (und zählen fürs Tieralbum als „Katze“),
  kommen zum Sommerfest und kuscheln sich beim Feuerwerk dazu.

## Welt

- **Größe & Maßstab:** 180×180 Kacheln à 48 px. Die Kamera zoomt abhängig von der Fensterhöhe
  (`Zoom = Höhe / 690`), sodass immer etwa 14–16 Kacheln senkrecht sichtbar sind – auf Laptop und Full-HD
  sieht die Welt gleich groß und niedlich aus.
- **Fest designt:** Die Gebiete liegen an festen Orten (Berge im Norden, Wald im Westen, See im Südwesten,
  Strand im Süden/Osten, Dorf östlich vom Hof, Wiesen nördlich). Wege, Gebäude, Brücken, Furten, Wegweiser,
  Rennstrecken und alle 30 Hufeisen sind von Hand platziert. Nur Bäume, Blumen, Pilze und Muscheln werden
  mit einem festen Zufalls-Seed verteilt – die Welt ist damit bei jedem Start identisch.
- **Erreichbarkeit:** Ein Test läuft per Breitensuche über die Kollisionskarte und prüft, dass alle Personen,
  Wildpferde, Sammelsachen, Apfelbäume und Beete erreichbar sind und dass alle Rennstrecken zu Pferd
  durchgehend befahrbar sind – in jedem Ausbauzustand des Hofes.
- **Wolkenberge:** Das Hochplateau ist nur über den Serpentinenpfad erreichbar (Felsband ringsum).
- **Glitzersee-Insel:** nur über die Furt am Westufer, also nur zu Pferd. Absteigen im Wasser ist nicht möglich.
- **Kollision:** Kollisionskarte mit den Typen frei / fest / tiefes Wasser / Furt (nur zu Pferd) /
  niedrig (Zaun, Hürde – nur im Sprung). Zäune sind bewusst niedrig: Zu Pferd springt man automatisch drüber.
- **Weiche Kanten:** Gelände-Übergänge werden mit Marching Squares gezeichnet (plus leichtes Rauschen an
  natürlichen Ufern), damit keine Treppenstufen entstehen.

## Zeit & Wetter

- 1 Spieltag = 12 Minuten (2 Spielminuten pro Sekunde). Neues Spiel beginnt um 8:00, der erste Vormittag
  bleibt trocken.
- Wetter: Sonne oder leichter Regen (≈30 % Chance bei jedem Wetterwechsel). Nach Regen erscheint für etwa
  eine Spielstunde ein Regenbogen. Regen gießt automatisch alle Beete.
- Beleuchtung: Die Szene wird mit einer Tageszeit-Farbe multipliziert (warmes Abendlicht, blaue Nacht);
  Laternen, Fenster und die Spielerin schneiden helle Lichtinseln aus. Nachts: Glühwürmchen, Sterne (im
  Wasser und am oberen Bildrand) und der Leuchtturmstrahl.
- Schlafen im Wohnhaus springt zum nächsten Morgen (Pflanzen wachsen weiter).

## Pferde

- **Startpferd** wird im Intro gestaltet (6 Fellfarben, Abzeichen, Stiefel, Name – vorgeschlagen „Sternchen“).
- **7 Wildpferde:** Kleeblatt (verschmust, Wiesen), Schoko (frech, Wald), Perle (schüchtern, See),
  Sandy (verspielt, Strand), Tupfen (neugierig, östliche Wiese), Mondschein (verträumt, Waldlichtung),
  Nebel (wild und stolz, Wolkenberge). Dazu eine nicht zähmbare Wildpferdeherde bei Nebel.
- **Zähmen:** Nervosität steigt, wenn man sich schnell nähert (Rennen/Reiten stark, langsames Gehen wenig),
  und sinkt beim Stehenbleiben. Bei voller Nervosität flieht das Pferd kurz (etwas Vertrauen geht verloren).
  Leckerli (Apfel > Karotte) aus der Nähe erhöhen das Vertrauen; **ohne Futter** geht es mit „Hand hinhalten“
  langsamer – man kann also nie festhängen. Die Werte hängen von der Persönlichkeit ab.
- **Freundschaft:** Punkte durch Streicheln (+3, kurze Abklingzeit), Füttern (+5/+3), Striegeln (+10 einmal
  pro Tag, danach +3) und Tricks. Level-Schwellen 0/20/50/90/140. Jedes Level +5 % Tempo.
  Tricks: Wiehern (Lv 2), Steigen (Lv 3), Pirouette (Lv 4), Verbeugen (Lv 5), Taste `F` oder im Pflege-Fenster.
- **Striegeln** gibt es nur auf dem Hof („die Bürste liegt im Stall“); Streicheln/Füttern überall.
- **Reiten:** Trab 5,8 und Galopp 8,8 Kacheln/s. `R` weit weg vom Pferd pfeift es herbei (es taucht hinter
  der Spielerin auf, damit es nie irgendwo feststeckt).
- Gezähmte Pferde laufen auf der Koppel herum und traben an den Zaun, wenn man in die Nähe kommt.

## Aufgaben (38 insgesamt)

- **Hauptgeschichte in 6 Kapiteln (28 Aufgaben)** mit Hofausbau als Belohnung:
  1. Ein neuer Anfang → Stall repariert (Pflege, Gemüsegarten, Dorf, Kätzchen Krümel, Bretter)
  2. Neue Freunde → Koppel erweitert (Lavendel, Eilpost mit 90-s-Bonus, erstes Wildpferd, Rennen gegen Ben)
  3. Blütenzauber → Blumengarten (Hindernisparcours, Rennen gegen Mia, Picknick auf der Insel, Wundersamen)
  4. **Herzklopfen** → Rosenlaube mit Schaukel (geheimnisvoller Liebesbrief und Date am Steg bei Sonnenuntergang,
     Mira ist weg, Ausritt zu zweit zum Aussichtspunkt, Überraschungsparty zu Merts Geburtstag, Rosenlaube)
  5. **Pfotenglück** → Tierparadies (Maumaus Geheimnis: drei Kätzchen – Namen frei wählbar, Miras großer
     Auftritt bei der Hundeshow, Mannis verlorener Flamingo, Katzenhaus/Hundehütte/Kratzbaum)
  6. Das Sommerfest → Festwiese (Nebel zähmen, großes Rennen, Einladungen, Girlanden) → Finale
- **10 Nebenaufgaben**: eine pro Dorfbewohner/in plus Kuno (Pilzsuppe, Muschelknöpfe, Apfelkiste, Postkarte
  vom Aussichtspunkt, Beste Freunde, Bens Tierbuch, Sonnenschein für den Leuchtturm) und drei mit Mert
  („Kuchen für Mert“, „Merts Herzsteine“ – 5 versteckte Herzsteine, „Sternschnuppennacht“ auf dem Hügel).
- Geschätzte Spielzeit beim ersten Durchspielen: **etwa 2–3 Stunden** (plus freies Weiterspielen, Album,
  Hufeisen, Deko).
- Innerhalb eines Kapitels laufen mehrere Aufgaben parallel, damit man z. B. während die Karotten wachsen
  ins Dorf reiten kann.
- **Rennen zählen immer als geschafft**, sobald man ins Ziel kommt (Medaille je nach Platz: Gold/Silber/Bronze,
  Goldbonus +20 Münzen). So bleibt es gemütlich; Revanchen sind danach jederzeit bei Mia und Ben möglich.
  Hindernisparcours: Gold unter 24 s, Silber unter 34 s, Bestzeit wird gespeichert.
- Gegner folgen den Wegpunkten mit einem sanften „Gummiband“ (werden etwas langsamer, wenn sie weit vorn
  liegen), damit Rennen spannend bleiben.
- Anti-Festhängen: Wer schon vorher ein Wildpferd gezähmt hat, erfüllt „Ein neuer Freund“ sofort; Samen gibt
  es notfalls einmal pro Tag gratis von Oma Hilde im Garten; alle benötigten Gegenstände gibt es auch im Laden;
  „Zurück zum Hof“ im Menü holt Spielerin und Pferd nach Hause.
- Verständlichkeit: Jeder Aufgabenschritt hat einen Zielpfeil (Kompass + Minikarte) und im Aufgabenbuch einen
  **„Tipp:“**-Text, wo genau es hingeht. Fehlt ein Gegenstand, sagt der Tipp, woher man ihn bekommt
  (`ITEM_SOURCES`). Herzsteine zeigt der Pfeil immer zum nächsten noch fehlenden Stein.
- Szenen überstehen Neuladen: Ist man mitten im Ausritt mit Mert oder sucht gerade Mira, wird der Zustand beim
  Laden wiederhergestellt (geprüft mit `tools/reload-check.mjs`). Wurde das Sommerfest-Finale unterbrochen, bietet
  Oma Hilde „Das Sommerfest beginnen!“ erneut an.

## Herzklopfen & Pfotenglück (die süßen Extras)

- **Kussszenen** – immer zurückhaltend und niedlich (Figuren rücken zusammen, Kuss-Geräusch, großes Herz,
  Glitzer, Bildschirm-Vignette mit rosa Rand): beim Date am Steg, als Stirnkuss am Aussichtspunkt, als
  Dankeschön bei der Geburtstagsparty, in der Rosenlaube und nach den Herzsteinen.
- Mert hat jetzt ein eigenes Menü: **„Umarmen“** und **„Küsschen geben“** gehen jederzeit; einmal am Tag
  schenkt er dabei eine Blume. Beim Schlafengehen sagt er „Gute Nacht“ und morgens „Guten Morgen“.
- **Nur Mira folgt einem dauerhaft.** Der Welpe im Dorf freut sich beim Streicheln nur (früher lief er
  15 Sekunden hinterher), das Fohlen bleibt auf der Koppel, bis man es mitnimmt. Krümel folgt nur kurz während
  ihrer Aufgabe, bis sie bei Berta ist.
- **Mira-Menü** (E bei Mira): Streicheln, Stöckchen werfen (sie holt es), Kunststück üben (für die Hundeshow),
  Leckerli geben. Nach der Hundeshow trägt sie eine Rosette.
- Die Kätzchen folgen Maumau über den Hof; Manni hat nach dem Flamingo-Abenteuer sein Spielzeug immer dabei.
- In der Rosenlaube kann man auf der Schaukel sitzen.

## Sammeln & Wirtschaft

- 30 goldene Hufeisen (4–5 pro Gebiet). Belohnungen: 10 → Glitzersattel, 20 → Regenbogenschleifen,
  30 → Goldener Blütenkranz (jeweils plus Münzen).
- Blumen, Pilze und Muscheln wachsen täglich nach; jeder Apfelbaum lässt sich einmal pro Tag schütteln.
- Verkaufen bei Theo; Verschenken an alle Personen (Lieblingsgeschenke geben einmal pro Tag etwas zurück).
- Läden: Theo (Futter, Samen, Zubehör, Hof-Deko), Berta (Backwaren, Saft), Luise (Kleidung, Hüte).
- Zubehör: 6 Sattelfarben, 3 Mähnenschleifen, Blumenkranz, 3 Decken + 3 Spezial-Belohnungen – alles sichtbar
  am Pferd.
- Gemüsegarten: Karotten (5 feuchte Spielstunden) und Sonnenblumen (7 Stunden). Gießen hält die Erde
  12 Stunden feucht.
- Baumodus: Deko nur auf Gras im Hofgebiet (nicht auf Wegen, nicht in der Koppel). Vor dem Platzieren wird
  per Breitensuche geprüft, dass Hoftor und Spielerin weiter verbunden bleiben – man kann sich nicht einmauern.

## Tieralbum

14 Arten mit festen Heimatorten. Scheue Tiere (Hase, Fuchs, Eichhörnchen, Reh) fliehen, wenn man rennt oder
reitet – außer man hat ihr Lieblingsfutter dabei. Die Eule gibt es nur nachts. Volles Album → Goldener
Blütenkranz, Blütenhaarreif und 100 Münzen.

## Ende

Nach Kapitel 6 startet das Sommerfest (alle Personen, Pferde und Tiere aus dem Album auf der Festwiese,
festliche Musik), dann das Sommerfest-Rennen, Sonnenuntergang auf dem Hügel, Herz-Feuerwerk mit
Sternschnuppen, Oma Hildes Abschiedsworte, die Geburt eines Fohlens (Name frei wählbar; es wohnt danach
auf der Koppel und kann im Pferde-Fenster mit „Mitnehmen“ zum Begleiter werden) und ein Bilderbuch-Abspann mit gezeichneten Erinnerungen und Statistik.
„Ende … oder doch nicht?“ führt zurück ins freie Spiel am nächsten Morgen.

## Technik

- Offscreen-Canvas-Chunks (8×8 Kacheln) mit LRU-Cache, vorgezeichnete Sprites für Bäume, Gebäude, Zäune,
  y-Sortierung aller sichtbaren Objekte, vorgezeichnete Licht-Sprites und eine Lichtmaske in Drittel-Auflösung.
  Sehr große Fenster reduzieren die interne Auflösung. Zusätzlich gibt es eine **automatische
  Qualitätsanpassung**: Fällt die Bildrate mehrere Sekunden unter 48 fps, wird die interne Auflösung
  schrittweise (bis 60 %) gesenkt und später wieder angehoben.
- Gemessen (`tools/fps.mjs`, Chromium ohne Grafikkarte, also Software-Rendering): 1280×760 überall 57–60 fps;
  1920×1080 tagsüber ~60 fps, nachts mit Lichtmaske zunächst ~35 fps, nach der automatischen Anpassung
  wieder 57–59 fps. Mit echter Grafikbeschleunigung im normalen Browser ist das Licht deutlich günstiger.
- Musik: prozeduraler Sequenzer mit 8-taktigen Motiven aus Akkordtönen; jedes Gebiet hat eigene Tonart,
  eigenes Lead-Instrument (Marimba, Akkordeon, Glockenspiel, Flöte, Harfe, Ukulele) und eigene Begleitung.
  Nachts langsamer mit Spieluhr, beim Fest schneller mit Schlagzeug. Geräusche: Hufgetrappel, Pling, Wiehern
  (formantgefilterter Sägezahn mit Vibrato), Vogelzwitschern, Grillen, Eule, Regen, Meeresrauschen u. v. m.
- Speicherstand: `ponyhof.save` in localStorage, Format `{ v: Version, t: Zeit, data }`. Beim Laden:
  Versionsprüfung, Migration, Ergänzung fehlender Felder, Validierung. Ein kaputter Stand wird unter
  `ponyhof.save.kaputt` aufgehoben statt gelöscht. Einstellungen liegen getrennt in `ponyhof.settings`.
- Schrift „Fredoka“ über Google Fonts; falls sie nicht lädt, greifen runde Systemschriften.
- `window.ponyhof` ist das Spielobjekt – praktisch zum Ausprobieren in der Konsole.

## Selbst durchgespielt

- `tools/walkthrough.mjs` spielt die komplette Geschichte im echten Browser (Chromium) automatisch durch –
  alle 28 Hauptaufgaben und 10 Nebenaufgaben, Rennen, Zähmen, Picknick, Kussszenen, Kätzchen-Namen, Finale,
  Abspann und Weiterspielen nach dem Neuladen – ohne Fehler.
- `tools/reload-check.mjs` lädt mitten im Ausritt und während Mira verschwunden ist neu und spielt weiter.
- `tools/scenes-shot.mjs` macht Screenshots der neuen Szenen in echter Geschwindigkeit (Date, Party, Laube,
  Tierparadies).
- `tools/tour.mjs` macht Screenshots aller Gebiete (auch Nacht, Regen, Regenbogen), `tools/panels.mjs` von
  allen Menüs, `tools/finale-shot.mjs` vom Sonnenuntergang und Feuerwerk. Anhand dieser Bilder wurde die Optik
  mehrfach nachgebessert (Zoom, weiche Ufer, größere Pferde, warmes Abendlicht, Feuerwerkshöhe, Sternenhimmel).
