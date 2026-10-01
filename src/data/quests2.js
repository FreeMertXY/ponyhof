// Teil 2 „Vier Jahreszeiten“: Kapitel 7–13 und neue Nebenaufgaben.
// Zusätzliche Felder gegenüber Teil 1:
//   part2: true            – erst nach dem Start von Teil 2
//   season: 'winter' …     – beim Start dieser Aufgabe wechselt die Jahreszeit (Hauptaufgaben)
//                            bzw. nur in dieser Jahreszeit angeboten (Nebenaufgaben, offerSeason)
//   step.use               – Interaktion am Ort: { at: SPOTS-Schlüssel | 'foal' | [x,y], label, run?, r? }
//                            run = Name einer Szene in scenes2.js (sonst wird das Ereignis direkt gezählt)
//   step.watch             – Bedingung, die laufend geprüft wird (z. B. Fohlen am Steg)
//   reward.foalGrow        – das Fohlen wächst (0..1)

export const CHAPTERS2 = [
  { n: 7, title: 'Herbstzauber', reward: 'Ein Hofladen am Hoftor', part: 2 },
  { n: 8, title: 'Die kleine Reitschule', reward: 'Ein Reitplatz mit Reitschule', part: 2 },
  { n: 9, title: 'Opas Schatzkarte', reward: 'Ein Schatz voller Erinnerungen', part: 2 },
  { n: 10, title: 'Winterwunderland', reward: 'Lichterglanz auf dem Hof', part: 2 },
  { n: 11, title: 'Frühlingserwachen', reward: 'Ein Meer aus Tulpen', part: 2 },
  { n: 12, title: 'Unser kleines Zuhause', reward: 'Euer eigenes Häuschen', part: 2 },
  { n: 13, title: 'Das große Jahresfest', reward: 'Ein Fest voller Lichter', part: 2 },
];

export const QUESTS2 = [
  // ======================= Kapitel 7: Herbstzauber =======================
  {
    id: 'j7_abschied', chapter: 7, main: true, part2: true, season: 'autumn', title: 'Oma Hildes große Reise', giver: 'hilde', requires: ['k4_fest'],
    desc: 'Oma Hilde hat eine Überraschung – und einen Koffer gepackt.',
    steps: [
      {
        type: 'talk', npc: 'hilde', text: 'Sprich mit Oma Hilde', target: { npc: 'hilde' },
        lines: [
          'Guten Morgen, mein Schatz! Riechst du das? Der Herbst ist da. Die Blätter werden bunt, und die Luft schmeckt nach Äpfeln.',
          'Ich muss dir etwas erzählen. Meine Schwester Gerda wohnt an der Nordsee. Seit fünfzig Jahren will ich sie besuchen – und nie hatte ich Zeit.',
          'Aber jetzt … jetzt weiß ich den Hof in den besten Händen. In deinen, {name}. Und in Merts. Ich fahre auf eine große Reise!',
          { who: 'mert', t: 'Ohne dich wird es ganz schön still hier, Hilde. Wer korrigiert jetzt, wie ich die Heugabel halte?' },
          'Ihr schafft das. Ich schreibe euch, versprochen! Schaut ab und zu in den Briefkasten.',
          'Ach, und bevor ich fahre – Berta wollte mir doch Reiseproviant einpacken. Holst du ihn für mich? Sie möchte 3 Äpfel dafür.',
        ],
      },
      {
        type: 'deliver', npc: 'berta', items: { apple: 3 }, give: { proviant: 1 }, text: 'Bring Berta 3 Äpfel für Hildes Reiseproviant', target: { npc: 'berta' },
        lines: ['Für Hildes Reise? Na klar, Schätzchen! Apfelkuchen, Butterbrote und eine Thermoskanne Kakao.', { who: 'narr', t: 'Berta packt alles in eine Dose mit Rosenmuster und bindet eine Schleife darum.' }, 'Und sag ihr, sie soll mir eine Postkarte vom Meer schicken. Mit Möwe drauf!'],
        missing: ['Für den Proviant brauche ich 3 Äpfel. Unter den Apfelbäumen einfach E drücken und schütteln!'],
      },
      {
        type: 'deliver', npc: 'hilde', items: { proviant: 1 }, text: 'Bring Oma Hilde den Reiseproviant', target: { npc: 'hilde' }, after: 'hildeLeaves',
        lines: ['Bertas Apfelkuchen! Damit überlebe ich jede Zugfahrt.', 'Dann ist es wohl so weit. Paula fährt mich mit dem Postwagen zum Bahnhof.'],
      },
    ],
    reward: { coins: 30, memory: 'abschied' },
  },
  {
    id: 'j7_woelkchen', chapter: 7, main: true, part2: true, title: '{foal} wird groß', giver: 'mert', requires: ['j7_abschied'],
    desc: 'Euer Fohlen will die Welt entdecken.',
    steps: [
      {
        type: 'talk', npc: 'mert', text: 'Sprich mit Mert', target: { npc: 'mert' },
        lines: [
          'Hast du gesehen, wie {foal} heute über die Koppel gehüpft ist? Wie ein Flummi mit vier Beinen!',
          'Fohlen in dem Alter wollen alles kennenlernen. Wir sollten mit {foal} spazieren gehen – am Halfter, damit nichts passiert.',
          'Luise näht bestimmt ein kleines Halfter, wenn du ihr ein paar Lavendelsträuße bringst. Sie liebt Lavendel!',
        ],
      },
      {
        type: 'deliver', npc: 'luise', items: { lavender: 4 }, give: { halter: 1 }, text: 'Bring Luise 4 Lavendelsträuße für ein Fohlenhalfter', target: { npc: 'luise' },
        lines: ['Ein Halfter für das Fohlen? Wie ENTZÜCKEND! Lavendelfarben natürlich. Mit kleinen Herzchen-Nieten.', { who: 'narr', t: 'Luise näht so schnell, dass die Nadel glüht.' }, 'Hier, bitte schön! Es ist weich wie eine Wolke – passend zum Namen.'],
        missing: ['4 Lavendelsträuße, Liebes! Das Lavendelfeld liegt auf den Blumenwiesen nördlich vom Hof.'],
      },
      { type: 'event', ev: 'foal_halter', count: 1, text: 'Leg {foal} das Halfter an (auf der Koppel)', target: { foal: true }, use: { at: 'foal', label: 'Halfter anlegen', run: 'foalHalter' }, hint: '{foal} ist auf der Koppel hinter dem Stall. Geh zu {foal} hin und drück E.' },
      { type: 'event', ev: 'foal_walk', count: 1, text: 'Geh mit {foal} spazieren – bis zum Steg am Glitzersee', target: { spot: 'dock' }, watch: { foalAt: 'dock', r: 4.5 }, hint: '{foal} läuft dir am Halfter hinterher. Geh zu Fuß den Weg vom Hof nach Süden bis zum Steg am Glitzersee.' },
      {
        type: 'talk', npc: 'mert', text: 'Erzähl Mert vom Spaziergang', target: { npc: 'mert' },
        lines: ['Und? Wie war’s? … Sie hat ins Wasser geguckt und sich vor ihrem Spiegelbild erschreckt? HAHA!', 'Bald ist {foal} so groß, dass du auf ihr reiten kannst. Das wird ein Tag!'],
      },
    ],
    reward: { coins: 40, memory: 'spaziergang', foalGrow: 0.3 },
  },
  {
    id: 'j7_kuerbis', chapter: 7, main: true, part2: true, title: 'Kürbiszeit', giver: 'theo', requires: ['j7_abschied'],
    desc: 'Für das Erntedankfest braucht Kleeberg Kürbisse.',
    steps: [
      {
        type: 'talk', npc: 'theo', text: 'Sprich mit Theo im Dorf', target: { npc: 'theo' }, give: { seed_pumpkin: 3 },
        lines: [
          'Hm-hm. Bald ist Erntedankfest. Und was ist ein Erntedankfest ohne Kürbisse? Ein Fest. Aber ein trauriges.',
          'Hier, 3 Kürbissamen. Pflanz sie in deinem Gemüsegarten. Kürbisse wachsen schnell, wenn man sie gießt.',
          'Warum war der Kürbis so beliebt? Er hatte einfach einen großen Kern … äh … Charakter. Hehe.',
        ],
      },
      { type: 'event', ev: 'plant', filter: 'pumpkin', count: 3, text: 'Säe 3 Kürbissamen im Gemüsegarten', target: { spot: 'garden' }, hint: 'Der Gemüsegarten liegt rechts neben dem Stall. Stell dich an ein leeres Beet und drück E.' },
      { type: 'event', ev: 'water', count: 3, text: 'Gieße die Kürbisbeete', target: { spot: 'garden' }, hint: 'Nochmal E an den gesäten Beeten drücken.' },
      { type: 'event', ev: 'harvest', filter: 'pumpkin', count: 3, text: 'Ernte 3 Kürbisse (sie wachsen, solange die Erde feucht ist)', target: { spot: 'garden' }, hint: 'Kürbisse brauchen ein paar Spielstunden. Gieß, wenn die Erde trocken ist – oder schlaf eine Nacht im Wohnhaus.' },
    ],
    reward: { coins: 30, items: { seed_pumpkin: 2 } },
  },
  {
    id: 'j7_kastanien', chapter: 7, main: true, part2: true, title: 'Kastanienmännchen', giver: 'ben', requires: ['j7_abschied'],
    desc: 'Ben möchte basteln – mit glänzenden Kastanien.',
    steps: [
      {
        type: 'talk', npc: 'ben', text: 'Sprich mit Ben im Dorf', target: { npc: 'ben' },
        lines: [
          'H-hallo {name}! W-wusstest du, dass Kastanien gar nicht essbar sind? Also, die Rosskastanien. Aber man kann super damit basteln!',
          'Ich will Kastanienmännchen bauen. Für jedes Tier in meinem Tierbuch eins! Dafür brauche ich 10 Kastanien.',
          'Unter den großen Kastanienbäumen auf den Blumenwiesen liegen ganz viele. Die erkennt man an den stacheligen grünen Kugeln.',
        ],
      },
      {
        type: 'deliver', npc: 'ben', items: { chestnut: 10 }, text: 'Sammle 10 Kastanien für Ben', target: { x: 113, y: 50 },
        lines: ['Zehn! Und so glänzend! D-danke!', { who: 'narr', t: 'Ben steckt Streichhölzer in die Kastanien. Es entstehen: ein Pferd, eine Katze, ein Igel und etwas, das Ben „Mira im Wind“ nennt.' }, 'Das hier ist für dich. Ein Kastanienmännchen mit Strohhut. Das bist du!'],
        missing: ['Es fehlen noch Kastanien. Sie liegen unter den Kastanienbäumen auf den Blumenwiesen – da, wo die stacheligen Kugeln hängen.'],
      },
    ],
    reward: { coins: 25, deco: { chestnutman: 1 } },
  },
  {
    id: 'j7_igel', chapter: 7, main: true, part2: true, title: 'Stachelchen', giver: 'mert', requires: ['j7_abschied'],
    desc: 'Mira hat im Laub etwas Kleines, Stacheliges gefunden.',
    steps: [
      {
        type: 'talk', npc: 'mert', text: 'Sprich mit Mert', target: { npc: 'mert' },
        lines: [
          'Mira bellt seit einer Viertelstunde den Laubhaufen hinter dem Stall an. Ich glaube, da wohnt jemand drin.',
          'Schau doch mal nach – aber vorsichtig. Wenn es ein Drache ist, schreist du laut, okay?',
        ],
      },
      { type: 'event', ev: 'find_hedgehog', count: 1, text: 'Schau im Laubhaufen hinter dem Stall nach', target: { spot: 'leafpile' }, use: { at: 'leafpile', label: 'Im Laub nachsehen', run: 'findHedgehog' }, hint: 'Der Laubhaufen liegt direkt hinter (über) dem Stall. Geh um den Stall herum und drück E am Laubhaufen.' },
      {
        type: 'talk', npc: 'ella', text: 'Bring den kleinen Igel zur Tierärztin Ella (Kleeberg, Nordosten)', target: { npc: 'ella' },
        lines: [
          'Hallo! Ich bin Ella, die neue Tierärztin in Kleeberg. Was hast du denn da Kleines?',
          'Ein Igelbaby! Ganz schön leicht für den Herbst. Mit so wenig Gewicht kommt es nicht durch den Winter.',
          { who: 'narr', t: 'Ella untersucht den kleinen Igel ganz behutsam. Er schnüffelt an ihrem Stethoskop.' },
          'Gesund ist er. Er braucht nur ein warmes Zuhause, viel Futter und Ruhe. Wie wäre es mit einem Igelhaus auf deinem Hof?',
          'Ein bisschen Holz und Heu – mehr braucht es nicht. Und einen Namen natürlich!',
        ],
        after: 'nameHedgehog',
      },
      {
        type: 'deliver', npc: 'mert', items: { boards: 1, hay: 1 }, text: 'Bring Mert 1 Brett und 1 Heu für das Igelhaus', target: { npc: 'mert' },
        lines: ['Ein Igelhaus? Ich bin dabei! Mit Laubdach und Schild. „Hier wohnt {hedgehog}. Bitte nicht stören.“', { who: 'narr', t: 'Mert hämmert, Mira schaut zu, und der kleine Igel schläft in deiner Jackentasche.' }],
        missing: ['1 Brett und 1 Heu – beides gibt es bei Theo im Laden.'],
      },
    ],
    reward: { coins: 40, farm: 'igelhaus', memory: 'igel' },
  },
  {
    id: 'j7_laub', chapter: 7, main: true, part2: true, title: 'Laubhaufen-Liebe', giver: 'mert', requires: ['j7_igel'],
    desc: 'Mert hat den größten Laubhaufen der Welt geharkt.',
    steps: [
      {
        type: 'talk', npc: 'mert', text: 'Sprich mit Mert', target: { npc: 'mert' },
        lines: [
          'Ich hab den ganzen Hof geharkt. Den GANZEN. Schau dir den Laubhaufen hinter dem Gemüsegarten an!',
          'Weißt du, was man mit so einem Laubhaufen macht? Genau. Komm mit!',
        ],
      },
      { type: 'event', ev: 'leafjump', count: 1, text: 'Spring mit Mert in den großen Laubhaufen (hinter dem Gemüsegarten)', target: { spot: 'leafbig' }, use: { at: 'leafbig', label: 'In den Laubhaufen springen', run: 'leafJump' }, hint: 'Der riesige Laubhaufen liegt oberhalb vom Gemüsegarten. Stell dich davor und drück E.' },
    ],
    reward: { coins: 20, memory: 'laub' },
  },
  {
    id: 'j7_erntedank', chapter: 7, main: true, part2: true, title: 'Das Erntedankfest', giver: 'berta', requires: ['j7_kuerbis', 'j7_kastanien', 'j7_igel'],
    desc: 'Kleeberg feiert die Ernte – mit Laternen und Musik.',
    steps: [
      {
        type: 'talk', npc: 'berta', text: 'Sprich mit Berta', target: { npc: 'berta' },
        lines: [
          'Schätzchen! Heute Abend ist Erntedankfest auf dem Marktplatz! Laternen, Kürbissuppe, Musik – und Tanzen!',
          'Für die Suppe brauche ich deine 3 Kürbisse. Und Theo braucht 6 Äpfel für seinen Apfelpunsch.',
        ],
      },
      {
        type: 'deliver', npc: 'berta', items: { pumpkin: 3 }, text: 'Bring Berta 3 Kürbisse für die Suppe', target: { npc: 'berta' },
        lines: ['Was für Prachtkürbisse! Daraus wird die beste Kürbissuppe, die Kleeberg je gelöffelt hat.'],
        missing: ['3 Kürbisse brauche ich. Die wachsen in deinem Gemüsegarten.'],
      },
      {
        type: 'deliver', npc: 'theo', items: { apple: 6 }, text: 'Bring Theo 6 Äpfel für den Apfelpunsch', target: { npc: 'theo' },
        lines: ['Hm-hm. Sechs Äpfel, sechs Becher Punsch. Mathematik ist was Schönes.'],
        missing: ['6 Äpfel bitte. Die Apfelbäume auf dem Hof und den Wiesen hängen voll.'],
      },
      { type: 'event', ev: 'harvestfest', count: 1, text: 'Eröffne das Erntedankfest auf dem Marktplatz', target: { spot: 'show' }, use: { at: 'show', label: 'Das Fest eröffnen', run: 'harvestFest' }, hint: 'Geh zum Marktplatz in Kleeberg, direkt unterhalb des Brunnens, und drück E.' },
    ],
    reward: { coins: 60, farm: 'farmshop', memory: 'erntedank' },
  },

  // ======================= Kapitel 8: Die kleine Reitschule =======================
  {
    id: 'j8_lotte', chapter: 8, main: true, part2: true, title: 'Lotte', giver: 'mia', requires: ['j7_erntedank', 'j7_laub', 'j7_woelkchen'],
    desc: 'Mias kleine Cousine liebt Pferde – aber sie traut sich nicht.',
    steps: [
      {
        type: 'talk', npc: 'mia', text: 'Sprich mit Mia', target: { npc: 'mia' },
        lines: [
          'Hey {name}! Meine kleine Cousine Lotte wohnt jetzt bei uns in Kleeberg. Sie malt den ganzen Tag Pferde. Wirklich den GANZEN Tag.',
          'Aber wenn sie ein echtes Pferd sieht, versteckt sie sich hinter mir. Kannst du nicht mit ihr reden? Du bist so gut mit … allem.',
          'Sie wohnt im blauen Haus ganz im Südosten vom Dorf.',
        ],
      },
      {
        type: 'talk', npc: 'lotte', text: 'Sprich mit Lotte (blaues Haus im Südosten von Kleeberg)', target: { npc: 'lotte' }, onTalk: 'lotteToFarm',
        lines: [
          { who: 'narr', t: 'Ein kleines Mädchen mit gelber Regenjacke schaut dich mit großen Augen an.' },
          'Ähm … hallo. Bist du die mit dem Ponyhof? Die mit den ganz vielen Pferden?',
          'Ich … ich hab Pferde so lieb. Aber sie sind so GROSS. Und sie schnauben so laut.',
          'Darf ich … darf ich vielleicht mal mitkommen? Nur gucken. Nicht anfassen. Vielleicht.',
        ],
      },
      {
        type: 'talk', npc: 'lotte', text: 'Triff Lotte auf deinem Hof (am Koppeltor)', target: { npc: 'lotte' }, after: 'lottePet',
        lines: ['Ich bin schon da! Ich bin den ganzen Weg gerannt. Mein Herz klopft so doll.', 'Welches Pferd ist das liebste? Das allerliebste?'],
      },
    ],
    reward: { coins: 30 },
  },
  {
    id: 'j8_reitplatz', chapter: 8, main: true, part2: true, title: 'Ein Reitplatz entsteht', giver: 'mert', requires: ['j8_lotte'],
    desc: 'Für Reitstunden braucht ihr einen sicheren Platz.',
    steps: [
      {
        type: 'talk', npc: 'mert', text: 'Sprich mit Mert', target: { npc: 'mert' },
        lines: [
          'Du willst Lotte Reitstunden geben? {name}, das ist die beste Idee seit … seit unserem Picknick!',
          'Wir brauchen einen richtigen Reitplatz. Mit weichem Sand, damit niemand sich wehtut, und einem weißen Zaun.',
          'Ich brauche 6 Bretter von Theo und 3 Eimer Sand vom Sonnenstrand. An der Sandkuhle östlich vom Leuchtturmweg kannst du schaufeln.',
        ],
      },
      {
        type: 'deliver', npc: 'mert', items: { boards: 6, sand: 3 }, text: 'Bring Mert 6 Bretter und 3 Eimer Sand', target: { npc: 'mert' },
        lines: ['Sechs Bretter, drei Eimer Sand und eine Freundin, die alles schafft. Los geht’s!'],
        missing: ['6 Bretter (bei Theo) und 3 Eimer Sand (Sandkuhle am Sonnenstrand, dort E drücken).'],
      },
    ],
    reward: { coins: 40, farm: 'arena', memory: 'reitplatz' },
  },
  {
    id: 'j8_stunde1', chapter: 8, main: true, part2: true, title: 'Die erste Reitstunde', giver: 'lotte', requires: ['j8_reitplatz'],
    desc: 'Lotte sitzt zum ersten Mal auf einem Pferd.',
    steps: [
      {
        type: 'talk', npc: 'lotte', text: 'Sprich mit Lotte am Reitplatz (südlich der Festwiese)', target: { npc: 'lotte' },
        lines: ['Ich hab meinen Fahrradhelm mitgebracht. Der zählt doch auch, oder?', 'Du führst das Pferd, und ich sitze nur. Ganz langsam. Versprochen?'],
      },
      { type: 'event', ev: 'lesson', filter: 'l1', count: 1, text: 'Führe Lotte im Schritt um alle Pylonen (Schild am Reitplatz)', target: { spot: 'arenaBoard' }, use: { at: 'arenaBoard', label: 'Reitstunde beginnen', run: 'lesson', arg: 'l1' }, hint: 'Drück am Reitstunden-Schild E. Dann gehst du zu Fuß zu jedem leuchtenden Pylon – das Pony mit Lotte folgt dir am Strick.' },
      {
        type: 'talk', npc: 'lotte', text: 'Sprich mit Lotte', target: { npc: 'lotte' },
        lines: ['Ich hab REITEN! Also, ich wurde geritten. Also, ich bin gesessen und das Pferd ist gelaufen!', 'Das war das Allerschönste in meinem ganzen Leben. Bis jetzt.'],
      },
    ],
    reward: { coins: 30 },
  },
  {
    id: 'j8_mut', chapter: 8, main: true, part2: true, title: 'Ein Glücksklee für Lotte', giver: 'lotte', requires: ['j8_stunde1'],
    desc: 'Für den Trab braucht Lotte ein bisschen Glück.',
    steps: [
      {
        type: 'talk', npc: 'lotte', text: 'Sprich mit Lotte', target: { npc: 'lotte' },
        lines: [
          'Mia sagt, als Nächstes kommt Traben. Das ruckelt. Ich hab Angst vorm Ruckeln.',
          'Oma sagt, ein vierblättriges Kleeblatt bringt Glück. Wenn ich eins hätte, wäre ich bestimmt mutig.',
          'Es gibt ganz viele hier in der Gegend. Aber sie sind gut versteckt. Kann Mira die nicht erschnüffeln?',
        ],
      },
      { type: 'event', ev: 'clover', count: 1, text: 'Finde ein vierblättriges Kleeblatt (Mira hilft beim Suchen)', target: { clover: 'nearest' }, hint: 'Überall in der Gegend sind 20 Glücksklee-Blätter versteckt. Der Pfeil zeigt zum nächsten, und Mira bellt, wenn eins in der Nähe ist. Einfach drüberlaufen!' },
      {
        type: 'talk', npc: 'lotte', text: 'Bring Lotte das Kleeblatt', target: { npc: 'lotte' },
        lines: ['Ein echtes vierblättriges! Eins, zwei, drei, VIER!', { who: 'narr', t: 'Lotte steckt das Kleeblatt vorsichtig in ihren Helm.' }, 'Jetzt bin ich mutig. Glaub ich. Ja! Ich bin mutig!'],
      },
      { type: 'event', ev: 'lesson', filter: 'l2', count: 1, text: 'Zweite Reitstunde: Slalom mit Lotte (Schild am Reitplatz)', target: { spot: 'arenaBoard' }, use: { at: 'arenaBoard', label: 'Reitstunde beginnen', run: 'lesson', arg: 'l2' }, hint: 'Wieder am Reitstunden-Schild E drücken und das Pony mit Lotte durch alle Pylonen führen.' },
    ],
    reward: { coins: 30, memory: 'reitstunde' },
  },
  {
    id: 'j8_ben', chapter: 8, main: true, part2: true, title: 'Ben traut sich', giver: 'ben', requires: ['j8_stunde1'],
    desc: 'Auch Ben möchte reiten lernen.',
    steps: [
      {
        type: 'talk', npc: 'ben', text: 'Sprich mit Ben', target: { npc: 'ben' },
        lines: [
          'I-ich hab gehört, du gibst Reitstunden. Lotte hat es ALLEN erzählt. Sogar dem Briefträger. Also Paula.',
          'Ich reite ja auf Wolke beim Rennen. Aber ehrlich gesagt hab ich immer die Augen zu, wenn es schnell wird.',
          'Kannst du mir zeigen, wie man ruhig bleibt? Ich komme zum Reitplatz!',
        ],
      },
      { type: 'event', ev: 'lesson', filter: 'b1', count: 1, text: 'Reitstunde mit Ben am Reitplatz', target: { spot: 'arenaBoard' }, use: { at: 'arenaBoard', label: 'Reitstunde mit Ben', run: 'lesson', arg: 'b1' }, hint: 'Am Reitstunden-Schild E drücken. Ben reitet diesmal Wolke – du führst ihn um die Pylonen.' },
      {
        type: 'talk', npc: 'ben', text: 'Sprich mit Ben', target: { npc: 'ben' },
        lines: ['Ich hatte die Augen offen. Die ganze Zeit! Na gut, fast die ganze Zeit.', 'Das schreib ich in mein Buch. Unter „Mutproben, bestanden“. Hier – Mia und ich haben dir was genäht. Na gut, Luise hat es genäht.'],
      },
    ],
    reward: { coins: 30, unlock: ['outfit_reit'] },
  },
  {
    id: 'j8_abzeichen', chapter: 8, main: true, part2: true, title: 'Das Reitabzeichen', giver: 'mia', requires: ['j8_mut', 'j8_ben'],
    desc: 'Ein kleines Turnier für die tapfersten Reitkinder.',
    steps: [
      {
        type: 'talk', npc: 'mia', text: 'Sprich mit Mia', target: { npc: 'mia' },
        lines: [
          'Lotte und Ben sind so gut geworden! Wir sollten ein kleines Turnier machen. Mit Abzeichen! Wie bei den Großen!',
          'Luise kann Ehrenschleifen nähen. Sie braucht aber Blumen für die Rosetten – 3 Lavendel, sagt sie.',
        ],
      },
      {
        type: 'deliver', npc: 'luise', items: { lavender: 3 }, give: { rosette: 3 }, text: 'Bring Luise 3 Lavendelsträuße für die Reitabzeichen', target: { npc: 'luise' },
        lines: ['Reitabzeichen! Mit Lavendelrosette und Goldrand. Ich hab schon Gänsehaut.', { who: 'narr', t: 'Luise gibt dir drei wunderschöne Ehrenschleifen.' }],
        missing: ['3 Lavendelsträuße, dann nähe ich die schönsten Rosetten der Welt!'],
      },
      { type: 'event', ev: 'badge_show', count: 1, text: 'Starte das kleine Turnier am Reitplatz', target: { spot: 'arenaBoard' }, use: { at: 'arenaBoard', label: 'Turnier starten', run: 'badgeShow' }, hint: 'Geh zum Reitplatz südlich der Festwiese und drück am Schild E.' },
    ],
    reward: { coins: 60, farm: 'school', memory: 'abzeichen' },
  },

  // ======================= Kapitel 9: Opas Schatzkarte =======================
  {
    id: 'j9_dachboden', chapter: 9, main: true, part2: true, title: 'Die alte Truhe', giver: 'mert', requires: ['j8_abzeichen'],
    desc: 'Auf dem Heuboden wartet ein Geheimnis.',
    steps: [
      {
        type: 'talk', npc: 'mert', text: 'Sprich mit Mert', target: { npc: 'mert' },
        lines: [
          'Ich wollte den Heuboden aufräumen. Für den Winter. Und weißt du, was ich gefunden habe?',
          'Eine alte Holztruhe! Mit einem K und einem H drauf. In ein Herz geschnitzt.',
          'Ich hab sie nicht aufgemacht. Das solltest du tun. Sie steht oben im Stall, gleich über der Tür.',
        ],
      },
      { type: 'event', ev: 'attic', count: 1, text: 'Öffne die alte Truhe im Stall', target: { spot: 'attic' }, use: { at: 'attic', label: 'Die Truhe öffnen', run: 'atticChest' }, hint: 'Die Truhe steht im Stall. Stell dich vor die Stalltür und drück E.' },
      {
        type: 'talk', npc: 'berta', text: 'Frag Berta nach Opa Karl', target: { npc: 'berta' },
        lines: [
          'Karls Schatzkarte? Ach, du meine Güte … DIE Karte!',
          'Karl hat Hilde damals einen Schatz versteckt. Er hat die Karte zerrissen und die Stücke an ihren Lieblingsorten versteckt. Ein Rätsel für sie.',
          'Aber dann kam so viel dazwischen – die Arbeit, der Hof … Hilde hat die Stücke nie gesucht. Ich glaube, sie hat es ganz vergessen.',
          'Ein Stück hat Kuno am Leuchtturm. Eins liegt auf der Insel im Glitzersee. Und das dritte … frag Paula. Sie hat Karls alte Postkarten.',
        ],
      },
    ],
    reward: { coins: 20 },
  },
  {
    id: 'j9_leuchtturm', chapter: 9, main: true, part2: true, title: 'Sieben Schritte zum Meer', giver: 'kuno', requires: ['j9_dachboden'],
    desc: 'Kuno erinnert sich an ein altes Versprechen.',
    steps: [
      {
        type: 'talk', npc: 'kuno', text: 'Sprich mit Kuno am Leuchtturm', target: { npc: 'kuno' },
        lines: [
          'Ahoi! Karl Hansens Karte? Donnerwetter, die Geschichte kenne ich!',
          'Karl hat damals gesagt: „Kuno, sieben Schritte vom Leuchtturm Richtung Meer. Da grab ich was ein. Und du verrätst es nur dem, der mit meiner Truhe kommt.“',
          'Und du kommst mit seiner Truhe. Also los, Landratte – sieben Schritte nach Süden, Richtung Wellen!',
        ],
      },
      { type: 'event', ev: 'dig', filter: 'leuchtturm', count: 1, text: 'Grab sieben Schritte vom Leuchtturm Richtung Meer', target: { spot: 'dig_leuchtturm' }, use: { at: 'dig_leuchtturm', label: 'Graben', run: 'dig', arg: 'leuchtturm' }, hint: 'Die Stelle liegt im Sand direkt südlich vom Leuchtturm, nahe am Wasser. Der Pfeil zeigt hin – dort E drücken.' },
    ],
    reward: { coins: 30 },
  },
  {
    id: 'j9_insel', chapter: 9, main: true, part2: true, title: 'Die Insel im Glitzersee', giver: 'berta', requires: ['j9_dachboden'],
    desc: 'Auf der Insel hat Karl damals Hilde gefragt, ob sie ihn heiratet.',
    steps: [
      {
        type: 'talk', npc: 'berta', text: 'Sprich mit Berta', target: { npc: 'berta' },
        lines: [
          'Die Insel im Glitzersee war Hildes und Karls Ort. Dort hat er sie gefragt, ob sie ihn heiratet. Mit einem Ring aus Gänseblümchen!',
          'Ich wette, ein Kartenstück liegt unter dem Blütenbaum auf der Insel. Reite durch die Furt am Westufer – zu Fuß ist das Wasser zu tief.',
        ],
      },
      { type: 'event', ev: 'dig', filter: 'insel', count: 1, text: 'Grab auf der Insel im Glitzersee (nur zu Pferd erreichbar)', target: { spot: 'dig_insel' }, use: { at: 'dig_insel', label: 'Graben', run: 'dig', arg: 'insel' }, hint: 'Die Furt zur Insel beginnt am Westufer des Sees (Wegweiser „Furt zur Insel“). Reite hindurch und grab unter dem Blütenbaum.' },
    ],
    reward: { coins: 30 },
  },
  {
    id: 'j9_berge', chapter: 9, main: true, part2: true, title: 'Das Echo der Wolkenberge', giver: 'paula', requires: ['j9_dachboden'],
    desc: 'Eine alte Postkarte führt in die Berge.',
    steps: [
      {
        type: 'talk', npc: 'paula', text: 'Sprich mit Paula', target: { npc: 'paula' },
        lines: [
          'Zack, zack – Karls Postkarten? Die hab ich im Archiv! Hier: „Liebe Hilde, am Bergsee ruft das Echo deinen Namen zurück. K.“',
          'Der Bergsee ist ganz oben in den Wolkenbergen, westlich vom Aussichtspunkt. Da gibt es einen Felsen mit einem Herz drauf. Ich war mal dort. Mit dem Fahrrad. Bergauf. Nie wieder.',
        ],
      },
      { type: 'event', ev: 'echo', count: 1, text: 'Ruf am Herzfelsen beim Bergsee in den Wolkenbergen', target: { spot: 'echo' }, use: { at: 'echo', label: 'Laut rufen', run: 'echo' }, hint: 'Der Bergsee liegt im Westen der Wolkenberge. Nimm den Serpentinenpfad hinauf, dann am Wegweiser nach links (Alpakaweide) und weiter nach Westen.' },
      { type: 'event', ev: 'dig', filter: 'berge', count: 1, text: 'Grab am Herzfelsen', target: { spot: 'echo' }, use: { at: 'echo', label: 'Graben', run: 'dig', arg: 'berge' }, hint: 'Direkt am Herzfelsen E drücken.' },
    ],
    reward: { coins: 30 },
  },
  {
    id: 'j9_schatz', chapter: 9, main: true, part2: true, title: 'Der Schatz', giver: 'mert', requires: ['j9_leuchtturm', 'j9_insel', 'j9_berge'],
    desc: 'Vier Kartenstücke – und ein X.',
    steps: [
      {
        type: 'talk', npc: 'mert', text: 'Zeig Mert die vier Kartenstücke', target: { npc: 'mert' },
        lines: [
          'Alle vier Stücke? Zeig her! Wir legen sie zusammen …',
          { who: 'narr', t: 'Die Ränder passen genau ineinander. Eine Karte der ganzen Gegend – und mitten auf dem Hügel hinter eurem Hof: ein rotes X und ein kleines Herz.' },
          'Der Hügel! Unser Hügel! Unter dem großen Blütenbaum! Komm, schnell!',
        ],
      },
      { type: 'event', ev: 'dig', filter: 'schatz', count: 1, text: 'Grab den Schatz unter dem Blütenbaum auf dem Hügel aus', target: { spot: 'dig_schatz' }, use: { at: 'dig_schatz', label: 'Den Schatz ausgraben', run: 'treasure' }, hint: 'Der Hügel mit dem großen Blütenbaum liegt südlich der Festwiese. Grab direkt unter dem Baum.' },
      { type: 'event', ev: 'hilde_letter', count: 1, text: 'Schreib Oma Hilde einen Brief (Briefkasten am Wohnhaus)', target: { spot: 'mailbox' }, use: { at: 'mailbox', label: 'Brief an Hilde schreiben', run: 'writeHilde' }, hint: 'Der Briefkasten steht links neben dem Wohnhaus. Dort E drücken.' },
    ],
    reward: { coins: 80, deco: { musicbox: 1 }, unlock: ['saddle_karl'], memory: 'schatz' },
  },

  // ======================= Kapitel 10: Winterwunderland =======================
  {
    id: 'j10_schnee', chapter: 10, main: true, part2: true, season: 'winter', title: 'Der erste Schnee', giver: 'mert', requires: ['j9_schatz'],
    desc: 'Über Nacht ist alles weiß geworden.',
    steps: [
      {
        type: 'talk', npc: 'mert', text: 'Sprich mit Mert', target: { npc: 'mert' },
        lines: [
          'SCHNEE! {name}, es hat geschneit! Alles ist weiß! Mira hüpft wie ein Känguru durch den Hof!',
          'Weißt du, was das heißt? SCHNEEMANN! Der größte Schneemann, den Kleeberg je gesehen hat.',
          'Rechts neben dem Hofweg, bei den Blumen, ist der Schnee am besten. Roll drei Kugeln – ich such schon mal eine Karotte für die Nase.',
        ],
      },
      { type: 'event', ev: 'snowball', count: 3, text: 'Roll 3 Schneekugeln für den Schneemann', target: { spot: 'snowman' }, use: { at: 'snowman', label: 'Schneekugel rollen', run: 'snowball' }, hint: 'Die Stelle liegt rechts am Hofweg, kurz vor dem Hoftor. Drück dort dreimal E.' },
      {
        type: 'talk', npc: 'mert', text: 'Hol Mert zum Schneemann', target: { npc: 'mert' }, after: 'snowballFight',
        lines: ['Fertig? Zeig her! Oh … er hat ja schon eine Karotte. Und einen Schal! Dann geb ich ihm … meine Mütze. Für die Kunst.'],
      },
    ],
    reward: { coins: 30, memory: 'schneemann', foalGrow: 0.6 },
  },
  {
    id: 'j10_wolle', chapter: 10, main: true, part2: true, title: 'Alpakawolle', giver: 'luise', requires: ['j9_schatz'],
    desc: 'Warme Decken für kalte Tage.',
    steps: [
      {
        type: 'talk', npc: 'luise', text: 'Sprich mit Luise', target: { npc: 'luise' },
        lines: [
          'Brrr! Deine Pferde brauchen Winterdecken, Liebes. Und du brauchst eine Mütze. Und Mira – Mira braucht einen Pullover!',
          'Die weichste Wolle der Welt haben die Alpakas in den Wolkenbergen. Wenn du sie bürstest, geben sie dir ein bisschen ab. Bring mir 3 Bündel!',
        ],
      },
      { type: 'event', ev: 'alpaca_brush', count: 3, text: 'Bürste 3 Alpakas auf der Alpakaweide (Wolkenberge)', target: { spot: 'alpacas' }, hint: 'Die Alpakaweide liegt in den Wolkenbergen: Serpentinenpfad hinauf, am Wegweiser nach links. Stell dich zu einem Alpaka und drück E.' },
      {
        type: 'deliver', npc: 'luise', items: { wool: 3 }, text: 'Bring Luise 3 Bündel Alpakawolle', target: { npc: 'luise' },
        lines: ['So weich! Wie eine Wolke, die gekämmt wurde.', { who: 'narr', t: 'Luises Nähmaschine rattert die ganze Nacht.' }, 'Hier: eine Winterdecke für dein Pferd, eine Bommelmütze und ein Wintermantel für dich – und ein klitzekleiner Pullover für Mira!', 'Zieh dich warm an! Mütze und Mantel findest du in deiner Tasche unter „Kleidung“.'],
        missing: ['3 Bündel Alpakawolle, Liebes. Die Alpakas wohnen in den Wolkenbergen.'],
        after: 'miraSweater',
      },
    ],
    reward: { coins: 20, unlock: ['blanket_winter', 'hat_beanie', 'outfit_winter'] },
  },
  {
    id: 'j10_futter', chapter: 10, main: true, part2: true, title: 'Futter für den Winterwald', giver: 'ben', requires: ['j9_schatz'],
    desc: 'Unter dem Schnee finden die Rehe nichts zu fressen.',
    steps: [
      {
        type: 'talk', npc: 'ben', text: 'Sprich mit Ben', target: { npc: 'ben' },
        lines: [
          'W-wusstest du, dass Rehe im Winter ganz wenig Energie haben? Sie stehen im Schnee und finden kaum Futter.',
          'Im Flüsterwald gibt es eine alte Futterkrippe. Auf der kleinen Lichtung südlich vom großen Waldweg. Aber sie ist leer.',
          'Wenn du 3 Heu und 3 Karotten hineinlegst, kommen die Rehe bestimmt! Ich hab gelesen, dass sie Karotten lieben.',
        ],
      },
      { type: 'event', ev: 'feed_rack', count: 1, text: 'Füll die Futterkrippe im Flüsterwald (3 Heu, 3 Karotten)', target: { spot: 'rack' }, needs: { hay: 3, carrot: 3 }, use: { at: 'rack', label: 'Futterkrippe füllen', run: 'feedRack' }, hint: 'Die Krippe steht auf einer kleinen Lichtung im südöstlichen Flüsterwald. Vom Hof nach Westen über die Brücke, dann am Wegweiser Richtung Glitzersee. Heu und Karotten gibt es bei Theo.' },
    ],
    reward: { coins: 40, memory: 'futterkrippe' },
  },
  {
    id: 'j10_eis', chapter: 10, main: true, part2: true, title: 'Schlittschuhe auf dem Glitzersee', giver: 'mert', requires: ['j10_schnee'],
    desc: 'Der Glitzersee ist zugefroren!',
    steps: [
      {
        type: 'talk', npc: 'mert', text: 'Sprich mit Mert', target: { npc: 'mert' },
        lines: [
          'Der Glitzersee ist komplett zugefroren! Ich hab auf dem Dachboden zwei Paar Schlittschuhe gefunden. Eins für dich, eins für mich.',
          'Mira hab ich schon eins angezogen. War ein Witz. Sie rutscht trotzdem wie ein Profi.',
          'Auf dem Eis glitzern überall kleine Eiskristalle. Sammel fünf, dann treffen wir uns in der Mitte des Sees. Zu Fuß – Pferde rutschen auf Eis!',
        ],
      },
      { type: 'event', ev: 'icestar', count: 5, text: 'Sammle 5 Eiskristalle auf dem zugefrorenen See (zu Fuß)', target: { icestar: 'nearest' }, hint: 'Steig ab (R) und lauf aufs Eis. Auf Eis rutschst du ein bisschen! Die Kristalle glitzern auf dem See – einfach drüberlaufen.' },
      { type: 'event', ev: 'skate_mert', count: 1, text: 'Triff Mert in der Mitte des Sees', target: { spot: 'icecenter' }, use: { at: 'icecenter', label: 'Mit Mert eislaufen', run: 'skateMert' }, hint: 'Lauf zur Mitte des zugefrorenen Glitzersees und drück dort E.' },
    ],
    reward: { coins: 40, memory: 'eis' },
  },
  {
    id: 'j10_markt', chapter: 10, main: true, part2: true, title: 'Weihnachtsmarkt in Kleeberg', giver: 'theo', requires: ['j10_wolle', 'j10_futter'],
    desc: 'Lichter, Plätzchen und ein großer Baum.',
    steps: [
      {
        type: 'talk', npc: 'theo', text: 'Sprich mit Theo', target: { npc: 'theo' },
        lines: [
          'Hm-hm. Der Weihnachtsmarkt ist aufgebaut. Aber es fehlt das Wichtigste: der Baum!',
          'Ich habe in den Wolkenbergen eine Tanne reserviert. Mit roter Schleife. Die schönste Tanne der Welt. Hab sie selbst ausgesucht. Im Sommer. Mit Fernglas.',
          'Dein Pferd ist stark genug, um sie herzuziehen. Sie steht östlich der Alpakaweide, nicht weit vom Bergpfad.',
        ],
      },
      { type: 'event', ev: 'fetch_tree', count: 1, text: 'Hol die Tanne mit der roten Schleife aus den Wolkenbergen (zu Pferd)', target: { spot: 'firtree' }, use: { at: 'firtree', label: 'Tanne mitnehmen', run: 'fetchTree', r: 2.8 }, hint: 'Die Tanne mit der roten Schleife steht in den Wolkenbergen westlich vom Bergpfad, kurz unterhalb der Alpakaweide. Reite hin und drück E.' },
      {
        type: 'deliver', npc: 'luise', items: { pinecone: 6 }, text: 'Bring Luise 6 Tannenzapfen für den Baumschmuck', target: { npc: 'luise' },
        lines: ['Tannenzapfen! Ich bemale sie mit Gold und Glitzer. Der Baum wird ENTZÜCKEND.'],
        missing: ['6 Tannenzapfen, Liebes. Im Winter liegen sie im Flüsterwald an den Wegen – dort, wo im Sommer die Pilze wachsen.'],
      },
      {
        type: 'talk', npc: 'berta', text: 'Back mit Berta Plätzchen', target: { npc: 'berta' }, give: { cookies: 10 },
        lines: [
          'Plätzchenzeit! Komm rein, Schätzchen, schürz dir die Ärmel hoch!',
          { who: 'narr', t: 'Ihr rollt Teig aus und stecht Herzen, Sterne und Pferdchen aus. Krümel klaut ein Stück Teig. Berta tut so, als hätte sie es nicht gesehen.' },
          'Zehn Tüten Plätzchen! Für jeden in Kleeberg eine. Verschenk sie doch – Weihnachten ist zum Verschenken da.',
        ],
      },
    ],
    reward: { coins: 40 },
  },
  {
    id: 'j10_geschenke', chapter: 10, main: true, part2: true, title: 'Geschenke für alle', giver: 'mert', requires: ['j10_markt'],
    desc: 'Plätzchen für jeden in Kleeberg.',
    steps: [
      {
        type: 'talkAll', npcs: ['berta', 'luise', 'theo', 'paula', 'mia', 'ben', 'kuno', 'lotte', 'ella'], consume: 'cookies', text: 'Verschenk Plätzchen an alle in Kleeberg', target: { npcAll: true },
        lines: {
          berta: ['Plätzchen für MICH? Von meinen eigenen Plätzchen? Du bist ein Schatz!'],
          luise: ['Herzchenform! Wie entzückend! Ich esse sie nicht, ich hänge sie an den Baum.'],
          theo: ['Hm-hm. Sterne. Meine Lieblingsform. Danke, {name}. Wirklich.'],
          paula: ['Zack, zack – Energie für die Weihnachtspost! Danke!'],
          mia: ['Plätzchen! Eins für mich, eins für Blitz, eins für mich.'],
          ben: ['D-das Pferdchen sieht aus wie Wolke! Das esse ich nie. Na gut, vielleicht später.'],
          kuno: ['Ahoi! Plätzchen auf hoher See … also, im Leuchtturm. Das beste Geschenk seit Jahren!'],
          lotte: ['Für mich? Ich hab dir auch was gemalt! Ein Pferd. Und dich. Du bist die mit dem Herz.'],
          ella: ['Wie lieb! Die teile ich mit Stachelchen – also, nur die Rosinen. Igel mögen keine Plätzchen.'],
        },
      },
    ],
    reward: { coins: 50 },
  },
  {
    id: 'j10_winterfest', chapter: 10, main: true, part2: true, title: 'Der Winterabend', giver: 'mert', requires: ['j10_eis', 'j10_geschenke'],
    desc: 'Mert plant eine Überraschung.',
    steps: [
      {
        type: 'talk', npc: 'mert', text: 'Sprich mit Mert', target: { npc: 'mert' },
        lines: [
          'Heute Abend ist Winterfest auf dem Hof. Alle kommen! Ich hab Lichterketten aufgehängt. Viele. Sehr viele. Ich bin zweimal von der Leiter gefallen.',
          'Und ich hab noch eine Überraschung. Eine richtig große. Komm zum Hofplatz, wenn du so weit bist!',
        ],
      },
      { type: 'event', ev: 'winterfest', count: 1, text: 'Komm zum Winterfest auf den Hofplatz', target: { spot: 'farmTree' }, use: { at: 'farmTree', label: 'Das Winterfest beginnen', run: 'winterFest' }, hint: 'Geh auf den Hofplatz vor dem Stall und drück dort E.' },
    ],
    reward: { coins: 80, farm: 'winterlights', memory: 'winterfest' },
  },

  // ======================= Kapitel 11: Frühlingserwachen =======================
  {
    id: 'j11_glocken', chapter: 11, main: true, part2: true, season: 'spring', title: 'Schneeglöckchen', giver: 'hilde', requires: ['j10_winterfest'],
    desc: 'Der Frühling klopft an.',
    steps: [
      {
        type: 'talk', npc: 'hilde', text: 'Sprich mit Oma Hilde', target: { npc: 'hilde' },
        lines: [
          'Riechst du das, {name}? Der Schnee schmilzt, die Vögel singen – der Frühling ist da!',
          'Opa Karl hat mir jedes Jahr die ersten Schneeglöckchen gepflückt. Fünf Stück, immer fünf. Eins für jeden Finger, hat er gesagt.',
          'Würdest du mir welche bringen? Sie wachsen am Waldrand und hier auf dem Hof – kleine weiße Glöckchen.',
        ],
      },
      {
        type: 'deliver', npc: 'hilde', items: { snowdrop: 5 }, text: 'Bring Oma Hilde 5 Schneeglöckchen', target: { npc: 'hilde' },
        lines: ['Fünf. Genau fünf. Ach, Kind …', { who: 'narr', t: 'Hilde hält die Blumen ganz fest und lächelt mit Tränen in den Augen.' }, 'Weißt du, ich bin nicht mehr traurig, wenn ich an Karl denke. Nur noch dankbar. Und das habt ihr gemacht, du und Mert.'],
        missing: ['5 Schneeglöckchen, Schatz. Sie wachsen jetzt im Frühling am Waldrand und auf dem Hof.'],
      },
    ],
    reward: { coins: 30 },
  },
  {
    id: 'j11_ritt', chapter: 11, main: true, part2: true, season: 'spring', title: '{foal}s erster Ritt', giver: 'mert', requires: ['j10_winterfest'],
    desc: 'Euer Fohlen ist groß geworden.',
    steps: [
      {
        type: 'talk', npc: 'mert', text: 'Sprich mit Mert', target: { npc: 'mert' },
        lines: [
          'Hast du {foal} heute gesehen? Sie ist so GROSS geworden! Und so stark. Ich glaube, sie ist bereit.',
          'Bereit für ihren ersten Ritt. Mit dir. Aber sie braucht einen Sattel, der ihr passt – einen Jungpferdesattel. Theo hat welche.',
        ],
      },
      {
        type: 'deliver', npc: 'mert', items: { youngsaddle: 1 }, text: 'Kauf bei Theo einen Jungpferdesattel und bring ihn Mert', target: { npc: 'mert' },
        lines: ['Perfekt! Weich gepolstert, leicht, und rosa Ziernähte. {foal} wird so stolz sein.'],
        missing: ['Den Jungpferdesattel gibt es bei Theo im Laden – unter „Futter & Material“.'],
      },
      { type: 'event', ev: 'longe', count: 3, text: 'Longiere {foal} auf dem Reitplatz (3 Runden)', target: { spot: 'arenaCenter' }, use: { at: 'arenaCenter', label: 'Eine Runde longieren', run: 'longe', r: 3 }, hint: 'Geh in die Mitte des Reitplatzes und drück dreimal E. {foal} läuft dann Runden um dich herum.' },
      { type: 'event', ev: 'first_ride', count: 1, text: 'Steig zum ersten Mal auf {foal}', target: { spot: 'arenaCenter' }, use: { at: 'arenaCenter', label: 'Auf {foal} aufsteigen', run: 'firstRide', r: 3 }, hint: 'In der Mitte des Reitplatzes E drücken.' },
    ],
    reward: { coins: 50, memory: 'ersterritt' },
  },
  {
    id: 'j11_fohlen', chapter: 11, main: true, part2: true, season: 'spring', title: 'Das verirrte Wildfohlen', giver: 'ella', requires: ['j10_winterfest'],
    desc: 'Ein Wildfohlen hat seine Herde verloren.',
    steps: [
      {
        type: 'talk', npc: 'ella', text: 'Sprich mit Tierärztin Ella', target: { npc: 'ella' },
        lines: [
          'Gut, dass du kommst! Ein Wanderer hat in den Wolkenbergen ein Wildfohlen gesehen. Ganz allein. Es ist erst ein paar Tage alt.',
          'Seine Mama ist bestimmt bei der Wildpferdeherde, oben auf der Wildpferdewiese. Aber allein findet das Kleine nicht zurück.',
          'Es steht am Bergpfad Richtung Osten. Sei ganz ruhig und leise – dann folgt es dir bestimmt.',
        ],
      },
      { type: 'event', ev: 'find_wildfoal', count: 1, text: 'Such das Wildfohlen am Bergpfad (Wolkenberge, Osten)', target: { spot: 'wildfoal' }, use: { at: 'wildfoal', label: 'Ganz leise hingehen', run: 'findWildFoal', r: 2.6 }, hint: 'Folge dem Serpentinenpfad in die Wolkenberge und am Wegweiser nach rechts Richtung Wildpferdewiese. Das Fohlen steht am Weg.' },
      { type: 'event', ev: 'return_wildfoal', count: 1, text: 'Bring das Fohlen zur Wildpferdeherde (Wildpferdewiese)', target: { spot: 'herdHome' }, watch: { wildfoalAt: 'herdHome', r: 6 }, hint: 'Das Fohlen folgt dir. Geh langsam weiter nach Osten zur Wildpferdewiese – dort wartet die Herde.' },
      {
        type: 'talk', npc: 'ella', text: 'Erzähl Ella, dass das Fohlen zu Hause ist', target: { npc: 'ella' },
        lines: ['Mama und Fohlen wieder zusammen? Ich könnte heulen. Mach ich auch. Kurz.', 'Weißt du, {name} – du hast ein Händchen für Tiere. Ein ganz großes.'],
      },
    ],
    reward: { coins: 50, memory: 'wildfohlen' },
  },
  {
    id: 'j11_storch', chapter: 11, main: true, part2: true, title: 'Die Störche sind zurück', giver: 'paula', requires: ['j11_glocken'],
    desc: 'Auf dem Postdach fehlt ein Nest.',
    steps: [
      {
        type: 'talk', npc: 'paula', text: 'Sprich mit Paula', target: { npc: 'paula' },
        lines: [
          'Zack, zack, {name}! Die Störche kommen aus dem Süden zurück! Jedes Jahr nisten sie auf meinem Postdach.',
          'Aber der Wintersturm hat ihr Nest weggeweht. Ohne Nest fliegen sie weiter – und Kleeberg ist ohne Störche nicht Kleeberg!',
          'Bring mir 2 Bretter und 1 Heu. Ich hab eine Leiter. Und keine Höhenangst. Fast keine.',
        ],
      },
      {
        type: 'deliver', npc: 'paula', items: { boards: 2, hay: 1 }, text: 'Bring Paula 2 Bretter und 1 Heu für das Storchennest', target: { npc: 'paula' },
        lines: ['Perfekt. Halt die Leiter fest, ja?'],
        missing: ['2 Bretter und 1 Heu – beides bei Theo.'],
      },
      { type: 'event', ev: 'storks', count: 1, text: 'Bau das Nest auf dem Postdach (Leiter an der Post)', target: { spot: 'storknest' }, use: { at: 'storknest', label: 'Auf die Leiter steigen', run: 'storkNest' }, hint: 'Die Leiter lehnt rechts an der Post in Kleeberg. Dort E drücken.' },
    ],
    reward: { coins: 40, memory: 'stoerche' },
  },
  {
    id: 'j11_putz', chapter: 11, main: true, part2: true, title: 'Frühjahrsputz', giver: 'hilde', requires: ['j11_glocken'],
    desc: 'Der Winterpelz muss runter!',
    steps: [
      {
        type: 'talk', npc: 'hilde', text: 'Sprich mit Oma Hilde', target: { npc: 'hilde' },
        lines: ['Im Frühling verlieren die Pferde ihr dickes Winterfell. Überall fliegen Haare! Die Vögel bauen damit ihre Nester.', 'Striegle drei deiner Pferde. Sie werden es dir mit glänzendem Fell danken.'],
      },
      { type: 'event', ev: 'groom', count: 3, text: 'Striegle 3 Pferde (Pflege-Menü → Striegeln)', target: { horse: 'riding' }, hint: 'Stell dich zu einem Pferd, drück E und wähle „Striegeln“. Auf der Koppel stehen die anderen Pferde.' },
      {
        type: 'talk', npc: 'hilde', text: 'Sprich mit Oma Hilde', target: { npc: 'hilde' },
        lines: ['Seht mal, wie sie glänzen! Wie frisch poliert. Hier, ein Stück Kuchen – Striegeln macht hungrig.'],
      },
    ],
    reward: { coins: 40, items: { cake: 1 } },
  },
  {
    id: 'j11_tulpen', chapter: 11, main: true, part2: true, title: 'Ein Meer aus Tulpen', giver: 'hilde', requires: ['j11_putz', 'j11_storch', 'j11_ritt', 'j11_fohlen'],
    desc: 'Opa Karls Lieblingsblumen sollen wieder blühen.',
    steps: [
      {
        type: 'talk', npc: 'hilde', text: 'Sprich mit Oma Hilde', target: { npc: 'hilde' }, give: { seed_tulip: 4 },
        lines: [
          'Früher blühten hier jeden Frühling hunderte Tulpen. Rot, gelb, rosa. Karl hat sie gepflanzt, Jahr für Jahr.',
          'Hier sind 4 Tulpenzwiebeln. Setz sie in den Gemüsegarten – und wenn sie blühen, pflanzen wir sie zusammen am Hof aus.',
        ],
      },
      { type: 'event', ev: 'plant', filter: 'tulip', count: 4, text: 'Setz 4 Tulpenzwiebeln im Gemüsegarten', target: { spot: 'garden' }, hint: 'Im Gemüsegarten an einem leeren Beet E drücken.' },
      { type: 'event', ev: 'water', count: 4, text: 'Gieße die Tulpenbeete', target: { spot: 'garden' }, hint: 'Nochmal E an den Beeten drücken.' },
      { type: 'event', ev: 'harvest', filter: 'tulip', count: 4, text: 'Pflück 4 Tulpen, wenn sie blühen', target: { spot: 'garden' }, hint: 'Tulpen brauchen ein paar Spielstunden. Gieß, wenn die Erde trocken ist – oder schlaf eine Nacht.' },
      {
        type: 'deliver', npc: 'hilde', items: { tulip: 4 }, text: 'Bring Oma Hilde 4 Tulpen', target: { npc: 'hilde' },
        lines: ['Sie sind wunderschön. Komm, wir pflanzen sie zusammen aus – rund um den Hof.', { who: 'narr', t: 'Ihr pflanzt den ganzen Nachmittag. Mira buddelt mit. Leider an den falschen Stellen.' }],
        missing: ['4 Tulpen, Schatz. Sie wachsen aus den Zwiebeln im Gemüsegarten.'],
      },
    ],
    reward: { coins: 50, farm: 'tulips', memory: 'tulpen', unlock: ['hat_tulpen'] },
  },

  // ======================= Kapitel 12: Unser kleines Zuhause =======================
  {
    id: 'j12_idee', chapter: 12, main: true, part2: true, season: 'summer', title: 'Ein Häuschen für uns', giver: 'mert', requires: ['j11_tulpen'],
    desc: 'Mert hat eine große Idee.',
    steps: [
      {
        type: 'talk', npc: 'mert', text: 'Sprich mit Mert', target: { npc: 'mert' },
        lines: [
          'Der Sommer ist zurück. Ein ganzes Jahr sind wir jetzt schon hier. Kannst du das glauben?',
          'Ich hab nachgedacht. Hilde ist wieder da, das Wohnhaus ist voll – mit ihr, den Katzen, Mira und uns. Und Gerdas Postkarten. Sehr vielen Postkarten.',
          'Was hältst du von … einem eigenen kleinen Häuschen? Nur für uns zwei. Hinten bei der Festwiese, wo morgens die Sonne zuerst scheint.',
          'Komm, wir suchen den Platz aus. Und du darfst die Farben bestimmen!',
        ],
      },
      { type: 'event', ev: 'cottage_site', count: 1, text: 'Such mit Mert den Platz und die Farben fürs Häuschen aus', target: { spot: 'cottage' }, use: { at: 'cottage', label: 'Den Platz aussuchen', run: 'cottageSite', r: 3 }, hint: 'Der Bauplatz liegt rechts neben der Festwiese, südlich vom Tierparadies. Dort E drücken.' },
    ],
    reward: { coins: 20 },
  },
  {
    id: 'j12_steine', chapter: 12, main: true, part2: true, title: 'Steine aus den Bergen', giver: 'mert', requires: ['j12_idee'],
    desc: 'Ein Häuschen braucht ein festes Fundament.',
    steps: [
      {
        type: 'talk', npc: 'mert', text: 'Sprich mit Mert', target: { npc: 'mert' },
        lines: ['Fürs Fundament brauchen wir Feldsteine. Flache, schöne. Am Fuß der Wolkenberge liegen jede Menge, dort, wo die Felsen anfangen.', 'Bring mir 8 Stück. Ich fang schon mal an zu graben.'],
      },
      {
        type: 'deliver', npc: 'mert', items: { stone: 8 }, text: 'Bring Mert 8 Feldsteine (am Fuß der Wolkenberge)', target: { npc: 'mert' },
        lines: ['Acht Steine! Einer schöner als der andere. Der hier hat sogar eine Herzform. Der kommt an die Tür.'],
        missing: ['8 Feldsteine brauche ich. Sie liegen am Fuß der Wolkenberge auf den Wiesen, direkt vor den Felsen.'],
      },
    ],
    reward: { coins: 30 },
  },
  {
    id: 'j12_holz', chapter: 12, main: true, part2: true, title: 'Bretter, Bretter, Bretter', giver: 'theo', requires: ['j12_idee'],
    desc: 'Theo hat ein Angebot.',
    steps: [
      {
        type: 'talk', npc: 'theo', text: 'Sprich mit Theo', target: { npc: 'theo' }, give: { boards: 4 },
        lines: ['Hm-hm. Ihr baut ein Haus, hab ich gehört? Ein Haus braucht Bretter. Viele Bretter.', 'Hier sind 4 Bretter. Geschenkt. Weil ihr es seid. Den Rest – 6 weitere – musst du leider kaufen. Ich bin ja kein Brettermillionär.'],
      },
      {
        type: 'deliver', npc: 'mert', items: { boards: 10 }, text: 'Bring Mert 10 Bretter', target: { npc: 'mert' },
        lines: ['Zehn Bretter! Das reicht für Wände, Boden und eine Veranda. Mit Schaukel. Natürlich mit Schaukel.'],
        missing: ['10 Bretter, bitte. Theo verkauft sie für 12 Münzen das Stück.'],
      },
    ],
    reward: { coins: 30 },
  },
  {
    id: 'j12_bau', chapter: 12, main: true, part2: true, title: 'Das Richtfest', giver: 'mert', requires: ['j12_steine', 'j12_holz'],
    desc: 'Jetzt wird gebaut!',
    steps: [
      {
        type: 'talk', npc: 'mert', text: 'Sprich mit Mert', target: { npc: 'mert' },
        lines: ['Alles da! Steine, Bretter, Nägel und zwei Hämmer. Einer für dich, einer für mich.', 'Komm zum Bauplatz. Und wenn du dir auf den Daumen haust – ich puste.'],
      },
      { type: 'event', ev: 'build', count: 4, text: 'Hämmer mit Mert am Häuschen (4 ×)', target: { spot: 'cottage' }, use: { at: 'cottage', label: 'Hämmern', run: 'hammer', r: 3 }, hint: 'Am Bauplatz rechts neben der Festwiese viermal E drücken.' },
    ],
    reward: { coins: 50, farm: 'cottage', memory: 'richtfest' },
  },
  {
    id: 'j12_einrichten', chapter: 12, main: true, part2: true, title: 'Gemütlich einrichten', giver: 'luise', requires: ['j12_bau'],
    desc: 'Aus einem Haus wird ein Zuhause.',
    steps: [
      {
        type: 'talk', npc: 'luise', text: 'Sprich mit Luise', target: { npc: 'luise' },
        lines: ['Ein eigenes Häuschen! Es braucht Gardinen. Und Kissen. Und noch mehr Kissen!', 'Bring mir 5 Lavendelsträuße und 3 Mohnblumen – daraus mache ich Farben für die Stoffe.'],
      },
      {
        type: 'deliver', npc: 'luise', items: { lavender: 5, poppy: 3 }, give: { curtains: 1 }, text: 'Bring Luise 5 Lavendel und 3 Mohnblumen', target: { npc: 'luise' },
        lines: ['Lavendellila mit Mohnrot – das ist die Farbe von Liebe. Hab ich gerade erfunden.', { who: 'narr', t: 'Luise gibt dir ein Paket mit Gardinen, Kissen und einer Decke mit eingestickten Herzen.' }],
        missing: ['5 Lavendelsträuße und 3 Mohnblumen, Liebes – beides auf den Blumenwiesen.'],
      },
      { type: 'event', ev: 'furnish', count: 1, text: 'Richte euer Häuschen ein', target: { spot: 'cottage' }, use: { at: 'cottage', label: 'Das Häuschen einrichten', run: 'furnish', r: 2.6 }, hint: 'Geh zur Tür eures Häuschens rechts neben der Festwiese und drück E.' },
    ],
    reward: { coins: 40, memory: 'haeuschen' },
  },
  {
    id: 'j12_party', chapter: 12, main: true, part2: true, title: 'Einweihungsparty', giver: 'mert', requires: ['j12_einrichten'], startGive: { invite: 10 },
    desc: 'Alle sollen euer Häuschen sehen.',
    steps: [
      {
        type: 'talk', npc: 'mert', text: 'Sprich mit Mert', target: { npc: 'mert' },
        lines: ['Ich hab Einladungen geschrieben. Mit Glitzer. Der Glitzer ist überall. Auch in Mira.', 'Bringst du sie zu allen? Hilde, die Leute im Dorf, Kuno, Lotte und Ella. Ich deck schon mal den Tisch.'],
      },
      {
        type: 'talkAll', npcs: ['hilde', 'berta', 'luise', 'theo', 'paula', 'mia', 'ben', 'kuno', 'lotte', 'ella'], consume: 'invite', text: 'Verteil die Einladungen zur Einweihungsparty', target: { npcAll: true },
        lines: {
          hilde: ['Ein eigenes Häuschen. Mein Herz platzt gleich vor Stolz.'],
          berta: ['Ich bring den Kuchen. Drei Kuchen. Vier, für den Notfall.'],
          luise: ['Ich bringe ein Kissen. Man kann nie genug Kissen haben!'],
          theo: ['Hm-hm. Ich bringe Limonade. Und einen Witz. Einen guten.'],
          paula: ['Zack, zack – ich bin pünktlich! Wie immer!'],
          mia: ['Darf ich mit Blitz kommen? Er ist auch eingeladen, oder?'],
          ben: ['I-ich bringe meine Kastanienmännchen-Familie mit. Als Deko.'],
          kuno: ['Ahoi! Ich bring meine Ziehharmonika. Und mein bestes Seemannslied.'],
          lotte: ['Eine Party? Mit Kuchen? UND Pferden? Das ist der beste Tag der Welt!'],
          ella: ['Ich komme gern! Und keine Sorge: Ich bin auch für Bauchweh vom Kuchen zuständig.'],
        },
      },
      { type: 'event', ev: 'housewarming', count: 1, text: 'Feiere die Einweihungsparty am Häuschen', target: { spot: 'cottage' }, use: { at: 'cottage', label: 'Die Party beginnen', run: 'housewarming', r: 2.6 }, hint: 'Zurück zum Häuschen und dort E drücken.' },
    ],
    reward: { coins: 60, memory: 'einweihung' },
  },

  // ======================= Kapitel 13: Das große Jahresfest =======================
  {
    id: 'j13_jahr', chapter: 13, main: true, part2: true, title: 'Ein Jahr Ponyhof', giver: 'hilde', requires: ['j12_party'],
    desc: 'Vor einem Jahr bist du auf den Hof gekommen.',
    steps: [
      {
        type: 'talk', npc: 'hilde', text: 'Sprich mit Oma Hilde', target: { npc: 'hilde' },
        lines: [
          '{name}, weißt du, welcher Tag bald ist? Vor genau einem Jahr bist du mit deinem Koffer und deinem großen Herzen hier angekommen.',
          'Das muss gefeiert werden! Mit einem Jahresfest am Glitzersee. Mit Laternen auf dem Wasser – wie früher!',
          'Und Mia plant ein Rennen. Ein ganz großes. Frag sie mal.',
        ],
      },
      {
        type: 'talk', npc: 'mia', text: 'Sprich mit Mia', target: { npc: 'mia' },
        lines: ['Der Kleeberg-Pokal! Das längste Rennen, das es je gab: einmal vom Hof durchs Dorf, an den Strand und zurück!', 'Ich reite Blitz, Ben reitet Wolke. Und du? Ich hoffe, du reitest {foal}! Sie ist ja jetzt groß.'],
      },
    ],
    reward: { coins: 20 },
  },
  {
    id: 'j13_laternen', chapter: 13, main: true, part2: true, title: 'Laternen für den See', giver: 'luise', requires: ['j13_jahr'],
    desc: 'Schwimmende Lichter für das Jahresfest.',
    steps: [
      {
        type: 'talk', npc: 'luise', text: 'Sprich mit Luise', target: { npc: 'luise' },
        lines: ['Laternen für den See? Oh, ich LIEBE schwimmende Laternen! Wir brauchen 6 Stück.', 'Dafür brauche ich 6 Bögen Seidenpapier von Paula und 6 Teelichter von Theo. Den Rest mache ich!'],
      },
      {
        type: 'talk', npc: 'paula', text: 'Hol bei Paula Seidenpapier', target: { npc: 'paula' }, give: { paper: 6 },
        lines: ['Seidenpapier? Zack, zack – hier, sechs Bögen in allen Regenbogenfarben. Für die Laternen? Die will ich sehen!'],
      },
      {
        type: 'deliver', npc: 'luise', items: { paper: 6, candle: 6 }, give: { skylantern: 6 }, text: 'Bring Luise 6 Seidenpapier und 6 Teelichter', target: { npc: 'luise' },
        lines: ['Papier, Licht – und Liebe. Fertig sind sechs Laternen!', 'Stell sie am Steg und am Ufer des Glitzersees auf. Beim Fest schwimmen sie dann alle aufs Wasser.'],
        missing: ['6 Seidenpapier (von Paula) und 6 Teelichter (bei Theo) brauche ich.'],
      },
      { type: 'event', ev: 'place_lantern', count: 6, text: 'Stell 6 Laternen am Steg und Seeufer auf', target: { lantern: 'nearest' }, use: { at: 'lanterns', label: 'Laterne aufstellen', run: 'placeLantern' }, hint: 'Die Plätze leuchten am Steg und am Ostufer des Glitzersees. Dort jeweils E drücken.' },
    ],
    reward: { coins: 40 },
  },
  {
    id: 'j13_pokal', chapter: 13, main: true, part2: true, title: 'Der Kleeberg-Pokal', giver: 'mia', requires: ['j13_jahr'],
    desc: 'Das längste Rennen aller Zeiten.',
    steps: [
      { type: 'event', ev: 'race', filter: 'cup', count: 1, text: 'Reite den Kleeberg-Pokal (sprich mit Mia)', target: { npc: 'mia' }, hint: 'Sprich mit Mia im Dorf – dann geht es los. Folge den leuchtenden Toren.' },
    ],
    reward: { coins: 60, memory: 'pokal' },
  },
  {
    id: 'j13_fest', chapter: 13, main: true, part2: true, title: 'Das Jahresfest', giver: 'hilde', requires: ['j13_laternen', 'j13_pokal'],
    desc: 'Ein Fest für ein ganzes Jahr voller Herzen.',
    steps: [
      { type: 'talk', npc: 'hilde', text: 'Sprich mit Oma Hilde, um das Jahresfest zu beginnen', target: { npc: 'hilde' }, ending2: true, lines: ['Alle warten schon am Glitzersee, {name}. Bist du bereit für unser Jahresfest?'] },
    ],
    reward: {},
  },

  // ======================= Nebenaufgaben (Teil 2) =======================
  {
    id: 's2_foto', chapter: 0, main: false, part2: true, title: 'Unser Fotoalbum', giver: 'mert', requires: ['j7_abschied'],
    offer: ['Weißt du, was wir gar nicht haben? Fotos von uns zwei!', 'Ich hab die alte Kamera von Opa Karl gefunden. Lass uns an unseren schönsten Orten Fotos machen. Acht Stück – für ein richtiges Album!'],
    steps: [
      { type: 'event', ev: 'photo', count: 8, text: 'Mach 8 Fotos mit Mert an schönen Orten (Kamerasymbol)', target: { photo: 'nearest' }, use: { at: 'photos', label: 'Foto mit Mert machen', run: 'photo', r: 2.2 }, hint: 'Die Fotoplätze sind mit einem Kamerasymbol markiert: Aussichtspunkt, Steg, Leuchtturm, Rosenlaube, Insel, Sonnenblumenfeld, Blütenbaum-Hügel und Alpakaweide. Dein Fotoalbum findest du im Menü (Esc).' },
      { type: 'talk', npc: 'mert', text: 'Zeig Mert das fertige Album', target: { npc: 'mert' }, lines: ['Acht Fotos. Und auf jedem lachst du. Weißt du, was das schönste ist? Auf jedem bin ich der glücklichste Mensch der Welt.', 'Ich hab dir einen Bilderrahmen gebastelt. Für unser Lieblingsfoto.'] },
    ],
    reward: { coins: 40, deco: { photoframe: 1 }, memory: 'fotoalbum' },
  },
  {
    id: 's2_zettel', chapter: 0, main: false, part2: true, title: 'Merts Zettelchen', giver: 'mert', requires: ['j7_laub'],
    offer: ['Ich hab da was versteckt. Fünf kleine Zettelchen. Auf dem Hof und im Dorf.', 'Auf jedem steht etwas, das ich dir schon immer sagen wollte. Findest du sie?'],
    steps: [
      { type: 'event', ev: 'lovenote', count: 5, text: 'Finde Merts 5 Liebeszettel (Hof, Dorf, Steg, Hügel)', target: { lovenote: 'nearest' }, hint: 'Die rosa Zettelchen liegen auf dem Hof, in der Rosenlaube, am Brunnen in Kleeberg, am Steg und auf dem Hügel. Einfach drüberlaufen.' },
      { type: 'talk', npc: 'mert', text: 'Geh zu Mert', target: { npc: 'mert' }, after: 'kissHeart', lines: ['Du hast alle gefunden? Dann weißt du jetzt alles. Na ja, fast alles. Den Rest sag ich dir jeden Tag.'] },
    ],
    reward: { coins: 30, memory: 'zettel' },
  },
  {
    id: 's2_klee', chapter: 0, main: false, part2: true, title: 'Lottes Glückssammlung', giver: 'lotte', requires: ['j8_mut'],
    offer: ['Ich sammle jetzt Glück! Also, Kleeblätter. Vierblättrige!', 'Wenn du 10 findest, bekommst du von mir was ganz Besonderes. Ich hab es selbst gemacht. Mit Luise.'],
    steps: [
      { type: 'event', ev: 'clover10', count: 1, text: 'Finde 10 vierblättrige Kleeblätter', target: { clover: 'nearest' }, hint: 'Mira bellt, wenn ein Kleeblatt in der Nähe ist. Der Zähler oben links zeigt, wie viele du schon hast.' },
      { type: 'talk', npc: 'lotte', text: 'Zeig Lotte deine Kleeblätter', target: { npc: 'lotte' }, lines: ['ZEHN? Du bist ja die Glücksfee! Hier – Kleeblattschleifen für dein Pferd. Damit hat es immer Glück.'] },
    ],
    reward: { coins: 40, unlock: ['bow_klee'] },
  },
  {
    id: 's2_rezept', chapter: 0, main: false, part2: true, title: 'Bertas Rezeptbuch', giver: 'berta', requires: ['j7_erntedank'],
    offer: ['Oje, oje! Der Herbstwind hat mein Rezeptbuch aus dem Fenster geweht! Fünf Seiten sind weg!', 'Die Seite mit dem Kürbiskuchen ist dabei! Findest du sie? Sie müssen irgendwo im Dorf und auf den Wiesen liegen.'],
    steps: [
      { type: 'event', ev: 'recipe', count: 5, text: 'Finde Bertas 5 Rezeptseiten (Dorf und Wiesen)', target: { recipe: 'nearest' }, hint: 'Die Seiten sind im Dorf und auf den Wiesen nördlich davon verstreut. Der Pfeil zeigt zur nächsten.' },
      { type: 'talk', npc: 'berta', text: 'Bring Berta die Rezeptseiten', target: { npc: 'berta' }, lines: ['Alle fünf! Mein Kürbiskuchen ist gerettet! Ab jetzt gibt es ihn bei mir im Laden – und das erste Stück ist für dich.'] },
    ],
    reward: { coins: 40, items: { pumpkinpie: 1 } },
  },
  {
    id: 's2_vogel', chapter: 0, main: false, part2: true, title: 'Vogelhäuschen', giver: 'paula', requires: ['j7_abschied'],
    offer: ['Wenn es kalt wird, finden die Vögel kaum Futter. Ich will Vogelhäuschen aufhängen!', 'Ben hat drei gebaut. Holst du sie bei ihm ab und hängst sie auf? Eins auf deinem Hof, eins im Dorf, eins am Waldrand.'],
    steps: [
      { type: 'talk', npc: 'ben', text: 'Hol die Vogelhäuschen bei Ben ab', target: { npc: 'ben' }, give: { birdkit: 3 }, lines: ['Drei Vogelhäuschen, frisch gestrichen! Bitte gut festmachen – Vögel sind sehr kritische Mieter.'] },
      { type: 'event', ev: 'birdhouse', count: 3, text: 'Häng 3 Vogelhäuschen auf (Hof, Dorf, Waldrand)', target: { birdhouse: 'nearest' }, use: { at: 'birdspots', label: 'Vogelhäuschen aufhängen', run: 'birdhouse' }, hint: 'Die drei Plätze: am Apfelbaum links vom Wohnhaus, beim Brunnen in Kleeberg und am Waldrand westlich vom Hof.' },
      { type: 'talk', npc: 'paula', text: 'Sag Paula Bescheid', target: { npc: 'paula' }, lines: ['Alle drei hängen? Zack, zack – die ersten Rotkehlchen sind schon eingezogen! Das ist die beste Post seit Langem.'] },
    ],
    reward: { coins: 40, deco: { birdhouse: 1 } },
  },
  {
    id: 's2_kuno', chapter: 0, main: false, part2: true, offerSeason: 'winter', title: 'Sturm am Leuchtturm', giver: 'kuno', requires: ['j10_schnee'],
    offer: ['Ahoi, {name}! Der Wintersturm hat meine Lampe ausgepustet. Und das Öl ist alle!', 'Ohne Licht finden die Schiffe nicht nach Hause. Bringst du mir Lampenöl von Theo?'],
    steps: [
      { type: 'deliver', npc: 'kuno', items: { lampoil: 1 }, text: 'Bring Kuno Lampenöl (bei Theo)', target: { npc: 'kuno' }, lines: ['Donnerwetter, das ging schnell! Komm, wir zünden die Lampe zusammen an!', { who: 'narr', t: 'Ihr steigt die vielen Stufen hinauf. Kuno füllt das Öl ein, du drehst am Rad – und das Licht strahlt wieder weit übers Meer.' }, 'Da hinten blinkt ein Schiff zurück. Es sagt „Danke“. Glaub ich.'], missing: ['Lampenöl gibt es bei Theo im Laden. Ich warte hier – mit klappernden Zähnen.'] },
    ],
    reward: { coins: 50, unlock: ['blanket_regenbogen'] },
  },
  {
    id: 's2_schlitten', chapter: 0, main: false, part2: true, offerSeason: 'winter', title: 'Schlittenfahrt', giver: 'mia', requires: ['j10_schnee'],
    offer: ['Der Hügel hinter deinem Hof ist der beste Schlittenberg der ganzen Gegend!', 'Ben und ich haben Schlitten. Kommst du mit? Ich wette, ich bin schneller unten als du!'],
    steps: [
      { type: 'event', ev: 'sled', count: 1, text: 'Fahr mit Mia und Ben Schlitten (Hügel hinter dem Hof)', target: { spot: 'hillTop' }, use: { at: 'hillTop', label: 'Schlitten fahren', run: 'sledding', r: 2.6 }, hint: 'Der Hügel mit dem großen Baum liegt südlich der Festwiese. Oben E drücken.' },
    ],
    reward: { coins: 30, deco: { sled: 1 }, memory: 'schlitten' },
  },
  {
    id: 's2_pony', chapter: 0, main: false, part2: true, offerSeason: 'winter', title: 'Das weiße Pony', giver: 'ella', requires: ['j10_schnee'],
    offer: ['Hast du es schon gesehen? In den Wolkenbergen läuft ein schneeweißes Pony herum. Man sieht es nur im Winter!', 'Es ist ganz allein und sehr scheu. Vielleicht findet es bei dir ein Zuhause? Sei geduldig mit ihm.'],
    steps: [
      { type: 'tame', horse: 'flocke', text: 'Zähme das weiße Pony in den Wolkenbergen', target: { wildId: 'flocke' }, hint: 'Das Pony steht im Osten der Wolkenberge. Steig ab, geh langsam hin, bleib stehen, wenn es nervös wird, und biete ihm Äpfel oder Karotten an.' },
      { type: 'talk', npc: 'ella', text: 'Erzähl Ella von dem Pony', target: { npc: 'ella' }, lines: ['Du hast es geschafft! Ein Pony aus Schnee und Sternenstaub. Lotte wird ausflippen.'] },
    ],
    reward: { coins: 50 },
  },
  {
    id: 's2_stern', chapter: 0, main: false, part2: true, title: 'Ein Stern für dich', giver: 'ben', requires: ['j9_schatz'],
    offer: ['I-ich hab etwas entdeckt! Mit dem Fernrohr am Aussichtspunkt. Ein Sternbild, das aussieht wie ein Pferd!', 'Und Mert hat gesagt … nein, das darf ich nicht verraten. Schau nachts durchs Fernrohr!'],
    steps: [
      { type: 'event', ev: 'starname', count: 1, text: 'Schau nachts durchs Fernrohr am Aussichtspunkt', target: { spot: 'telescope' }, use: { at: 'telescope', label: 'Sterne anschauen', run: 'starName', r: 1.8 }, hint: 'Das Fernrohr steht am Aussichtspunkt ganz oben in den Wolkenbergen. Wenn es noch hell ist, kannst du bis zur Nacht warten.' },
    ],
    reward: { coins: 30, memory: 'stern' },
  },
  {
    id: 's2_mode', chapter: 0, main: false, part2: true, title: 'Luises Modenschau', giver: 'luise', requires: ['j7_erntedank'],
    offer: ['Ich plane eine Modenschau! Und du bist mein Model!', 'Zeig mir 3 verschiedene Outfits. Zieh dich um (Tasche → Kleidung) und komm jedes Mal zu mir!'],
    steps: [
      { type: 'event', ev: 'outfit_show', count: 3, text: 'Zeig Luise 3 verschiedene Outfits (umziehen und mit Luise sprechen)', target: { npc: 'luise' }, use: { at: 'npc:luise', label: 'Outfit zeigen', run: 'outfitShow', r: 1.9 }, hint: 'Zieh dich in der Tasche (I) unter „Kleidung“ um und sprich dann mit Luise. Jedes Outfit zählt einmal.' },
    ],
    reward: { coins: 40, unlock: ['outfit_herbst'] },
  },
];
