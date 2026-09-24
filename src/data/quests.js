// Aufgaben & Geschichte „Den Ponyhof wieder zum Leben erwecken“ in 4 Kapiteln + Nebenaufgaben.
//
// Schritt-Typen:
//   talk     { npc, lines, give }           – mit Person sprechen
//   deliver  { npc, items, lines, missing }  – Gegenstände abgeben
//   event    { ev, count, filter }           – Ereignisse zählen (pet_horse, feed_horse, groom, plant,
//                                              water, harvest, tame, find_kitten, race, parcours, picnic, telescope)
//   reach    { region | at:{x,y,r} }         – einen Ort erreichen
//   tame     { horse }                       – ein bestimmtes Pferd zähmen
//   friendship { level }                     – ein Pferd mit Freundschaftslevel ≥ n
//   album    { count }                       – so viele Tierarten im Album
//   talkAll  { npcs, lines:{npc:[…]} }       – mit allen genannten Personen sprechen
// Zeilen: 'Text' (Sprecher = npc des Schritts) oder { who: 'mia', t: 'Text' }. who 'player' = Spielerin.

export const CHAPTERS = [
  { n: 1, title: 'Ein neuer Anfang', reward: 'Der Stall wird repariert' },
  { n: 2, title: 'Neue Freunde', reward: 'Die Koppel wird erweitert' },
  { n: 3, title: 'Blütenzauber', reward: 'Ein Blumengarten entsteht' },
  { n: 4, title: 'Das Sommerfest', reward: 'Die Festwiese wird geschmückt' },
];

export const QUESTS = [
  // ---------------- Kapitel 1 ----------------
  {
    id: 'k1_pflege', chapter: 1, main: true, title: 'Ein Pferd zum Liebhaben', giver: 'hilde', requires: [],
    desc: 'Lerne {horse} kennen und kümmere dich um dein erstes Pferd.',
    startGive: { carrot: 3 },
    steps: [
      { type: 'event', ev: 'pet_horse', count: 1, text: 'Streichle {horse} (zu {horse} gehen, E drücken)', target: { horse: 'riding' } },
      { type: 'event', ev: 'feed_horse', count: 1, text: 'Füttere {horse} mit einer Karotte', target: { horse: 'riding' } },
      {
        type: 'talk', npc: 'hilde', text: 'Sprich mit Oma Hilde', target: { npc: 'hilde' },
        lines: [
          'Siehst du, wie {horse} dich anschaut? Ihr zwei seid jetzt ein Team.',
          'Der alte Hof braucht aber noch viel Liebe. Der Stall ist morsch, die Koppel winzig, und der Garten … ach, der Garten!',
          'Fang doch mit dem Gemüsegarten an. Und reite mal ins Dorf Kleeberg, im Osten. Die Leute dort sind herzensgut.',
          { who: 'mert', t: 'Und ich hol schon mal meinen Werkzeugkasten raus. Wenn wir Bretter bekommen, repariere ich den Stall!' },
        ],
      },
    ],
    reward: { coins: 20 },
  },
  {
    id: 'k1_garten', chapter: 1, main: true, title: 'Omas Gemüsegarten', giver: 'hilde', requires: ['k1_pflege'],
    desc: 'Bring den verwilderten Gemüsegarten wieder zum Blühen.',
    steps: [
      {
        type: 'talk', npc: 'hilde', text: 'Hol dir Samen bei Oma Hilde', target: { npc: 'hilde' }, give: { seed_carrot: 4 },
        lines: [
          'Hier, Liebes: Karottensamen! Der Garten liegt gleich neben dem Stall.',
          'Stell dich an ein Beet und drück E. Erst säen, dann gießen – und solange die Erde feucht ist, wachsen die Karotten.',
          'Regen gießt übrigens auch. Der Himmel hilft gern mit.',
        ],
      },
      { type: 'event', ev: 'plant', count: 3, text: 'Säe Karotten im Gemüsegarten', target: { spot: 'garden' } },
      { type: 'event', ev: 'water', count: 3, text: 'Gieße die Beete', target: { spot: 'garden' } },
      { type: 'event', ev: 'harvest', filter: 'carrot', count: 3, text: 'Ernte Karotten (sie wachsen, solange die Erde feucht ist)', target: { spot: 'garden' } },
      {
        type: 'talk', npc: 'hilde', text: 'Zeig Oma Hilde deine Ernte', target: { npc: 'hilde' },
        lines: [
          'Die ersten Karotten seit Jahren! Opa Karl wäre so stolz auf dich.',
          'Behalte sie – Pferde lieben Karotten. Und ein paar Äpfel von unseren Bäumen gebe ich dir auch.',
          'Tipp: Unter Apfelbäumen einfach E drücken und schütteln!',
        ],
      },
    ],
    reward: { coins: 25, items: { apple: 2, seed_carrot: 3 } },
  },
  {
    id: 'k1_dorf', chapter: 1, main: true, title: 'Auf nach Kleeberg', giver: 'hilde', requires: ['k1_pflege'],
    desc: 'Besuche das Dorf Kleeberg östlich vom Hof.',
    steps: [
      { type: 'reach', region: 'village', text: 'Reite ins Dorf Kleeberg (nach Osten)', target: { x: 126, y: 96 } },
      {
        type: 'talk', npc: 'theo', text: 'Sprich mit Kaufmann Theo vor seinem Laden', target: { npc: 'theo' },
        lines: [
          'Hm-hm. Eine neue Kundschaft! Theo mein Name, Kaufmann aus Leidenschaft.',
          'Du bist also Hildes Enkelin {name}? Das ganze Dorf redet schon von dir.',
          'Bretter für den Stall? Hab ich. Aber weißt du was – hilf erst mal Berta, der Bäckerin. Die ist ganz aufgelöst.',
          'Wer im Dorf hilft, dem hilft das Dorf. So läuft das in Kleeberg.',
        ],
      },
    ],
    reward: { coins: 10 },
  },
  {
    id: 'k1_kruemel', chapter: 1, main: true, title: 'Wo ist Krümel?', giver: 'berta', requires: ['k1_dorf'],
    desc: 'Bertas Kätzchen Krümel ist in den Flüsterwald gelaufen.',
    steps: [
      {
        type: 'talk', npc: 'berta', text: 'Sprich mit Bäckerin Berta', target: { npc: 'berta' },
        lines: [
          'Ach du liebe Güte, {name}! Krümel ist weg! Mein kleines Kätzchen!',
          'Sie ist heute früh einem Schmetterling hinterher – Richtung Flüsterwald, westlich vom Ponyhof.',
          'Sie versteckt sich so gern in hohlen Baumstämmen. Bitte, bitte finde sie!',
        ],
      },
      { type: 'event', ev: 'find_kitten', count: 1, text: 'Suche Krümel im Flüsterwald (hohler Baumstamm auf einer Lichtung)', target: { spot: 'kitten' } },
      {
        type: 'talk', npc: 'berta', text: 'Bring Krümel zurück zu Berta', target: { npc: 'berta' }, needKitten: true,
        lines: [
          'KRÜMEL! Mein kleiner Zuckerschnecken-Krümel!',
          { who: 'narr', t: 'Krümel springt Berta in die Arme und schnurrt wie ein kleiner Motor.' },
          'Danke, danke, danke, {name}! Hier – frisches Brot und ein Stück von meinem berühmten Streuselkuchen!',
        ],
      },
    ],
    reward: { coins: 30, items: { bread: 2, cake: 1 } },
  },
  {
    id: 'k1_bretter', chapter: 1, main: true, title: 'Holz für den Stall', giver: 'theo', requires: ['k1_kruemel', 'k1_garten'],
    desc: 'Mit Theos Brettern kann der Stall repariert werden.',
    steps: [
      {
        type: 'talk', npc: 'theo', text: 'Hol die Bretter bei Theo ab', target: { npc: 'theo' }, give: { boards: 1 },
        lines: [
          'Ha! Die ganze Stadt redet von dir. Krümel ist wieder da, und bei Hilde wachsen Karotten!',
          'Hier sind deine Bretter. Geschenkt! Na gut … fast geschenkt. Ich nehme ein Lächeln als Bezahlung.',
          { who: 'narr', t: 'Du lächelst. Theo nickt zufrieden und brummt etwas von „gutem Geschäft“.' },
        ],
      },
      {
        type: 'deliver', npc: 'mert', items: { boards: 1 }, text: 'Bring die Bretter zu Mert am Stall', target: { npc: 'mert' },
        lines: [
          'Bretter! Von Theo? Der hat ja doch ein weiches Herz.',
          'Dann los – hämmern, sägen, streichen! Du hältst, ich hämmere. Und Mira passt auf, dass keiner die Nägel klaut.',
          { who: 'hilde', t: 'Ihr zwei seid ein gutes Team. Genau wie dein Opa Karl und ich damals.' },
        ],
      },
    ],
    reward: { coins: 30, farm: 'stable', memory: 'stable' },
  },
  // ---------------- Kapitel 2 ----------------
  {
    id: 'k2_lavendel', chapter: 2, main: true, title: 'Lavendelduft', giver: 'luise', requires: ['k1_bretter'],
    desc: 'Luise braucht Lavendel für ihre Duftkissen.',
    steps: [
      {
        type: 'talk', npc: 'luise', text: 'Sprich mit Schneiderin Luise', target: { npc: 'luise' },
        lines: [
          'Oh! Du musst {name} sein. Wie entzückend du aussiehst!',
          'Ich nähe Duftkissen für das Sommerfest … das Sommerfest! Früher war es immer auf dem Ponyhof. Seufz.',
          'Mir fehlt nur Lavendel. Zehn Sträuße! Auf den Blumenwiesen im Norden wächst ein ganzes Feld davon.',
        ],
      },
      {
        type: 'deliver', npc: 'luise', items: { lavender: 10 }, text: 'Sammle Lavendel auf den Blumenwiesen und bring ihn Luise', target: { x: 73, y: 48 },
        lines: [
          'Dieser Duft! Wenn ich daran rieche, sehe ich Farben. Lila, natürlich.',
          'Zum Dank habe ich dir etwas genäht: ein Lavendelkleid! Du findest es im Inventar unter „Kleidung“.',
        ],
        missing: ['Zehn Sträuße, Liebes. Das Lavendelfeld liegt auf den Blumenwiesen, nördlich vom Hof.'],
      },
    ],
    reward: { coins: 40, unlock: ['outfit_lavender'] },
  },
  {
    id: 'k2_post', chapter: 2, main: true, title: 'Eilpost zum Leuchtturm', giver: 'paula', requires: ['k1_bretter'],
    desc: 'Paula hat einen Eilbrief für Kuno. Mit Zeitbonus!',
    steps: [
      {
        type: 'talk', npc: 'paula', text: 'Sprich mit Postbotin Paula', target: { npc: 'paula' }, give: { letter: 1 }, startTimer: 'post',
        lines: [
          'Zack, zack, {name}! Gut, dass du da bist! Paula. Post. Pünktlichkeit.',
          'Dieser Eilbrief muss zu Kuno, dem Leuchtturmwärter am Sonnenstrand – ganz im Südosten.',
          'Mit dem Pferd bist du viel schneller als ich mit dem Fahrrad. Unter 90 Sekunden gibt’s einen Bonus! Die Uhr läuft … ab jetzt!',
        ],
      },
      {
        type: 'deliver', npc: 'kuno', items: { letter: 1 }, text: 'Bring den Eilbrief zu Kuno am Leuchtturm', target: { npc: 'kuno' }, stopTimer: 'post',
        lines: [
          'Ahoi, Landratte! Post für den alten Kuno?',
          'Ein Brief von meiner Schwester aus Nordhafen! Du hast mir den Tag gerettet.',
          'Kleiner Tipp unter Seeleuten: Hier am Strand liegen nicht nur Muscheln. Auch goldene Hufeisen … wenn man genau hinschaut.',
        ],
      },
    ],
    reward: { coins: 30 },
  },
  {
    id: 'k2_zaehmen', chapter: 2, main: true, title: 'Ein neuer Freund', giver: 'hilde', requires: ['k1_bretter'],
    desc: 'Zähme ein wildes Pferd.',
    steps: [
      {
        type: 'talk', npc: 'hilde', text: 'Sprich mit Oma Hilde', target: { npc: 'hilde' }, give: { apple: 3 },
        lines: [
          'Der Stall ist wieder heil – da ist Platz für mehr Pferde!',
          'In der Gegend leben wilde Pferde. Sie brauchen Geduld: Geh langsam auf sie zu, zu Fuß. Wird es nervös, bleib einfach stehen.',
          'Wenn es dir vertraut, biete ihm einen Apfel oder eine Karotte an. Hier, nimm drei Äpfel mit.',
          'Auf den Blumenwiesen im Norden grast ein ganz liebes Fuchspferd …',
        ],
      },
      { type: 'event', ev: 'tame', count: 1, text: 'Zähme ein wildes Pferd (langsam nähern, Apfel anbieten)', target: { wild: 'nearest' } },
      {
        type: 'talk', npc: 'hilde', text: 'Erzähl Oma Hilde von deinem neuen Pferd', target: { npc: 'hilde' },
        lines: [
          'Oh, sieh nur, wie hübsch! Es fühlt sich schon ganz wie zu Hause.',
          'Im Stall (E an der Stalltür) kannst du alle Pferde ansehen, umbenennen und dein Reitpferd wählen.',
        ],
      },
    ],
    reward: { coins: 30, items: { apple: 2 } },
  },
  {
    id: 'k2_rennen1', chapter: 2, main: true, title: 'Rennen gegen Ben', giver: 'ben', requires: ['k1_bretter'],
    desc: 'Der schüchterne Ben möchte ein kleines Rennen reiten.',
    steps: [
      {
        type: 'talk', npc: 'ben', text: 'Sprich mit Ben', target: { npc: 'ben' },
        lines: [
          'Oh, h-hallo. Ich bin Ben. Ich … zähle Frösche. Und Hasen. Und Käfer.',
          'Mia sagt, ich soll mehr rausgehen. Deshalb … würdest du ein Rennen gegen mich reiten? Ein kleines?',
          'Sprich mich einfach nochmal an, wenn du bereit bist. Mit Pferd natürlich!',
        ],
      },
      { type: 'event', ev: 'race', filter: 'race1', count: 1, text: 'Reite das Rennen gegen Ben (Ben ansprechen)', target: { npc: 'ben' } },
    ],
    reward: { coins: 30 },
  },
  {
    id: 'k2_koppel', chapter: 2, main: true, title: 'Platz für alle', giver: 'hilde', requires: ['k2_lavendel', 'k2_post', 'k2_zaehmen', 'k2_rennen1'],
    desc: 'Die Koppel ist zu klein geworden.',
    steps: [
      {
        type: 'talk', npc: 'hilde', text: 'Sprich mit Oma Hilde', target: { npc: 'hilde' },
        lines: [
          '{name}, du hast so viele Freunde gefunden – Zweibeiner und Vierbeiner!',
          'Die Koppel ist viel zu klein geworden. Und stell dir vor: Die Leute aus dem Dorf wollen helfen!',
          'Theo bringt Pfähle, Paula die Nägel, und Mia … Mia bringt gute Laune.',
          { who: 'mert', t: 'Und ich baue! Ich hab die Pfähle schon dreimal gezählt. Bis morgen früh steht die neue Koppel, versprochen.' },
        ],
      },
    ],
    reward: { coins: 40, farm: 'paddock', memory: 'paddock' },
  },
  // ---------------- Kapitel 3 ----------------
  {
    id: 'k3_parcours', chapter: 3, main: true, title: 'Über Stock und Stein', giver: 'mia', requires: ['k2_koppel'],
    desc: 'Mia will wissen, ob du springen kannst.',
    steps: [
      {
        type: 'talk', npc: 'mia', text: 'Sprich mit Mia', target: { npc: 'mia' },
        lines: [
          'Du bist also die mit den vielen Pferden! Ich bin Mia. Ich reite, seit ich laufen kann.',
          'Ben sagt, du hast ihn im Rennen besiegt. Pfff. Das kann jeder.',
          'Aber kannst du auch springen? Auf den Blumenwiesen gibt’s einen Hindernisparcours. Reite gegen die Hindernisse – oder drück die Leertaste!',
        ],
      },
      { type: 'event', ev: 'parcours', count: 1, text: 'Reite den Hindernisparcours (Tafel am Parcoursplatz)', target: { spot: 'parcours' } },
      {
        type: 'talk', npc: 'mia', text: 'Erzähl Mia von deinem Parcours', target: { npc: 'mia' },
        lines: [
          'Nicht schlecht. Gar nicht schlecht! Blitz hat gerade anerkennend gewiehert.',
          'Jetzt will ich’s aber wissen: ein Rennen am Sonnenstrand. Du gegen mich!',
        ],
      },
    ],
    reward: { coins: 30 },
  },
  {
    id: 'k3_rennen2', chapter: 3, main: true, title: 'Mias Herausforderung', giver: 'mia', requires: ['k3_parcours'],
    desc: 'Ein Rennen gegen Mia am Sonnenstrand.',
    steps: [
      { type: 'event', ev: 'race', filter: 'race2', count: 1, text: 'Rennen gegen Mia am Strand (Mia ansprechen)', target: { npc: 'mia' } },
    ],
    reward: { coins: 40 },
  },
  {
    id: 'k3_picknick', chapter: 3, main: true, title: 'Picknick am Glitzersee', giver: 'berta', requires: ['k2_koppel'],
    desc: 'Berta plant ein Picknick auf der Insel im Glitzersee.',
    steps: [
      {
        type: 'talk', npc: 'berta', text: 'Sprich mit Bäckerin Berta', target: { npc: 'berta' },
        lines: [
          '{name}, Schätzchen! Ich hab eine Idee: ein Picknick auf der Insel im Glitzersee! So wie früher mit Hilde.',
          'Bring mit: 2 Äpfel, 2 Karotten, 1 Brot und 1 Apfelsaft. Brot und Saft bekommst du bei mir oder bei Theo.',
          'Die Insel erreichst du nur zu Pferd – über die Furt am Westufer des Sees. Wir treffen uns dort!',
        ],
      },
      { type: 'event', ev: 'picnic', count: 1, text: 'Picknick auf der Insel: 2 Äpfel, 2 Karotten, 1 Brot, 1 Apfelsaft', target: { spot: 'picnic' }, needs: { apple: 2, carrot: 2, bread: 1, juice: 1 } },
    ],
    reward: { coins: 50, memory: 'picnic' },
  },
  {
    id: 'k3_samen', chapter: 3, main: true, title: 'Samen für den Blumengarten', giver: 'luise', requires: ['k3_picknick', 'k3_rennen2'],
    desc: 'Luise mischt Wundersamen für einen Blumengarten.',
    steps: [
      {
        type: 'talk', npc: 'luise', text: 'Sprich mit Schneiderin Luise', target: { npc: 'luise' },
        lines: [
          'Hilde hat erzählt, dass es auf dem Ponyhof früher einen Blumengarten gab. Oh, das wird ein Farbrausch!',
          'Bring mir 5 Mohnblumen und 3 Sonnenblumen. Dann mische ich dir die schönste Samenmischung der Welt.',
          'Sonnenblumen wachsen im Feld auf den Wiesen – oder du säst sie selbst im Garten.',
        ],
      },
      {
        type: 'deliver', npc: 'luise', items: { poppy: 5, sunflower: 3 }, text: 'Bring Luise 5 Mohnblumen und 3 Sonnenblumen', target: { npc: 'luise' },
        lines: ['Perfekt! Rot wie Kirschen, gelb wie die Sonne. Hier ist meine Wundersamen-Mischung – bring sie zu Hilde!'],
        missing: ['5 Mohnblumen und 3 Sonnenblumen, Liebes. Die Blumenwiesen sind voll davon!'],
      },
      {
        type: 'talk', npc: 'hilde', text: 'Bring die Wundersamen zu Oma Hilde', target: { npc: 'hilde' },
        lines: [
          'Luises Wundersamen! Die hat sie bestimmt mit Glitzer gemischt.',
          'Komm, wir säen sie gleich zusammen aus – neben der Koppel. Morgen blüht dort alles!',
        ],
      },
    ],
    reward: { coins: 50, farm: 'flowerGarden', memory: 'garden' },
  },
  // ---------------- Kapitel 4 ----------------
  {
    id: 'k4_nebel', chapter: 4, main: true, title: 'Nebel, das Wildpferd', giver: 'hilde', requires: ['k3_samen'],
    desc: 'Hoch in den Wolkenbergen lebt ein silbergraues Wildpferd.',
    steps: [
      {
        type: 'talk', npc: 'hilde', text: 'Sprich mit Oma Hilde', target: { npc: 'hilde' }, give: { apple: 3 },
        lines: [
          'Für das Sommerfest fehlt noch jemand. Hoch oben in den Wolkenbergen lebt ein silbergraues Wildpferd. Man nennt es Nebel.',
          'Niemand konnte es je zähmen. Aber ich glaube … dich mag es.',
          'Nimm Äpfel mit. Viele Äpfel. Und ganz viel Geduld. Der Serpentinenpfad beginnt nördlich der Blumenwiesen.',
        ],
      },
      { type: 'tame', horse: 'nebel', text: 'Zähme Nebel in den Wolkenbergen (ganz langsam!)', target: { wildId: 'nebel' } },
      {
        type: 'talk', npc: 'hilde', text: 'Erzähl Oma Hilde von Nebel', target: { npc: 'hilde' },
        lines: [
          'Nebel! Du hast es wirklich geschafft!',
          'Weißt du, Pferde spüren, ob jemand ein gutes Herz hat. Nebel hat es gespürt.',
        ],
      },
    ],
    reward: { coins: 60, memory: 'nebel' },
  },
  {
    id: 'k4_rennen3', chapter: 4, main: true, title: 'Das große Kleeberg-Rennen', giver: 'mia', requires: ['k3_samen'],
    desc: 'Mia und Ben fordern dich zum großen Rennen heraus.',
    steps: [
      {
        type: 'talk', npc: 'mia', text: 'Sprich mit Mia', target: { npc: 'mia' },
        lines: [
          'Das große Kleeberg-Rennen! Ben und ich gegen dich. Durch die Wiesen, durch den Wald und über den Hof!',
          { who: 'ben', t: 'I-ich hab trainiert. Zwei Mal!' },
          'Sprich mich an, wenn du bereit bist. Und diesmal gewinne ich!',
        ],
      },
      { type: 'event', ev: 'race', filter: 'race3', count: 1, text: 'Das große Rennen gegen Mia und Ben (Mia ansprechen)', target: { npc: 'mia' } },
    ],
    reward: { coins: 60, memory: 'race' },
  },
  {
    id: 'k4_einladung', chapter: 4, main: true, title: 'Einladungen', giver: 'hilde', requires: ['k4_nebel', 'k4_rennen3'],
    desc: 'Lade alle zum Sommerfest auf dem Ponyhof ein.',
    steps: [
      {
        type: 'talk', npc: 'hilde', text: 'Sprich mit Oma Hilde', target: { npc: 'hilde' }, give: { invite: 7 },
        lines: [
          'Es ist so weit, {name}. Das Sommerfest kehrt auf den Ponyhof zurück!',
          'Hier sind die Einladungen. Bring jedem im Dorf eine – und Kuno am Leuchtturm nicht vergessen!',
        ],
      },
      {
        type: 'talkAll', npcs: ['berta', 'luise', 'theo', 'paula', 'mia', 'ben', 'kuno'], consume: 'invite',
        text: 'Verteile die Einladungen', target: { npcAll: true },
        lines: {
          berta: ['Eine Einladung? Zum Sommerfest? Ich backe die Torte meines Lebens!'],
          luise: ['Oh! Ich nähe dir ein Festtagskleid! Es ist ab jetzt in meiner Nähstube für dich reserviert.'],
          theo: ['Hm-hm. Ich komme. Und ich bringe Limonade. Zwei Kannen. Das ist mein letztes Wort.'],
          paula: ['Eine Einladung – für mich? Normalerweise bringe ICH die Post! Zack, zack, ich komme!'],
          mia: ['JA! Und beim Festrennen reite ich vorneweg. Oder neben dir. Okay, neben dir.'],
          ben: ['Ein Fest! Mit Tieren? D-darf ich mein Tierbuch mitbringen?'],
          kuno: ['Ahoi! Ein Fest an Land? Da setz ich meine gute Mütze auf.'],
        },
      },
      {
        type: 'talk', npc: 'hilde', text: 'Erzähl Oma Hilde, dass alle kommen', target: { npc: 'hilde' },
        lines: ['Alle kommen? Oh, {name}! Dann müssen wir die Festwiese schmücken. Das wird wunderschön.'],
      },
    ],
    reward: { coins: 30, unlock: ['outfit_fest'] },
  },
  {
    id: 'k4_festwiese', chapter: 4, main: true, title: 'Die Festwiese', giver: 'hilde', requires: ['k4_einladung'],
    desc: 'Blumen für Girlanden und Blumenbögen.',
    steps: [
      {
        type: 'deliver', npc: 'hilde', items: { daisy: 5, poppy: 3, lavender: 3 }, text: 'Bring Hilde Blumen für Girlanden: 5 Gänseblümchen, 3 Mohnblumen, 3 Lavendel', target: { npc: 'hilde' },
        lines: [
          'Die schönsten Blumen der ganzen Gegend! Daraus flechten wir Girlanden und Blumenbögen.',
          'Das ganze Dorf hilft beim Schmücken. Lampions, Wimpelketten … schau nur!',
        ],
        missing: ['Für die Girlanden brauchen wir 5 Gänseblümchen, 3 Mohnblumen und 3 Lavendelsträuße.'],
      },
    ],
    reward: { coins: 40, farm: 'festival' },
  },
  {
    id: 'k4_fest', chapter: 4, main: true, title: 'Sommerfest auf dem Ponyhof', giver: 'hilde', requires: ['k4_festwiese'],
    desc: 'Das große Fest beginnt!',
    steps: [
      { type: 'talk', npc: 'hilde', text: 'Sprich mit Oma Hilde, um das Sommerfest zu beginnen', target: { npc: 'hilde' }, ending: true, lines: ['Alle sind da, {name}. Bist du bereit für das Sommerfest?'] },
    ],
    reward: {},
  },
  // ---------------- Nebenaufgaben ----------------
  {
    id: 's_pilze', chapter: 0, main: false, title: 'Pilzsuppe für Berta', giver: 'berta', requires: ['k1_kruemel'],
    offer: ['Du kennst dich jetzt im Flüsterwald aus, oder? Ich koche so gern Pilzsuppe …', 'Bringst du mir 5 Pilze? Sie wachsen dort am Wegrand.'],
    steps: [
      { type: 'deliver', npc: 'berta', items: { mushroom: 5 }, text: 'Sammle 5 Pilze im Flüsterwald', target: { x: 30, y: 80 }, lines: ['Hmmm, die duften! Heute Abend gibt’s Suppe. Hier, ein Stück Kuchen für dich!'], missing: ['5 Pilze, Schätzchen. Sie wachsen im Flüsterwald nahe der Wege.'] },
    ],
    reward: { coins: 40, items: { cake: 1 } },
  },
  {
    id: 's_muscheln', chapter: 0, main: false, title: 'Muschelknöpfe', giver: 'luise', requires: ['k2_lavendel'],
    offer: ['Ich habe eine Idee: Knöpfe aus Muscheln! Die schimmern so schön.', 'Bringst du mir 6 Muscheln vom Sonnenstrand?'],
    steps: [
      { type: 'deliver', npc: 'luise', items: { shell: 6 }, text: 'Sammle 6 Muscheln am Sonnenstrand', target: { x: 120, y: 160 }, lines: ['Wie sie glänzen! Hier, für dich: ein Sonnenhut. Den habe ich extra genäht!'], missing: ['6 Muscheln, bitte! Der Strand ist voll davon.'] },
    ],
    reward: { coins: 40, unlock: ['hat_sun'] },
  },
  {
    id: 's_aepfel', chapter: 0, main: false, title: 'Theos Apfelkiste', giver: 'theo', requires: ['k1_bretter'],
    offer: ['Hm-hm. Meine Apfelkiste ist leer. Eine Katastrophe für das Geschäft!', 'Bring mir 8 Äpfel. Die Bäume auf den Wiesen hängen voll. Ich zahle gut!'],
    steps: [
      { type: 'deliver', npc: 'theo', items: { apple: 8 }, text: 'Bring Theo 8 Äpfel', target: { npc: 'theo' }, lines: ['Prächtig! Die verkaufe ich als „Ponyhof-Äpfel“. Hier, dein Anteil!'], missing: ['8 Äpfel. Einfach unter einem Apfelbaum E drücken und schütteln.'] },
    ],
    reward: { coins: 60 },
  },
  {
    id: 's_aussicht', chapter: 0, main: false, title: 'Postkarte von oben', giver: 'paula', requires: ['k2_post'],
    offer: ['Ich wollte schon immer eine Postkarte vom Aussichtspunkt in den Wolkenbergen malen!', 'Schaust du für mich durchs Fernrohr und erzählst mir, was man sieht?'],
    steps: [
      { type: 'event', ev: 'telescope', count: 1, text: 'Schau durchs Fernrohr am Aussichtspunkt (Wolkenberge)', target: { spot: 'telescope' } },
      { type: 'talk', npc: 'paula', text: 'Erzähl Paula, was du gesehen hast', target: { npc: 'paula' }, lines: ['Den Leuchtturm? Das Meer? UND den Ponyhof? Das male ich sofort! Danke, {name}!'] },
    ],
    reward: { coins: 40, unlock: ['hat_helmet'] },
  },
  {
    id: 's_freunde', chapter: 0, main: false, title: 'Beste Freunde', giver: 'mia', requires: ['k3_parcours'],
    offer: ['Weißt du, was das Wichtigste beim Reiten ist? Freundschaft mit deinem Pferd!', 'Zeig mir ein Pferd mit Freundschaftslevel 3. Striegeln, füttern, streicheln – du weißt schon!'],
    steps: [
      { type: 'friendship', level: 3, text: 'Erreiche Freundschaftslevel 3 mit einem Pferd', target: null },
      { type: 'talk', npc: 'mia', text: 'Zeig Mia dein Pferd', target: { npc: 'mia' }, lines: ['Wow, ihr zwei versteht euch ja blind! Hier, goldene Mähnenschleifen – die hat Blitz nie getragen. Er ist zu cool dafür.'] },
    ],
    reward: { coins: 20, unlock: ['bow_gold'] },
  },
  {
    id: 's_tierbuch', chapter: 0, main: false, title: 'Bens Tierbuch', giver: 'ben', requires: ['k2_rennen1'],
    offer: ['Ich f-führe ein Tierbuch. Du hast doch auch ein Tieralbum, oder?', 'Wenn du 6 verschiedene Tierarten im Album hast, zeig’s mir!'],
    steps: [
      { type: 'album', count: 6, text: 'Trage 6 Tierarten ins Tieralbum ein (Tiere streicheln)', target: null },
      { type: 'talk', npc: 'ben', text: 'Zeig Ben dein Tieralbum', target: { npc: 'ben' }, lines: ['Sechs! Und so schön gezeichnet! Hier, das Vogelhaus hab ich selbst gebaut. Für deinen Hof!'] },
    ],
    reward: { coins: 30, deco: { birdhouse: 1 } },
  },
  {
    id: 's_licht', chapter: 0, main: false, title: 'Sonnenschein für Kuno', giver: 'kuno', requires: ['k2_post'],
    offer: ['Ahoi! Mein Leuchtturm ist so grau. Ein bisschen Sonnenschein würde ihm guttun.', 'Bringst du mir 3 Sonnenblumen? Die stell ich ins Fenster.'],
    steps: [
      { type: 'deliver', npc: 'kuno', items: { sunflower: 3 }, text: 'Bring Kuno 3 Sonnenblumen', target: { npc: 'kuno' }, lines: ['Donnerwetter, wie die strahlen! Hier, meine alte Kapitänsmütze. Die steht dir!'], missing: ['3 Sonnenblumen, Landratte! Auf den Wiesen oder aus dem Garten.'] },
    ],
    reward: { coins: 40, unlock: ['hat_captain'] },
  },
];

export const QUEST_BY_ID = Object.fromEntries(QUESTS.map((q) => [q.id, q]));
