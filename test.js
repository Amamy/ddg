/**
 * Test suite for Diamond Diagram algorithms & SVG generation
 */
const assert = require('assert');

// Port geometry functions for headless testing
function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

function computeVertices(cx, cy, r, count, rotDeg) {
  const rot = degToRad(rotDeg);
  const step = (2 * Math.PI) / count;
  const verts = [];
  for (let i = 0; i < count; i++) {
    const angle = rot + i * step - Math.PI / 2;
    verts.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      angle: angle,
      index: i,
    });
  }
  return verts;
}

function computeChords(vertices, n, mode, currentSettings) {
  const chords = [];
  const addedPairs = new Set();

  function addPair(i, j) {
    if (i === j) return;
    const u = Math.min(i, j);
    const v = Math.max(i, j);
    const key = `${u}-${v}`;
    if (addedPairs.has(key)) return;
    addedPairs.add(key);

    const p1 = vertices[u];
    const p2 = vertices[v];
    const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

    chords.push({ i: u, j: v, p1, p2, dist });
  }

  const density = Math.max(1, currentSettings.chordDensity || 1);

  if (mode === 'complete') {
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if ((j - i) % density === 0 || density === 1) {
          addPair(i, j);
        }
      }
    }
  } else if (mode === 'star') {
    const k = Math.min(currentSettings.starStep, Math.floor(n / 2));
    const steps = currentSettings.starLayered ? Array.from({ length: k }, (_, idx) => idx + 1) : [k];
    steps.forEach((step) => {
      for (let i = 0; i < n; i++) {
        if (i % density === 0) {
          addPair(i, (i + step) % n);
        }
      }
    });
  } else if (mode === 'modular') {
    const m = currentSettings.multiplier;
    for (let i = 0; i < n; i++) {
      if (i % density === 0) {
        const target = Math.round(i * m) % n;
        addPair(i, target);
      }
    }
  }

  if (currentSettings.showOuterRing) {
    for (let i = 0; i < n; i++) {
      addPair(i, (i + 1) % n);
    }
  }

  return chords;
}

console.log('Running Diamond Diagram algorithm tests...');

// Test 1: Vertices count and radius
const verts = computeVertices(0, 0, 100, 8, 0);
assert.strictEqual(verts.length, 8, 'Must generate 8 vertices');
assert(Math.abs(Math.hypot(verts[0].x, verts[0].y) - 100) < 1e-6, 'Radius of vertices must equal 100');
console.log('✓ Test 1: Vertices generation passed.');

// Test 2: Complete Graph (Mystic Rose) chord count: n*(n-1)/2
const n = 12;
const completeChords = computeChords(computeVertices(0, 0, 100, n, 0), n, 'complete', {
  chordDensity: 1,
  showOuterRing: true,
});
const expectedCompleteChords = (n * (n - 1)) / 2;
assert.strictEqual(completeChords.length, expectedCompleteChords, `Complete graph K_${n} must have ${expectedCompleteChords} chords`);
console.log(`✓ Test 2: Complete graph K_12 chord count passed (${expectedCompleteChords} chords).`);

// Test 3: Star polygon {8/3} chords
const starVerts = computeVertices(0, 0, 100, 8, 0);
const starChords = computeChords(starVerts, 8, 'star', {
  starStep: 3,
  starLayered: false,
  showOuterRing: false,
  chordDensity: 1,
});
assert.strictEqual(starChords.length, 8, 'Star polygon {8/3} without outer ring must have 8 edges');
console.log('✓ Test 3: Star polygon {8/3} edge count passed.');

// Test 4: Modular multiplication (Cardioid m=2)
const cardioidChords = computeChords(computeVertices(0, 0, 100, 16, 0), 16, 'modular', {
  multiplier: 2,
  showOuterRing: false,
  chordDensity: 1,
});
assert(cardioidChords.length > 0, 'Cardioid chords should be generated');
console.log(`✓ Test 4: Modular cardioid generated ${cardioidChords.length} chords.`);

console.log('All tests passed successfully!');
