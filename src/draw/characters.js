// Spielfigur und Dorfbewohner – runde Chibi-Figuren in vier Richtungen.
import { rr, ell, circ, fs, shadow, flower, star } from './paint.js';
import { shade } from '../util.js';
import { SKINS, HAIR_COLORS } from '../data/npcs.js';
import { OUTFITS, HATS } from '../data/shop.js';

const HAIR_STYLE_IDS = ['long', 'ponytail', 'pigtails', 'bun', 'bob', 'curly'];

export function playerLook(p) {
  const outfit = OUTFITS[p.outfit] || OUTFITS[0];
  return {
    skin: SKINS[p.skin] || SKINS[1],
    hair: HAIR_STYLE_IDS[p.hair] || 'long',
    hairColor: (HAIR_COLORS[p.hairColor] || HAIR_COLORS[0]).c,
    outfit,
    hat: p.hat ? (p.hatType || 'straw') : null,
    freckles: false,
    player: true,
  };
}

export function npcLook(l) {
  return { ...l, skin: typeof l.skin === 'number' ? SKINS[l.skin] : l.skin };
}

// Kopfmitte relativ zu den Füßen
const HY = -40;
const HR = 13;

function drawHairBack(ctx, L, dir, sway) {
  const c = L.hairColor;
  if (dir === 'up') {
    // von hinten: ganze Hinterkopf-Haare kommen später (front-Layer)
    return;
  }
  const side = dir === 'left' || dir === 'right';
  switch (L.hair) {
    case 'long':
      rr(ctx, side ? -15 : -15.5, HY - 8, side ? 22 : 31, 30 + sway * 0.5, 10);
      fs(ctx, c);
      break;
    case 'bob':
      rr(ctx, side ? -15 : -15.5, HY - 8, side ? 24 : 31, 18, 9);
      fs(ctx, c);
      break;
    case 'curly':
      for (const [x, y] of side ? [[-12, HY + 2], [-9, HY + 9], [-4, HY + 12], [-13, HY - 6]] : [[-14, HY + 2], [14, HY + 2], [-12, HY + 10], [12, HY + 10], [-6, HY + 13], [6, HY + 13]]) {
        circ(ctx, x, y, 7); fs(ctx, c);
      }
      break;
    case 'ponytail':
      if (side) {
        ctx.save(); ctx.translate(-12, HY - 6); ctx.rotate(0.35 + sway * 0.04);
        rr(ctx, -5, 0, 10, 24, 5); fs(ctx, c); ctx.restore();
      }
      break;
    case 'pigtails': {
      const pts = side ? [[-9, HY + 1]] : [[-16, HY + 1], [16, HY + 1]];
      for (const [x, y] of pts) {
        ctx.save(); ctx.translate(x, y); ctx.rotate((x < 0 ? 0.15 : -0.15) + sway * 0.03);
        ell(ctx, 0, 9, 5.5, 11); fs(ctx, c);
        ctx.restore();
      }
      break;
    }
    default: break;
  }
}

function drawHairFront(ctx, L, dir, sway) {
  const c = L.hairColor;
  const dk = shade(c, -0.25);
  if (dir === 'up') {
    circ(ctx, 0, HY, HR + 1.5); fs(ctx, c);
    if (L.hair === 'long') { rr(ctx, -15, HY - 2, 30, 26 + sway * 0.5, 10); fs(ctx, c); }
    if (L.hair === 'bob') { rr(ctx, -15, HY - 2, 30, 14, 8); fs(ctx, c); }
    if (L.hair === 'curly') for (const [x, y] of [[-12, HY + 6], [0, HY + 10], [12, HY + 6], [-8, HY - 8], [8, HY - 8]]) { circ(ctx, x, y, 7); fs(ctx, c); }
    if (L.hair === 'ponytail') { ctx.save(); ctx.translate(0, HY - 4); ctx.rotate(sway * 0.05); rr(ctx, -5, 0, 10, 26, 5); fs(ctx, c); ctx.restore(); circ(ctx, 0, HY - 4, 3.2); fs(ctx, '#ff6f9f'); }
    if (L.hair === 'pigtails') for (const x of [-15, 15]) { ell(ctx, x, HY + 10, 5.5, 11); fs(ctx, c); circ(ctx, x, HY + 1, 2.8); fs(ctx, '#ff6f9f'); }
    if (L.hair === 'bun') { circ(ctx, 0, HY - 12, 6.5); fs(ctx, c); }
    ctx.strokeStyle = dk; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(0, HY - 12); ctx.lineTo(0, HY + 6); ctx.stroke();
    return;
  }
  const side = dir === 'left' || dir === 'right';
  // Haarkappe
  ctx.save();
  ctx.beginPath();
  if (side) {
    ctx.moveTo(-HR - 2, HY + 6);
    ctx.bezierCurveTo(-HR - 4, HY - 20, HR + 6, HY - 20, HR + 1, HY - 3);
    ctx.quadraticCurveTo(HR - 3, HY - 5, HR - 5, HY - 8);
    ctx.quadraticCurveTo(4, HY - 4, 1, HY - 8);
    ctx.quadraticCurveTo(-2, HY + 2, -5, HY + 8);
    ctx.closePath();
  } else {
    ctx.moveTo(-HR - 1.5, HY + 4);
    ctx.bezierCurveTo(-HR - 3, HY - 21, HR + 3, HY - 21, HR + 1.5, HY + 4);
    // Pony (Fransen)
    ctx.quadraticCurveTo(HR - 1, HY - 5, 8, HY - 7);
    ctx.quadraticCurveTo(5, HY - 3, 2, HY - 7);
    ctx.quadraticCurveTo(-1, HY - 3, -4, HY - 7);
    ctx.quadraticCurveTo(-8, HY - 3, -10, HY - 7);
    ctx.quadraticCurveTo(-HR, HY - 4, -HR - 1.5, HY + 4);
    ctx.closePath();
  }
  fs(ctx, c);
  // Glanzlicht
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(side ? 2 : -2, HY - 4, 9, -2.4, -1.6); ctx.stroke();
  ctx.restore();
  // Extras vorne
  if (L.hair === 'bun') { circ(ctx, side ? -6 : 0, HY - 13, 6.5); fs(ctx, c); }
  if (L.hair === 'ponytail' && !side) { circ(ctx, 12, HY - 6, 3); fs(ctx, '#ff6f9f'); }
  if (L.hair === 'ponytail' && side) { circ(ctx, -12, HY - 7, 3); fs(ctx, '#ff6f9f'); }
  if (L.hair === 'pigtails') for (const x of side ? [-9] : [-15, 15]) { circ(ctx, x, HY + 1, 2.8); fs(ctx, '#ff6f9f'); }
  if (L.hair === 'curly') for (const [x, y] of side ? [[-8, HY - 10], [2, HY - 12], [-13, HY - 2]] : [[-9, HY - 10], [0, HY - 12], [9, HY - 10]]) { circ(ctx, x, y, 5); fs(ctx, c); }
  if (L.hair === 'short' && !side) {
    // kurze Haare: etwas kürzer an den Seiten
  }
}

function drawFace(ctx, L, dir, blink) {
  if (dir === 'up') return;
  const side = dir === 'left' || dir === 'right';
  const eyes = side ? [[6, HY + 1]] : [[-5, HY + 1], [5, HY + 1]];
  for (const [x, y] of eyes) {
    if (blink) {
      ctx.strokeStyle = '#3b2a3a'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(x, y, 2.4, 0.2, Math.PI - 0.2); ctx.stroke();
    } else {
      ctx.fillStyle = '#3b2a3a'; ell(ctx, x, y, 2.4, 3.1); ctx.fill();
      ctx.fillStyle = '#fff'; circ(ctx, x + 0.8, y - 1.2, 1); ctx.fill();
    }
  }
  // Wangen
  ctx.fillStyle = 'rgba(255,120,140,0.35)';
  for (const [x, y] of side ? [[5, HY + 6]] : [[-8, HY + 5.5], [8, HY + 5.5]]) { ell(ctx, x, y, 3, 2); ctx.fill(); }
  // Mund
  ctx.strokeStyle = '#8a4a55'; ctx.lineWidth = 1.3; ctx.lineCap = 'round';
  ctx.beginPath();
  if (side) ctx.arc(9, HY + 6, 1.8, 0.2, 1.8);
  else ctx.arc(0, HY + 5.5, 2.2, 0.25, Math.PI - 0.25);
  ctx.stroke();
  if (L.freckles) {
    ctx.fillStyle = 'rgba(160,90,60,0.55)';
    for (const [x, y] of side ? [[4, HY + 4], [6, HY + 5]] : [[-8, HY + 3.5], [-6.5, HY + 4.8], [6.5, HY + 4.8], [8, HY + 3.5]]) { circ(ctx, x, y, 0.7); ctx.fill(); }
  }
  if (L.glasses) {
    ctx.strokeStyle = '#5a4a6a'; ctx.lineWidth = 1.3;
    for (const [x, y] of eyes) { circ(ctx, x, y, 3.8); ctx.stroke(); }
    if (!side) { ctx.beginPath(); ctx.moveTo(-1.2, HY + 1); ctx.lineTo(1.2, HY + 1); ctx.stroke(); }
  }
  if (L.mustache) {
    ctx.fillStyle = shade(L.hairColor, -0.1);
    if (side) { ell(ctx, 9, HY + 4.5, 3.5, 1.8); ctx.fill(); }
    else { ell(ctx, -3, HY + 4.2, 3.6, 1.8, 0.2); ctx.fill(); ell(ctx, 3, HY + 4.2, 3.6, 1.8, -0.2); ctx.fill(); }
  }
}

function drawBeard(ctx, L, dir) {
  if (!L.beard || dir === 'up') return;
  const side = dir === 'left' || dir === 'right';
  ctx.beginPath();
  if (side) { ctx.moveTo(-2, HY + 3); ctx.quadraticCurveTo(0, HY + 18, 12, HY + 9); ctx.lineTo(11, HY + 4); ctx.closePath(); }
  else { ctx.moveTo(-11, HY + 2); ctx.quadraticCurveTo(0, HY + 22, 11, HY + 2); ctx.quadraticCurveTo(0, HY + 9, -11, HY + 2); ctx.closePath(); }
  fs(ctx, L.beard);
}

function drawHat(ctx, L, dir) {
  const hat = L.hat;
  if (!hat) return;
  const side = dir === 'left' || dir === 'right';
  const back = dir === 'up';
  ctx.save();
  ctx.translate(side ? 1 : 0, HY - 9);
  switch (hat) {
    case 'straw': case 'sun': {
      const brim = hat === 'sun' ? '#fff3c9' : '#f3d58e';
      ell(ctx, 0, 0, hat === 'sun' ? 21 : 18, side ? 4 : 5.5); fs(ctx, brim);
      ctx.beginPath(); ctx.ellipse(0, -1, 10.5, 9, 0, Math.PI, 0); ctx.closePath(); fs(ctx, brim);
      ctx.fillStyle = hat === 'sun' ? '#ff8fb8' : '#ff7a9c';
      rr(ctx, -10.5, -4.5, 21, 3.6, 1.5); ctx.fill();
      if (!back) flower(ctx, side ? -6 : 7, -3, 2.4, '#fff', '#ffd84a');
      break;
    }
    case 'helmet':
      ctx.beginPath(); ctx.ellipse(0, 2, 14, 13, 0, Math.PI, 0); ctx.closePath(); fs(ctx, '#3d3f5a');
      if (!back) { ell(ctx, side ? 9 : 0, 2, side ? 7 : 11, 2.4); fs(ctx, '#2b2d42'); }
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ell(ctx, -4, -6, 4, 2.4, -0.4); ctx.fill();
      break;
    case 'flower':
      for (let i = 0; i < 7; i++) {
        const a = Math.PI + (i / 6) * Math.PI;
        flower(ctx, Math.cos(a) * 12, 7 + Math.sin(a) * 8, 2.6, ['#ff8fb8', '#fff', '#b79cf0', '#ffd166'][i % 4], '#ffc83d');
      }
      break;
    case 'captain':
      rr(ctx, -12, -8, 24, 10, 4); fs(ctx, '#f4f4f8');
      if (!back) { rr(ctx, side ? 2 : -11, 0, side ? 13 : 22, 4, 2); fs(ctx, '#23304f'); ctx.fillStyle = '#ffd24a'; star(ctx, side ? 0 : 0, -3, 3); ctx.fill(); }
      break;
    case 'chef':
      rr(ctx, -9, -4, 18, 6, 2); fs(ctx, '#ffffff');
      for (const [x, y, r] of [[-6, -9, 6], [6, -9, 6], [0, -13, 7]]) { circ(ctx, x, y, r); fs(ctx, '#ffffff'); }
      break;
    case 'cap':
      ctx.beginPath(); ctx.ellipse(0, 2, 13.5, 11, 0, Math.PI, 0); ctx.closePath(); fs(ctx, '#5a7a4a');
      if (!back) { ell(ctx, side ? 11 : 0, 2.5, side ? 8 : 10, 2.2); fs(ctx, '#4a6a3a'); }
      break;
    case 'post':
      ctx.beginPath(); ctx.ellipse(0, 2, 13.5, 10, 0, Math.PI, 0); ctx.closePath(); fs(ctx, '#3d5aa8');
      if (!back) { ell(ctx, side ? 11 : 0, 2.5, side ? 8 : 10, 2.2); fs(ctx, '#2c4383'); ctx.fillStyle = '#ffd23f'; circ(ctx, side ? 3 : 0, -3, 2.5); ctx.fill(); }
      break;
    default: break;
  }
  ctx.restore();
}

function outfitColors(L) {
  const o = L.outfit || OUTFITS[0];
  return { main: o.main, second: o.second, style: o.style };
}

// Oberkörper + Beine
function drawBody(ctx, L, dir, legA, armA, seated) {
  const { main, second, style } = outfitColors(L);
  const side = dir === 'left' || dir === 'right';
  const skin = L.skin;
  const pants = style === 'overall' ? main : style === 'dress' || style === 'fancy' || style === 'sailor' ? skin : second;
  const shoe = '#6b4a4a';
  // Beine
  if (!seated) {
    if (side) {
      for (const [ph, dx] of [[legA, -2], [-legA, 2]]) {
        ctx.save(); ctx.translate(dx, -12); ctx.rotate(ph * 0.5);
        rr(ctx, -2.8, 0, 5.6, 11, 2.8); fs(ctx, pants);
        rr(ctx, -3, 8.5, 7, 3.5, 1.8); fs(ctx, shoe);
        ctx.restore();
      }
    } else {
      for (const [x, lift] of [[-4.5, Math.max(0, legA) * 3], [4.5, Math.max(0, -legA) * 3]]) {
        rr(ctx, x - 2.8, -12 - lift, 5.6, 11, 2.8); fs(ctx, pants);
        rr(ctx, x - 3.2, -3.5 - lift, 6.4, 3.8, 1.8); fs(ctx, shoe);
      }
    }
  }
  // Bein beim Reiten (seitlich am Pferd)
  if (seated && side) {
    ctx.save(); ctx.translate(1, -15); ctx.rotate(-0.25);
    rr(ctx, -3, 0, 6, 13, 3); fs(ctx, pants);
    rr(ctx, -3.4, 10.5, 8, 4, 2); fs(ctx, shoe);
    ctx.restore();
  }
  // Arme hinter dem Körper (Seitenansicht)
  const armCol = style === 'dress' || style === 'fancy' ? skin : style === 'overall' || style === 'vest' ? second : main;
  if (side) {
    ctx.save(); ctx.translate(-1, -26); ctx.rotate(-armA * 0.6);
    rr(ctx, -2.5, 0, 5, 11, 2.5); fs(ctx, shade(armCol, -0.1));
    ctx.restore();
  }
  // Rumpf
  const top = -29, bot = seated ? -16 : -11;
  ctx.beginPath();
  if (style === 'dress' || style === 'fancy') {
    ctx.moveTo(-7, top); ctx.lineTo(7, top); ctx.quadraticCurveTo(12, bot - 2, 13, bot); ctx.lineTo(-13, bot); ctx.quadraticCurveTo(-12, bot - 2, -7, top); ctx.closePath();
    if (side) { ctx.beginPath(); ctx.moveTo(-5, top); ctx.lineTo(5, top); ctx.quadraticCurveTo(10, bot - 2, 10, bot); ctx.lineTo(-10, bot); ctx.closePath(); }
    fs(ctx, main);
    if (style === 'fancy') {
      ctx.fillStyle = second;
      for (let i = -12; i <= 12; i += 4) { circ(ctx, i * (side ? 0.8 : 1), bot, 2.4); ctx.fill(); }
    }
    // Kragen
    ctx.fillStyle = second;
    ell(ctx, side ? 2 : 0, top + 1, side ? 4 : 6, 2.4); ctx.fill();
  } else {
    rr(ctx, side ? -6.5 : -9, top, side ? 13 : 18, bot - top + (style === 'sailor' ? 0 : 1), 6);
    const torso = style === 'overall' || style === 'vest' ? second : main;
    fs(ctx, torso);
    if (style === 'overall') {
      rr(ctx, side ? -5 : -7, top + 7, side ? 10 : 14, bot - top - 6, 3); fs(ctx, main);
      if (!side) { ctx.strokeStyle = shade(main, -0.3); ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(-5.5, top + 7); ctx.lineTo(-6.5, top); ctx.moveTo(5.5, top + 7); ctx.lineTo(6.5, top); ctx.stroke(); ctx.fillStyle = '#ffe07a'; circ(ctx, -5.5, top + 8.5, 1.3); ctx.fill(); circ(ctx, 5.5, top + 8.5, 1.3); ctx.fill(); }
    }
    if (style === 'vest') {
      ctx.beginPath(); ctx.moveTo(-9, top + 2); ctx.lineTo(-2, top + 2); ctx.lineTo(-2, bot); ctx.lineTo(-9, bot); ctx.closePath(); fs(ctx, main, 1);
      ctx.beginPath(); ctx.moveTo(9, top + 2); ctx.lineTo(2, top + 2); ctx.lineTo(2, bot); ctx.lineTo(9, bot); ctx.closePath(); fs(ctx, main, 1);
    }
    if (style === 'check') {
      ctx.save(); rr(ctx, -9, top, 18, bot - top + 1, 6); ctx.clip();
      ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1.4;
      for (let i = -9; i < 10; i += 4.5) { ctx.beginPath(); ctx.moveTo(i, top); ctx.lineTo(i, bot); ctx.stroke(); }
      for (let j = top + 3; j < bot; j += 4.5) { ctx.beginPath(); ctx.moveTo(-9, j); ctx.lineTo(9, j); ctx.stroke(); }
      ctx.restore();
    }
    if (style === 'jacket') {
      ctx.strokeStyle = shade(main, -0.35); ctx.lineWidth = 1.2;
      if (!side) { ctx.beginPath(); ctx.moveTo(0, top + 3); ctx.lineTo(0, bot); ctx.stroke(); ctx.fillStyle = '#ffe07a'; circ(ctx, 1.8, top + 8, 1); ctx.fill(); circ(ctx, 1.8, top + 13, 1); ctx.fill(); }
      ctx.fillStyle = '#fff'; ell(ctx, side ? 2 : 0, top + 1.5, side ? 3.5 : 5, 2); ctx.fill();
    }
    if (style === 'sweater') {
      ctx.strokeStyle = shade(main, -0.2); ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(side ? -6 : -9, bot - 3); ctx.lineTo(side ? 6 : 9, bot - 3); ctx.stroke();
      if (!side) { ctx.fillStyle = '#fff6'; ctx.beginPath(); heartPath(ctx, 0, top + 10, 3.4); ctx.fill(); }
    }
    if (style === 'sailor') {
      ctx.fillStyle = second;
      ctx.beginPath(); ctx.moveTo(side ? -6 : -9, top + 1); ctx.lineTo(side ? 6 : 9, top + 1); ctx.lineTo(0, top + 8); ctx.closePath(); ctx.fill();
      rr(ctx, side ? -7 : -10, bot - 5, side ? 14 : 20, 6, 3); fs(ctx, second);
    }
  }
  if (L.apron && dir !== 'up') {
    rr(ctx, side ? 0 : -7, top + 5, side ? 6 : 14, bot - top - 4, 3); fs(ctx, L.apron, 1);
  }
  if (L.shawl) {
    ctx.beginPath(); ctx.moveTo(-10, top + 1); ctx.quadraticCurveTo(0, top + 9, 10, top + 1); ctx.lineTo(8, top - 1); ctx.lineTo(-8, top - 1); ctx.closePath(); fs(ctx, L.shawl, 1);
  }
  if (L.scarf) { rr(ctx, -7, top - 2, 14, 4, 2); fs(ctx, L.scarf, 1); }
  if (L.bag && dir !== 'up') {
    ctx.strokeStyle = shade(L.bag, -0.2); ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(side ? -4 : -7, top + 1); ctx.lineTo(side ? 3 : 7, bot - 5); ctx.stroke();
    rr(ctx, side ? -1 : 4, bot - 8, 8, 7, 2.5); fs(ctx, L.bag);
  }
  // Arme vorne
  if (side) {
    ctx.save(); ctx.translate(1, -26); ctx.rotate(armA * 0.6);
    rr(ctx, -2.5, 0, 5, 11, 2.5); fs(ctx, armCol);
    circ(ctx, 0, 11, 2.6); fs(ctx, skin, 1);
    ctx.restore();
  } else {
    for (const [x, a] of [[-10.5, armA], [10.5, -armA]]) {
      ctx.save(); ctx.translate(x, -27); ctx.rotate(a * 0.25 * Math.sign(x) + (seated ? -Math.sign(x) * 0.5 : 0));
      rr(ctx, -2.5, 0, 5, 11, 2.5); fs(ctx, armCol);
      circ(ctx, 0, 11.5, 2.6); fs(ctx, skin, 1);
      ctx.restore();
    }
  }
}

function heartPath(ctx, x, y, s) {
  ctx.moveTo(x, y + s * 0.3);
  ctx.bezierCurveTo(x - s, y - s * 0.4, x - s * 0.5, y - s * 1.1, x, y - s * 0.5);
  ctx.bezierCurveTo(x + s * 0.5, y - s * 1.1, x + s, y - s * 0.4, x, y + s * 0.3);
}

// o: { dir, t, moving, run, seated, blink, noShadow, action }
export function drawCharacter(ctx, L, o = {}) {
  const dir = o.dir || 'down';
  const t = o.t || 0;
  const moving = !!o.moving;
  const f = o.run ? 14 : 10;
  const legA = moving ? Math.sin(t * f) : 0;
  const armA = moving ? Math.sin(t * f) : Math.sin(t * 1.5) * 0.08;
  const bob = moving ? Math.abs(Math.sin(t * f)) * 1.6 : Math.sin(t * 2) * 0.5;
  const sway = Math.sin(t * (moving ? f : 2)) * (moving ? 2 : 0.6);
  ctx.save();
  if (!o.noShadow && !o.seated) shadow(ctx, 0, 0, 11, 3.8);
  if (dir === 'left') ctx.scale(-1, 1);
  // Squash & Stretch beim Laufen
  const sq = moving ? 1 + Math.sin(t * f * 2) * 0.03 : 1 + Math.sin(t * 2) * 0.012;
  ctx.translate(0, -bob);
  ctx.scale(1 / sq, sq);
  const d = dir === 'left' ? 'right' : dir;
  if (L.kid) ctx.scale(0.88, 0.88);
  drawHairBack(ctx, L, d, sway);
  drawBody(ctx, L, d, legA, armA, o.seated);
  // Kopf
  circ(ctx, 0, HY, HR);
  fs(ctx, L.skin);
  // Ohr (Seite)
  if (d === 'right') { circ(ctx, -3, HY + 1, 3); fs(ctx, L.skin, 1.2); }
  drawBeard(ctx, L, d);
  drawFace(ctx, L, d, o.blink);
  drawHairFront(ctx, L, d, sway);
  drawHat(ctx, L, d);
  ctx.restore();
}

// Porträt (Kopf und Schultern) für Dialoge
export function drawPortrait(ctx, L, size, t = 0, mood = 'happy') {
  ctx.save();
  ctx.clearRect(0, 0, size, size);
  const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.1, size / 2, size / 2, size * 0.7);
  g.addColorStop(0, '#fff8ef');
  g.addColorStop(1, '#ffe1ec');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const k = size * 0.021;
  ctx.translate(size / 2, size * 1.25 + Math.sin(t * 2) * 0.6);
  ctx.scale(k, k);
  drawCharacter(ctx, L, { dir: 'down', t, noShadow: true, blink: mood === 'blink' });
  ctx.restore();
}

export { HATS };
