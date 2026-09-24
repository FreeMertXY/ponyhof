// Einstiegspunkt: startet Jolinas Ponyhof.
import { Game } from './game.js';

function start() {
  try {
    const game = new Game();
    window.ponyhof = game; // für Tests und Neugierige
    game.boot();
  } catch (e) {
    console.error(e);
    const l = document.getElementById('loading');
    if (l) l.textContent = 'Oh nein – das Spiel konnte nicht starten. Bitte lade die Seite neu. (' + e.message + ')';
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
