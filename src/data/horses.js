// Fellfarben, Persönlichkeiten und die 7 wilden Pferde.

export const COATS = {
  fuchs: { name: 'Fuchs', body: '#d98a52', dark: '#b86b3a', mane: '#f2d3a0', light: '#f6b98a' },
  brauner: { name: 'Brauner', body: '#9a6444', dark: '#7a4b32', mane: '#3a2a26', light: '#bf8763' },
  rappe: { name: 'Rappe', body: '#4a4150', dark: '#352e3b', mane: '#231d28', light: '#6c6275' },
  schimmel: { name: 'Schimmel', body: '#f6f3f0', dark: '#d9d3d6', mane: '#e4dde8', light: '#ffffff' },
  palomino: { name: 'Palomino', body: '#ecc47e', dark: '#d2a45c', mane: '#fff5df', light: '#f7dca8' },
  apfel: { name: 'Apfelschimmel', body: '#cfd0db', dark: '#a9aabb', mane: '#f2f2f6', light: '#e8e9f0', dapple: true },
  schecke: { name: 'Schecke', body: '#fbf7f2', dark: '#ddd6d0', mane: '#4a3a34', light: '#ffffff', patches: '#8a5a42' },
  falbe: { name: 'Falbe', body: '#dcb98a', dark: '#b8966a', mane: '#5a4536', light: '#ecd4ae' },
};

export const STARTER_COATS = ['fuchs', 'brauner', 'rappe', 'schimmel', 'palomino', 'schecke'];

// Persönlichkeiten: skittish = wie schnell es nervös wird, treat = Vertrauen pro Leckerli,
// calm = wie schnell es sich beruhigt, aware = ab welcher Entfernung es aufmerksam wird
export const PERSONALITIES = {
  verschmust: { name: 'verschmust', skittish: 0.5, treat: 0.4, calm: 0.5, aware: 6, desc: 'Liebt Streicheleinheiten über alles.' },
  frech: { name: 'frech', skittish: 0.8, treat: 0.3, calm: 0.35, aware: 7, desc: 'Klaut gern Äpfel aus der Tasche.' },
  schuechtern: { name: 'schüchtern', skittish: 1.3, treat: 0.3, calm: 0.3, aware: 8, desc: 'Braucht viel Ruhe und Geduld.' },
  verspielt: { name: 'verspielt', skittish: 0.8, treat: 0.35, calm: 0.45, aware: 7, desc: 'Tollt am liebsten durch die Wellen.' },
  neugierig: { name: 'neugierig', skittish: 0.6, treat: 0.35, calm: 0.5, aware: 7, desc: 'Muss alles genau beschnuppern.' },
  vertraeumt: { name: 'verträumt', skittish: 0.9, treat: 0.3, calm: 0.4, aware: 7, desc: 'Schaut gern in die Sterne.' },
  wild: { name: 'wild und stolz', skittish: 1.6, treat: 0.22, calm: 0.28, aware: 9, desc: 'Frei wie der Wind in den Bergen.' },
  sanft: { name: 'sanft', skittish: 0.6, treat: 0.35, calm: 0.5, aware: 6, desc: 'Ruhig, geduldig und lieb.' },
};

// marking: blaze (Blesse), star (Stern), snip, socks (Stiefel), none
export const WILD_HORSES = [
  { id: 'kleeblatt', name: 'Kleeblatt', coat: 'fuchs', mane: '#f7e0b0', marking: 'blaze', socks: true, personality: 'verschmust', hint: 'Grast auf den Blumenwiesen.' },
  { id: 'schoko', name: 'Schoko', coat: 'brauner', mane: '#2a1c18', marking: 'star', socks: true, personality: 'frech', hint: 'Streunt durch den Flüsterwald.' },
  { id: 'perle', name: 'Perle', coat: 'schimmel', mane: '#ead9f0', marking: 'none', socks: false, personality: 'schuechtern', hint: 'Trinkt am Ufer des Glitzersees.' },
  { id: 'sandy', name: 'Sandy', coat: 'palomino', mane: '#fffaf0', marking: 'blaze', socks: false, personality: 'verspielt', hint: 'Tobt am Sonnenstrand.' },
  { id: 'tupfen', name: 'Tupfen', coat: 'schecke', mane: '#3b2b27', marking: 'snip', socks: false, personality: 'neugierig', hint: 'Steht auf der Wiese östlich vom Dorf.' },
  { id: 'mondschein', name: 'Mondschein', coat: 'rappe', mane: '#1d1824', marking: 'star', socks: true, personality: 'vertraeumt', hint: 'Lebt auf einer versteckten Waldlichtung.' },
  { id: 'nebel', name: 'Nebel', coat: 'apfel', mane: '#ffffff', marking: 'snip', socks: false, personality: 'wild', hint: 'Das scheue Wildpferd der Wolkenberge.' },
];

// Freundschaft: Punkte-Schwellen für Level 1–5
export const FRIEND_LEVELS = [0, 20, 50, 90, 140];
export const TRICKS = [
  { level: 2, id: 'neigh', name: 'Wiehern' },
  { level: 3, id: 'rear', name: 'Steigen' },
  { level: 4, id: 'spin', name: 'Pirouette' },
  { level: 5, id: 'bow', name: 'Verbeugen' },
];
