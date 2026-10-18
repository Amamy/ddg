/**
 * Diamond Diagram Generator
 * Interactive n-gon star-like shape generator with real-time vector and raster export.
 */

(function () {
  'use strict';

  // --- State Configuration ---
  const state = {
    // Geometry
    points: 24,
    radius: 260,
    rotation: 0,
    innerRings: 0,
    ringRatio: 0.5,

    // Vertices
    showVertices: true,
    vertexRadius: 4,
    vertexColor: '#38bdf8',
    showLabels: false,

    // Chords & Connection
    connectMode: 'complete', // 'complete', 'star', 'modular', 'adjacent'
    starStep: 5,
    starLayered: false,
    multiplier: 2.0,
    chordDensity: 1,
    showOuterRing: true,

    // Style
    lineWidth: 1.0,
    lineOpacity: 0.7,
    colorMode: 'single', // 'single', 'length', 'angle', 'dual', 'diamondCyan', 'gemGold', 'cyberNeon'
    primaryColor: '#38bdf8',
    secondaryColor: '#ec4899',
    dashStyle: 'solid',
    glowEffect: false,

    // Canvas & Export
    canvasTheme: '#090d16',
    customBgColor: '#090d16',
    showGrid: true,
    transparentExport: false,

    // Gem Facet Overlay
    enableFacets: false,
    tableRatio: 0.55,
    starFacetRatio: 0.75,
    facetFills: true,
    facetFillOpacity: 0.15,
    facetLineColor: '#7dd3fc',

    // View Transform
    panX: 0,
    panY: 0,
    zoom: 1.0,

    // Interaction & Animation
    hoveredVertex: -1,
    isRotating: false,
    rotationSpeed: 0.35, // deg/frame
  };

  // Preset Configurations
  const presets = {
    mystic24: {
      points: 24,
      radius: 260,
      connectMode: 'complete',
      chordDensity: 1,
      showOuterRing: true,
      colorMode: 'length',
      primaryColor: '#38bdf8',
      secondaryColor: '#ec4899',
      lineWidth: 1.0,
      lineOpacity: 0.7,
      innerRings: 0,
      enableFacets: false,
      glowEffect: false,
    },
    brilliant: {
      points: 16,
      radius: 270,
      connectMode: 'adjacent',
      chordDensity: 1,
      showOuterRing: true,
      innerRings: 1,
      ringRatio: 0.55,
      enableFacets: true,
      tableRatio: 0.55,
      starFacetRatio: 0.75,
      facetFills: true,
      facetFillOpacity: 0.18,
      facetLineColor: '#7dd3fc',
      colorMode: 'diamondCyan',
      primaryColor: '#38bdf8',
      secondaryColor: '#ffffff',
      lineWidth: 1.4,
      lineOpacity: 0.85,
      glowEffect: true,
    },
    octagram: {
      points: 8,
      radius: 280,
      connectMode: 'star',
      starStep: 3,
      starLayered: true,
      chordDensity: 1,
      showOuterRing: true,
      colorMode: 'gemGold',
      primaryColor: '#f59e0b',
      secondaryColor: '#ef4444',
      lineWidth: 2.0,
      lineOpacity: 0.9,
      innerRings: 0,
      enableFacets: false,
      glowEffect: true,
    },
    crownJewel: {
      points: 32,
      radius: 270,
      connectMode: 'adjacent',
      chordDensity: 1,
      showOuterRing: true,
      innerRings: 2,
      ringRatio: 0.6,
      enableFacets: true,
      tableRatio: 0.45,
      starFacetRatio: 0.7,
      facetFills: true,
      facetFillOpacity: 0.22,
      facetLineColor: '#67e8f9',
      colorMode: 'diamondCyan',
      primaryColor: '#67e8f9',
      secondaryColor: '#3b82f6',
      lineWidth: 1.2,
      lineOpacity: 0.8,
      glowEffect: true,
    },
    cardioid: {
      points: 64,
      radius: 260,
      connectMode: 'modular',
      multiplier: 2.0,
      chordDensity: 1,
      showOuterRing: true,
      colorMode: 'cyberNeon',
      primaryColor: '#a855f7',
      secondaryColor: '#ec4899',
      lineWidth: 0.8,
      lineOpacity: 0.75,
      innerRings: 0,
      enableFacets: false,
      glowEffect: false,
    },
    nephroid: {
      points: 72,
      radius: 260,
      connectMode: 'modular',
      multiplier: 3.0,
      chordDensity: 1,
      showOuterRing: true,
      colorMode: 'angle',
      primaryColor: '#38bdf8',
      secondaryColor: '#ec4899',
      lineWidth: 0.8,
      lineOpacity: 0.75,
      innerRings: 0,
      enableFacets: false,
      glowEffect: false,
    },
    decagram: {
      points: 10,
      radius: 270,
      connectMode: 'star',
      starStep: 4,
      starLayered: true,
      chordDensity: 1,
      showOuterRing: true,
      colorMode: 'single',
      primaryColor: '#38bdf8',
      lineWidth: 1.8,
      lineOpacity: 0.9,
      innerRings: 1,
      ringRatio: 0.4,
      enableFacets: false,
      glowEffect: true,
    },
    concentricRings: {
      points: 24,
      radius: 270,
      connectMode: 'complete',
      chordDensity: 2,
      showOuterRing: true,
      innerRings: 3,
      ringRatio: 0.4,
      colorMode: 'length',
      primaryColor: '#06b6d4',
      secondaryColor: '#6366f1',
      lineWidth: 1.0,
      lineOpacity: 0.65,
      enableFacets: false,
      glowEffect: false,
    },
  };

  // --- DOM Elements ---
  const canvas = document.getElementById('diagramCanvas');
  const ctx = canvas.getContext('2d');
  const container = document.getElementById('canvasContainer');
  const tooltip = document.getElementById('vertexTooltip');
  const toast = document.getElementById('toast');

  // Value Display Elements
  const valPoints = document.getElementById('valPoints');
  const valRadius = document.getElementById('valRadius');
  const valRotation = document.getElementById('valRotation');
  const valInnerRings = document.getElementById('valInnerRings');
  const valRingRatio = document.getElementById('valRingRatio');
  const valStarStep = document.getElementById('valStarStep');
  const valMultiplier = document.getElementById('valMultiplier');
  const valChordDensity = document.getElementById('valChordDensity');
  const valLineWidth = document.getElementById('valLineWidth');
  const valLineOpacity = document.getElementById('valLineOpacity');
  const valTableRatio = document.getElementById('valTableRatio');
  const valStarFacetRatio = document.getElementById('valStarFacetRatio');
  const valFacetFillOpacity = document.getElementById('valFacetFillOpacity');

  // Stats
  const statVertices = document.getElementById('statVertices');
  const statChords = document.getElementById('statChords');
  const statZoom = document.getElementById('statZoom');

  // Inputs
  const inputPoints = document.getElementById('inputPoints');
  const inputRadius = document.getElementById('inputRadius');
  const inputRotation = document.getElementById('inputRotation');
  const inputInnerRings = document.getElementById('inputInnerRings');
  const inputRingRatio = document.getElementById('inputRingRatio');
  const ringRatioGroup = document.getElementById('ringRatioGroup');
  const checkShowVertices = document.getElementById('checkShowVertices');
  const vertexSettings = document.getElementById('vertexSettings');
  const inputVertexRadius = document.getElementById('inputVertexRadius');
  const inputVertexColor = document.getElementById('inputVertexColor');
  const checkShowLabels = document.getElementById('checkShowLabels');

  const starSettings = document.getElementById('starSettings');
  const inputStarStep = document.getElementById('inputStarStep');
  const checkStarLayered = document.getElementById('checkStarLayered');
  const modularSettings = document.getElementById('modularSettings');
  const inputMultiplier = document.getElementById('inputMultiplier');
  const inputChordDensity = document.getElementById('inputChordDensity');
  const checkShowOuterRing = document.getElementById('checkShowOuterRing');

  const inputLineWidth = document.getElementById('inputLineWidth');
  const inputLineOpacity = document.getElementById('inputLineOpacity');
  const selectColorMode = document.getElementById('selectColorMode');
  const primaryColorGroup = document.getElementById('primaryColorGroup');
  const secondaryColorGroup = document.getElementById('secondaryColorGroup');
  const inputLineColor = document.getElementById('inputLineColor');
  const inputLineColor2 = document.getElementById('inputLineColor2');
  const selectDashStyle = document.getElementById('selectDashStyle');
  const checkGlowEffect = document.getElementById('checkGlowEffect');

  const selectCanvasTheme = document.getElementById('selectCanvasTheme');
  const customBgColorGroup = document.getElementById('customBgColorGroup');
  const inputCustomBgColor = document.getElementById('inputCustomBgColor');
  const checkShowGrid = document.getElementById('checkShowGrid');
  const checkTransparentExport = document.getElementById('checkTransparentExport');

  const checkEnableFacets = document.getElementById('checkEnableFacets');
  const facetControls = document.getElementById('facetControls');
  const inputTableRatio = document.getElementById('inputTableRatio');
  const inputStarFacetRatio = document.getElementById('inputStarFacetRatio');
  const checkFacetFills = document.getElementById('checkFacetFills');
  const inputFacetFillOpacity = document.getElementById('inputFacetFillOpacity');
  const inputFacetLineColor = document.getElementById('inputFacetLineColor');

  // Toolbar & Header Elements
  const quickPresetSelect = document.getElementById('quickPresetSelect');
  const btnRandomize = document.getElementById('btnRandomize');
  const btnReset = document.getElementById('btnReset');
  const btnExportMenu = document.getElementById('btnExportMenu');
  const exportDropdownMenu = document.getElementById('exportDropdownMenu');
  const btnToggleTheme = document.getElementById('btnToggleTheme');
  const btnZoomIn = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');
  const btnResetView = document.getElementById('btnResetView');
  const btnAnimateSpin = document.getElementById('btnAnimateSpin');

  // Export buttons
  const exportSVG = document.getElementById('exportSVG');
  const copySVG = document.getElementById('copySVG');
  const exportPNG1x = document.getElementById('exportPNG1x');
  const exportPNG2x = document.getElementById('exportPNG2x');
  const exportPNG4x = document.getElementById('exportPNG4x');
  const exportJPEG = document.getElementById('exportJPEG');

  // --- Helper Functions ---

  function degToRad(deg) {
    return (deg * Math.PI) / 180;
  }

  function hexToRgb(hex) {
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map((c) => c + c).join('');
    }
    const num = parseInt(cleanHex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  }

  function hexToRgba(hex, alpha) {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function interpolateColor(hex1, hex2, factor) {
    const c1 = hexToRgb(hex1);
    const c2 = hexToRgb(hex2);
    const r = Math.round(c1.r + factor * (c2.r - c1.r));
    const g = Math.round(c1.g + factor * (c2.g - c1.g));
    const b = Math.round(c1.b + factor * (c2.b - c1.b));
    return `rgb(${r}, ${g}, ${b})`;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 2400);
  }

  // --- Geometry & Diagram Calculations ---

  /**
   * Computes the regular n-gon vertices centered at (cx, cy)
   */
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

  /**
   * Generates chord connections list [{ i, j, length, color, isHighlight }]
   */
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
      const isHighlight = state.hoveredVertex === u || state.hoveredVertex === v;

      chords.push({
        i: u,
        j: v,
        p1,
        p2,
        dist,
        isHighlight,
      });
    }

    const density = Math.max(1, currentSettings.chordDensity);

    if (mode === 'complete') {
      // Connect every pair of points
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
    } else if (mode === 'adjacent') {
      // Perimeter & radiating spoke web
      for (let i = 0; i < n; i++) {
        addPair(i, (i + 1) % n);
        // Diamond cross chords
        addPair(i, (i + 2) % n);
        if (n % 2 === 0) {
          addPair(i, (i + n / 2) % n);
        }
      }
    }

    // Outer boundary ring check
    if (currentSettings.showOuterRing) {
      for (let i = 0; i < n; i++) {
        addPair(i, (i + 1) % n);
      }
    }

    return chords;
  }

  /**
   * Resolves chord stroke color based on chosen color palette mode
   */
  function resolveChordColor(chord, maxDist, currentSettings) {
    if (chord.isHighlight) {
      return '#38bdf8'; // bright highlight for interactive hover
    }

    const mode = currentSettings.colorMode;
    const opacity = currentSettings.lineOpacity;

    if (mode === 'single') {
      return hexToRgba(currentSettings.primaryColor, opacity);
    }

    if (mode === 'dual' || mode === 'length') {
      const factor = Math.min(1, Math.max(0, chord.dist / maxDist));
      const c1 = currentSettings.primaryColor;
      const c2 = currentSettings.secondaryColor;
      return hexToRgba(interpolateColor(c1, c2, factor), opacity);
    }

    if (mode === 'angle') {
      const midAngle = (chord.p1.angle + chord.p2.angle) / 2;
      const hue = Math.round(((midAngle + Math.PI) / (2 * Math.PI)) * 360) % 360;
      return `hsla(${hue}, 85%, 65%, ${opacity})`;
    }

    if (mode === 'diamondCyan') {
      // Crystal diamond palette: icy white to deep cyan
      const factor = Math.min(1, Math.max(0, chord.dist / maxDist));
      return hexToRgba(interpolateColor('#ffffff', '#06b6d4', factor), opacity);
    }

    if (mode === 'gemGold') {
      // Imperial topaz / gold diamond palette
      const factor = Math.min(1, Math.max(0, chord.dist / maxDist));
      return hexToRgba(interpolateColor('#fef08a', '#ea580c', factor), opacity);
    }

    if (mode === 'cyberNeon') {
      // Neon pink to purple/blue
      const factor = Math.min(1, Math.max(0, chord.dist / maxDist));
      return hexToRgba(interpolateColor('#ec4899', '#8b5cf6', factor), opacity);
    }

    return hexToRgba(currentSettings.primaryColor, opacity);
  }

  /**
   * Get active background color
   */
  function getActiveBgColor() {
    return state.canvasTheme === 'custom' ? state.customBgColor : state.canvasTheme;
  }

  // --- Canvas Rendering Engine ---

  function resizeCanvas() {
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    render();
  }

  function setDashStyle(ctxInstance, dashStyle, lineWidth) {
    if (dashStyle === 'dashed') {
      ctxInstance.setLineDash([lineWidth * 5, lineWidth * 3]);
    } else if (dashStyle === 'dotted') {
      ctxInstance.setLineDash([lineWidth * 1.5, lineWidth * 2.5]);
    } else if (dashStyle === 'longdash') {
      ctxInstance.setLineDash([lineWidth * 10, lineWidth * 4]);
    } else {
      ctxInstance.setLineDash([]);
    }
  }

  function render() {
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);

    // 1. Draw Canvas Background
    const bgColor = getActiveBgColor();
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Drafting Grid if enabled
    if (state.showGrid) {
      drawBackgroundGrid(ctx, width, height, bgColor);
    }

    // 3. Apply Viewport Transform (Pan & Zoom)
    const centerX = width / 2 + state.panX;
    const centerY = height / 2 + state.panY;
    ctx.translate(centerX, centerY);
    ctx.scale(state.zoom, state.zoom);

    // 4. Calculate Main Vertices
    const vertices = computeVertices(0, 0, state.radius, state.points, state.rotation);
    const chords = computeChords(vertices, state.points, state.connectMode, state);
    const maxDist = 2 * state.radius;

    // Update Footer Status
    statVertices.textContent = state.points;
    statChords.textContent = chords.length;
    statZoom.textContent = `${Math.round(state.zoom * 100)}%`;

    // 5. Draw Brilliant Cut Facet Overlays & Fills if enabled
    if (state.enableFacets) {
      drawBrilliantFacets(ctx, vertices, state);
    }

    // 6. Draw Concentric Inner Rings if configured
    if (state.innerRings > 0) {
      drawConcentricRings(ctx, state);
    }

    // 7. Draw Chords
    ctx.save();
    if (state.glowEffect) {
      ctx.shadowBlur = 12;
      ctx.shadowColor = state.primaryColor;
    }

    setDashStyle(ctx, state.dashStyle, state.lineWidth);

    // Non-highlight chords first
    for (let c of chords) {
      if (!c.isHighlight) {
        ctx.beginPath();
        ctx.moveTo(c.p1.x, c.p1.y);
        ctx.lineTo(c.p2.x, c.p2.y);
        ctx.strokeStyle = resolveChordColor(c, maxDist, state);
        ctx.lineWidth = state.lineWidth;
        ctx.stroke();
      }
    }

    // Highlight chords on top
    if (state.hoveredVertex !== -1) {
      for (let c of chords) {
        if (c.isHighlight) {
          ctx.beginPath();
          ctx.moveTo(c.p1.x, c.p1.y);
          ctx.lineTo(c.p2.x, c.p2.y);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = Math.max(2, state.lineWidth * 2);
          ctx.shadowBlur = 16;
          ctx.shadowColor = '#38bdf8';
          ctx.stroke();
        }
      }
    }
    ctx.restore();

    // 8. Draw Vertices and Labels
    if (state.showVertices) {
      drawVertices(ctx, vertices, state);
    }

    ctx.restore();
  }

  /**
   * Draws modern drafting grid pattern
   */
  function drawBackgroundGrid(ctxInstance, w, h, bgHex) {
    const isDark = hexToRgb(bgHex).r < 120;
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.05)';
    const dotColor = isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.15)';
    const step = 40 * state.zoom;
    const startX = (w / 2 + state.panX) % step;
    const startY = (h / 2 + state.panY) % step;

    ctxInstance.save();
    ctxInstance.strokeStyle = gridColor;
    ctxInstance.lineWidth = 1;

    ctxInstance.beginPath();
    for (let x = startX; x < w; x += step) {
      ctxInstance.moveTo(x, 0);
      ctxInstance.lineTo(x, h);
    }
    for (let y = startY; y < h; y += step) {
      ctxInstance.moveTo(0, y);
      ctxInstance.lineTo(w, y);
    }
    ctxInstance.stroke();

    // Central crosshair marker
    const cx = w / 2 + state.panX;
    const cy = h / 2 + state.panY;
    ctxInstance.fillStyle = dotColor;
    ctxInstance.beginPath();
    ctxInstance.arc(cx, cy, 3, 0, Math.PI * 2);
    ctxInstance.fill();
    ctxInstance.restore();
  }

  /**
   * Draws gemstone diamond facets with translucent prismatic fills
   */
  function drawBrilliantFacets(ctxInstance, vertices, currentSettings) {
    const n = vertices.length;
    const rTable = currentSettings.radius * currentSettings.tableRatio;
    const rStar = currentSettings.radius * currentSettings.starFacetRatio;
    const rot = degToRad(currentSettings.rotation);

    // Inner table vertices
    const tableVerts = computeVertices(0, 0, rTable, n, currentSettings.rotation);
    // Intermediate star facet vertices (half-step rotation)
    const starAngleOffset = 360 / (2 * n);
    const starVerts = computeVertices(0, 0, rStar, n, currentSettings.rotation + starAngleOffset);

    ctxInstance.save();

    // Translucent shimmer face fills
    if (currentSettings.facetFills) {
      const fillOpacity = currentSettings.facetFillOpacity;

      // Table face (center flat polygon)
      ctxInstance.beginPath();
      tableVerts.forEach((v, idx) => {
        if (idx === 0) ctxInstance.moveTo(v.x, v.y);
        else ctxInstance.lineTo(v.x, v.y);
      });
      ctxInstance.closePath();
      ctxInstance.fillStyle = `rgba(224, 242, 254, ${fillOpacity * 1.5})`;
      ctxInstance.fill();

      // Kite facets & star triangles
      for (let i = 0; i < n; i++) {
        const next = (i + 1) % n;
        // Triangular star facet
        ctxInstance.beginPath();
        ctxInstance.moveTo(tableVerts[i].x, tableVerts[i].y);
        ctxInstance.lineTo(starVerts[i].x, starVerts[i].y);
        ctxInstance.lineTo(tableVerts[next].x, tableVerts[next].y);
        ctxInstance.closePath();
        ctxInstance.fillStyle = i % 2 === 0
          ? `rgba(56, 189, 248, ${fillOpacity})`
          : `rgba(147, 197, 253, ${fillOpacity * 1.2})`;
        ctxInstance.fill();

        // Outer kite facet
        ctxInstance.beginPath();
        ctxInstance.moveTo(tableVerts[i].x, tableVerts[i].y);
        ctxInstance.lineTo(starVerts[i].x, starVerts[i].y);
        ctxInstance.lineTo(vertices[i].x, vertices[i].y);
        ctxInstance.closePath();
        ctxInstance.fillStyle = `rgba(186, 230, 253, ${fillOpacity * 0.8})`;
        ctxInstance.fill();
      }
    }

    // Facet line strokes
    ctxInstance.strokeStyle = hexToRgba(currentSettings.facetLineColor, 0.75);
    ctxInstance.lineWidth = 1.2;
    ctxInstance.setLineDash([]);

    // 1. Table polygon
    ctxInstance.beginPath();
    tableVerts.forEach((v, idx) => {
      if (idx === 0) ctxInstance.moveTo(v.x, v.y);
      else ctxInstance.lineTo(v.x, v.y);
    });
    ctxInstance.closePath();
    ctxInstance.stroke();

    // 2. Star connections & bezel kite lines
    ctxInstance.beginPath();
    for (let i = 0; i < n; i++) {
      const next = (i + 1) % n;
      // Table to star
      ctxInstance.moveTo(tableVerts[i].x, tableVerts[i].y);
      ctxInstance.lineTo(starVerts[i].x, starVerts[i].y);
      ctxInstance.lineTo(tableVerts[next].x, tableVerts[next].y);

      // Star to girdle / outer vertices
      ctxInstance.moveTo(starVerts[i].x, starVerts[i].y);
      ctxInstance.lineTo(vertices[i].x, vertices[i].y);
      ctxInstance.moveTo(starVerts[i].x, starVerts[i].y);
      ctxInstance.lineTo(vertices[next].x, vertices[next].y);
    }
    ctxInstance.stroke();

    ctxInstance.restore();
  }

  /**
   * Draws concentric multi-ring layers
   */
  function drawConcentricRings(ctxInstance, currentSettings) {
    const rings = currentSettings.innerRings;
    const baseR = currentSettings.radius;
    const ratio = currentSettings.ringRatio;

    ctxInstance.save();
    ctxInstance.strokeStyle = hexToRgba(currentSettings.primaryColor, currentSettings.lineOpacity * 0.5);
    ctxInstance.lineWidth = currentSettings.lineWidth * 0.8;

    for (let rIdx = 1; rIdx <= rings; rIdx++) {
      const currentRadius = baseR * Math.pow(ratio, rIdx);
      const innerVerts = computeVertices(0, 0, currentRadius, currentSettings.points, currentSettings.rotation);

      // Ring polygon
      ctxInstance.beginPath();
      innerVerts.forEach((v, idx) => {
        if (idx === 0) ctxInstance.moveTo(v.x, v.y);
        else ctxInstance.lineTo(v.x, v.y);
      });
      ctxInstance.closePath();
      ctxInstance.stroke();

      // Radial spokes
      ctxInstance.beginPath();
      innerVerts.forEach((v) => {
        ctxInstance.moveTo(0, 0);
        ctxInstance.lineTo(v.x, v.y);
      });
      ctxInstance.stroke();
    }
    ctxInstance.restore();
  }

  /**
   * Draws vertex circles and number labels
   */
  function drawVertices(ctxInstance, vertices, currentSettings) {
    ctxInstance.save();
    const vRadius = currentSettings.vertexRadius;
    const vColor = currentSettings.vertexColor;

    vertices.forEach((v, idx) => {
      const isHover = state.hoveredVertex === idx;

      // Outer glow for hovered vertex
      if (isHover) {
        ctxInstance.beginPath();
        ctxInstance.arc(v.x, v.y, vRadius + 4, 0, Math.PI * 2);
        ctxInstance.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctxInstance.fill();
      }

      // Vertex circle
      ctxInstance.beginPath();
      ctxInstance.arc(v.x, v.y, isHover ? vRadius + 2 : vRadius, 0, Math.PI * 2);
      ctxInstance.fillStyle = isHover ? '#ffffff' : vColor;
      ctxInstance.fill();
      ctxInstance.strokeStyle = '#041226';
      ctxInstance.lineWidth = 1.5;
      ctxInstance.stroke();

      // Vertex numeric label
      if (currentSettings.showLabels || isHover) {
        const labelR = state.radius + 18;
        const lx = labelR * Math.cos(v.angle);
        const ly = labelR * Math.sin(v.angle);

        ctxInstance.font = isHover ? 'bold 12px JetBrains Mono' : '10px JetBrains Mono';
        ctxInstance.fillStyle = isHover ? '#38bdf8' : '#94a3b8';
        ctxInstance.textAlign = 'center';
        ctxInstance.textBaseline = 'middle';
        ctxInstance.fillText(`${idx}`, lx, ly);
      }
    });

    ctxInstance.restore();
  }

  // --- Vector SVG Generator ---

  /**
   * Generates a fully standalone SVG string matching canvas state
   */
  function generateSVG(transparent) {
    const size = Math.ceil(state.radius * 2 + 100);
    const cx = size / 2;
    const cy = size / 2;
    const vertices = computeVertices(cx, cy, state.radius, state.points, state.rotation);
    const chords = computeChords(vertices, state.points, state.connectMode, state);
    const maxDist = 2 * state.radius;
    const bgColor = transparent ? 'none' : getActiveBgColor();

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">\n`;

    // Background
    if (!transparent) {
      svg += `  <rect width="100%" height="100%" fill="${bgColor}"/>\n`;
    }

    // Gem Facet Fills & Lines if enabled
    if (state.enableFacets) {
      const rTable = state.radius * state.tableRatio;
      const rStar = state.radius * state.starFacetRatio;
      const starAngleOffset = 360 / (2 * state.points);
      const tableVerts = computeVertices(cx, cy, rTable, state.points, state.rotation);
      const starVerts = computeVertices(cx, cy, rStar, state.points, state.rotation + starAngleOffset);

      if (state.facetFills) {
        const tPts = tableVerts.map((v) => `${v.x.toFixed(1)},${v.y.toFixed(1)}`).join(' ');
        svg += `  <polygon points="${tPts}" fill="rgba(224, 242, 254, ${state.facetFillOpacity * 1.5})"/>\n`;

        for (let i = 0; i < state.points; i++) {
          const next = (i + 1) % state.points;
          const sPts = `${tableVerts[i].x.toFixed(1)},${tableVerts[i].y.toFixed(1)} ${starVerts[i].x.toFixed(1)},${starVerts[i].y.toFixed(1)} ${tableVerts[next].x.toFixed(1)},${tableVerts[next].y.toFixed(1)}`;
          const col = i % 2 === 0 ? `rgba(56, 189, 248, ${state.facetFillOpacity})` : `rgba(147, 197, 253, ${state.facetFillOpacity * 1.2})`;
          svg += `  <polygon points="${sPts}" fill="${col}"/>\n`;
        }
      }

      // Facet stroke lines
      const facetCol = hexToRgba(state.facetLineColor, 0.75);
      const tPts = tableVerts.map((v) => `${v.x.toFixed(1)},${v.y.toFixed(1)}`).join(' ');
      svg += `  <polygon points="${tPts}" fill="none" stroke="${facetCol}" stroke-width="1.2"/>\n`;

      for (let i = 0; i < state.points; i++) {
        const next = (i + 1) % state.points;
        svg += `  <line x1="${tableVerts[i].x.toFixed(1)}" y1="${tableVerts[i].y.toFixed(1)}" x2="${starVerts[i].x.toFixed(1)}" y2="${starVerts[i].y.toFixed(1)}" stroke="${facetCol}" stroke-width="1.2"/>\n`;
        svg += `  <line x1="${starVerts[i].x.toFixed(1)}" y1="${starVerts[i].y.toFixed(1)}" x2="${vertices[i].x.toFixed(1)}" y2="${vertices[i].y.toFixed(1)}" stroke="${facetCol}" stroke-width="1.2"/>\n`;
        svg += `  <line x1="${starVerts[i].x.toFixed(1)}" y1="${starVerts[i].y.toFixed(1)}" x2="${vertices[next].x.toFixed(1)}" y2="${vertices[next].y.toFixed(1)}" stroke="${facetCol}" stroke-width="1.2"/>\n`;
      }
    }

    // Chords
    let dashAttr = '';
    if (state.dashStyle === 'dashed') dashAttr = ` stroke-dasharray="${state.lineWidth * 5},${state.lineWidth * 3}"`;
    else if (state.dashStyle === 'dotted') dashAttr = ` stroke-dasharray="${state.lineWidth * 1.5},${state.lineWidth * 2.5}"`;
    else if (state.dashStyle === 'longdash') dashAttr = ` stroke-dasharray="${state.lineWidth * 10},${state.lineWidth * 4}"`;

    chords.forEach((c) => {
      const col = resolveChordColor(c, maxDist, state);
      svg += `  <line x1="${c.p1.x.toFixed(1)}" y1="${c.p1.y.toFixed(1)}" x2="${c.p2.x.toFixed(1)}" y2="${c.p2.y.toFixed(1)}" stroke="${col}" stroke-width="${state.lineWidth}"${dashAttr}/>\n`;
    });

    // Vertices
    if (state.showVertices) {
      vertices.forEach((v, idx) => {
        svg += `  <circle cx="${v.x.toFixed(1)}" cy="${v.y.toFixed(1)}" r="${state.vertexRadius}" fill="${state.vertexColor}" stroke="#041226" stroke-width="1.5"/>\n`;
        if (state.showLabels) {
          const labelR = state.radius + 18;
          const lx = cx + labelR * Math.cos(v.angle);
          const ly = cy + labelR * Math.sin(v.angle);
          svg += `  <text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" fill="#94a3b8" font-size="10" font-family="monospace" text-anchor="middle" dominant-baseline="central">${idx}</text>\n`;
        }
      });
    }

    svg += `</svg>`;
    return svg;
  }

  // --- Export Actions ---

  function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Saved ${filename}`);
  }

  function exportAsSVG() {
    const svgContent = generateSVG(state.transparentExport);
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    downloadFile(blob, `diamond-diagram-n${state.points}.svg`);
  }

  function copySVGToClipboard() {
    const svgContent = generateSVG(state.transparentExport);
    navigator.clipboard.writeText(svgContent).then(() => {
      showToast('SVG XML copied to clipboard!');
    });
  }

  function exportAsRaster(format, scale) {
    const size = Math.ceil(state.radius * 2 + 100);
    const offscreen = document.createElement('canvas');
    offscreen.width = size * scale;
    offscreen.height = size * scale;
    const offCtx = offscreen.getContext('2d');

    offCtx.scale(scale, scale);

    const cx = size / 2;
    const cy = size / 2;
    const bgColor = getActiveBgColor();

    if (format === 'jpeg' || !state.transparentExport) {
      offCtx.fillStyle = bgColor;
      offCtx.fillRect(0, 0, size, size);
    }

    offCtx.translate(cx, cy);

    // Vertices & chords
    const vertices = computeVertices(0, 0, state.radius, state.points, state.rotation);
    const chords = computeChords(vertices, state.points, state.connectMode, state);
    const maxDist = 2 * state.radius;

    if (state.enableFacets) {
      drawBrilliantFacets(offCtx, vertices, state);
    }

    if (state.innerRings > 0) {
      drawConcentricRings(offCtx, state);
    }

    if (state.glowEffect) {
      offCtx.shadowBlur = 12 * scale;
      offCtx.shadowColor = state.primaryColor;
    }

    setDashStyle(offCtx, state.dashStyle, state.lineWidth);

    chords.forEach((c) => {
      offCtx.beginPath();
      offCtx.moveTo(c.p1.x, c.p1.y);
      offCtx.lineTo(c.p2.x, c.p2.y);
      offCtx.strokeStyle = resolveChordColor(c, maxDist, state);
      offCtx.lineWidth = state.lineWidth;
      offCtx.stroke();
    });

    if (state.showVertices) {
      drawVertices(offCtx, vertices, state);
    }

    const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const ext = format === 'jpeg' ? 'jpg' : 'png';
    offscreen.toBlob((blob) => {
      downloadFile(blob, `diamond-diagram-n${state.points}-${scale}x.${ext}`);
    }, mime, 0.95);
  }

  // --- UI Synchronizer ---

  function syncUIFromState() {
    inputPoints.value = state.points;
    valPoints.textContent = state.points;

    inputRadius.value = state.radius;
    valRadius.textContent = `${state.radius} px`;

    inputRotation.value = Math.round(state.rotation) % 360;
    valRotation.textContent = `${Math.round(state.rotation) % 360}°`;

    inputInnerRings.value = state.innerRings;
    valInnerRings.textContent = state.innerRings;
    ringRatioGroup.style.display = state.innerRings > 0 ? 'block' : 'none';

    inputRingRatio.value = state.ringRatio;
    valRingRatio.textContent = state.ringRatio.toFixed(2);

    checkShowVertices.checked = state.showVertices;
    vertexSettings.style.display = state.showVertices ? 'block' : 'none';
    inputVertexRadius.value = state.vertexRadius;
    inputVertexColor.value = state.vertexColor;
    checkShowLabels.checked = state.showLabels;

    // Mode Radio Buttons
    const modeRadios = document.querySelectorAll('input[name="connectMode"]');
    modeRadios.forEach((radio) => {
      radio.checked = radio.value === state.connectMode;
    });

    starSettings.style.display = state.connectMode === 'star' ? 'block' : 'none';
    modularSettings.style.display = state.connectMode === 'modular' ? 'block' : 'none';

    inputStarStep.value = state.starStep;
    valStarStep.textContent = state.starStep;
    checkStarLayered.checked = state.starLayered;

    inputMultiplier.value = state.multiplier;
    valMultiplier.textContent = state.multiplier.toFixed(1);

    inputChordDensity.value = state.chordDensity;
    valChordDensity.textContent = state.chordDensity === 1 ? '1 (All)' : state.chordDensity;
    checkShowOuterRing.checked = state.showOuterRing;

    inputLineWidth.value = state.lineWidth;
    valLineWidth.textContent = `${state.lineWidth.toFixed(1)} px`;

    inputLineOpacity.value = Math.round(state.lineOpacity * 100);
    valLineOpacity.textContent = `${Math.round(state.lineOpacity * 100)}%`;

    selectColorMode.value = state.colorMode;
    const isDual = state.colorMode === 'dual' || state.colorMode === 'length';
    secondaryColorGroup.style.display = isDual ? 'block' : 'none';

    inputLineColor.value = state.primaryColor;
    inputLineColor2.value = state.secondaryColor;

    selectDashStyle.value = state.dashStyle;
    checkGlowEffect.checked = state.glowEffect;

    selectCanvasTheme.value = state.canvasTheme;
    customBgColorGroup.style.display = state.canvasTheme === 'custom' ? 'block' : 'none';
    inputCustomBgColor.value = state.customBgColor;
    checkShowGrid.checked = state.showGrid;
    checkTransparentExport.checked = state.transparentExport;

    checkEnableFacets.checked = state.enableFacets;
    facetControls.style.display = state.enableFacets ? 'block' : 'none';
    inputTableRatio.value = Math.round(state.tableRatio * 100);
    valTableRatio.textContent = `${Math.round(state.tableRatio * 100)}%`;
    inputStarFacetRatio.value = Math.round(state.starFacetRatio * 100);
    valStarFacetRatio.textContent = `${Math.round(state.starFacetRatio * 100)}%`;
    checkFacetFills.checked = state.facetFills;
    inputFacetFillOpacity.value = Math.round(state.facetFillOpacity * 100);
    valFacetFillOpacity.textContent = `${Math.round(state.facetFillOpacity * 100)}%`;
    inputFacetLineColor.value = state.facetLineColor;

    render();
  }

  function applyPreset(presetKey) {
    const p = presets[presetKey];
    if (!p) return;
    Object.assign(state, p);
    syncUIFromState();
    showToast(`Preset loaded: ${quickPresetSelect.options[quickPresetSelect.selectedIndex].text}`);
  }

  function randomize() {
    const nChoices = [6, 8, 10, 12, 16, 20, 24, 30, 32, 48, 64];
    state.points = nChoices[Math.floor(Math.random() * nChoices.length)];
    const modes = ['complete', 'star', 'modular', 'adjacent'];
    state.connectMode = modes[Math.floor(Math.random() * modes.length)];

    state.starStep = Math.floor(Math.random() * Math.floor(state.points / 2)) + 1;
    state.starLayered = Math.random() > 0.5;
    state.multiplier = parseFloat((Math.random() * 8 + 2).toFixed(1));
    state.chordDensity = Math.random() > 0.75 ? 2 : 1;

    const palettes = ['single', 'length', 'angle', 'diamondCyan', 'gemGold', 'cyberNeon'];
    state.colorMode = palettes[Math.floor(Math.random() * palettes.length)];
    state.glowEffect = Math.random() > 0.6;
    state.innerRings = Math.random() > 0.65 ? Math.floor(Math.random() * 3) + 1 : 0;
    state.enableFacets = Math.random() > 0.7;

    syncUIFromState();
    showToast('Randomized diamond configuration!');
  }

  // --- Animation Loop ---

  let animId = null;
  function animationLoop() {
    if (state.isRotating) {
      state.rotation = (state.rotation + state.rotationSpeed) % 360;
      inputRotation.value = Math.round(state.rotation);
      valRotation.textContent = `${Math.round(state.rotation)}°`;
      render();
      animId = requestAnimationFrame(animationLoop);
    }
  }

  function toggleRotation() {
    state.isRotating = !state.isRotating;
    btnAnimateSpin.classList.toggle('active', state.isRotating);
    if (state.isRotating) {
      animId = requestAnimationFrame(animationLoop);
    } else if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }

  // --- Event Listeners Initialization ---

  function initEventListeners() {
    window.addEventListener('resize', resizeCanvas);

    // Tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        tabButtons.forEach((b) => b.classList.remove('active'));
        tabPanels.forEach((p) => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`tab-${tabId}`).classList.add('active');
      });
    });

    // Inputs: Geometry
    inputPoints.addEventListener('input', (e) => {
      state.points = parseInt(e.target.value, 10);
      valPoints.textContent = state.points;
      inputStarStep.max = Math.floor(state.points / 2);
      render();
    });

    inputRadius.addEventListener('input', (e) => {
      state.radius = parseInt(e.target.value, 10);
      valRadius.textContent = `${state.radius} px`;
      render();
    });

    inputRotation.addEventListener('input', (e) => {
      state.rotation = parseInt(e.target.value, 10);
      valRotation.textContent = `${state.rotation}°`;
      render();
    });

    inputInnerRings.addEventListener('input', (e) => {
      state.innerRings = parseInt(e.target.value, 10);
      valInnerRings.textContent = state.innerRings;
      ringRatioGroup.style.display = state.innerRings > 0 ? 'block' : 'none';
      render();
    });

    inputRingRatio.addEventListener('input', (e) => {
      state.ringRatio = parseFloat(e.target.value);
      valRingRatio.textContent = state.ringRatio.toFixed(2);
      render();
    });

    checkShowVertices.addEventListener('change', (e) => {
      state.showVertices = e.target.checked;
      vertexSettings.style.display = state.showVertices ? 'block' : 'none';
      render();
    });

    inputVertexRadius.addEventListener('input', (e) => {
      state.vertexRadius = parseInt(e.target.value, 10) || 4;
      render();
    });

    inputVertexColor.addEventListener('input', (e) => {
      state.vertexColor = e.target.value;
      render();
    });

    checkShowLabels.addEventListener('change', (e) => {
      state.showLabels = e.target.checked;
      render();
    });

    // Point quick chips
    document.querySelectorAll('[data-set-points]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.points = parseInt(btn.getAttribute('data-set-points'), 10);
        inputPoints.value = state.points;
        valPoints.textContent = state.points;
        render();
      });
    });

    // Multiplier chips
    document.querySelectorAll('[data-set-mult]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.multiplier = parseFloat(btn.getAttribute('data-set-mult'));
        inputMultiplier.value = state.multiplier;
        valMultiplier.textContent = state.multiplier.toFixed(1);
        render();
      });
    });

    // Connection Mode
    document.querySelectorAll('input[name="connectMode"]').forEach((radio) => {
      radio.addEventListener('change', (e) => {
        state.connectMode = e.target.value;
        starSettings.style.display = state.connectMode === 'star' ? 'block' : 'none';
        modularSettings.style.display = state.connectMode === 'modular' ? 'block' : 'none';
        render();
      });
    });

    inputStarStep.addEventListener('input', (e) => {
      state.starStep = parseInt(e.target.value, 10);
      valStarStep.textContent = state.starStep;
      render();
    });

    checkStarLayered.addEventListener('change', (e) => {
      state.starLayered = e.target.checked;
      render();
    });

    inputMultiplier.addEventListener('input', (e) => {
      state.multiplier = parseFloat(e.target.value);
      valMultiplier.textContent = state.multiplier.toFixed(1);
      render();
    });

    inputChordDensity.addEventListener('input', (e) => {
      state.chordDensity = parseInt(e.target.value, 10);
      valChordDensity.textContent = state.chordDensity === 1 ? '1 (All)' : state.chordDensity;
      render();
    });

    checkShowOuterRing.addEventListener('change', (e) => {
      state.showOuterRing = e.target.checked;
      render();
    });

    // Style
    inputLineWidth.addEventListener('input', (e) => {
      state.lineWidth = parseFloat(e.target.value);
      valLineWidth.textContent = `${state.lineWidth.toFixed(1)} px`;
      render();
    });

    inputLineOpacity.addEventListener('input', (e) => {
      state.lineOpacity = parseInt(e.target.value, 10) / 100;
      valLineOpacity.textContent = `${e.target.value}%`;
      render();
    });

    selectColorMode.addEventListener('change', (e) => {
      state.colorMode = e.target.value;
      const isDual = state.colorMode === 'dual' || state.colorMode === 'length';
      secondaryColorGroup.style.display = isDual ? 'block' : 'none';
      render();
    });

    inputLineColor.addEventListener('input', (e) => {
      state.primaryColor = e.target.value;
      render();
    });

    inputLineColor2.addEventListener('input', (e) => {
      state.secondaryColor = e.target.value;
      render();
    });

    selectDashStyle.addEventListener('change', (e) => {
      state.dashStyle = e.target.value;
      render();
    });

    checkGlowEffect.addEventListener('change', (e) => {
      state.glowEffect = e.target.checked;
      render();
    });

    selectCanvasTheme.addEventListener('change', (e) => {
      state.canvasTheme = e.target.value;
      customBgColorGroup.style.display = state.canvasTheme === 'custom' ? 'block' : 'none';
      render();
    });

    inputCustomBgColor.addEventListener('input', (e) => {
      state.customBgColor = e.target.value;
      render();
    });

    checkShowGrid.addEventListener('change', (e) => {
      state.showGrid = e.target.checked;
      render();
    });

    checkTransparentExport.addEventListener('change', (e) => {
      state.transparentExport = e.target.checked;
    });

    // Gem Facets
    checkEnableFacets.addEventListener('change', (e) => {
      state.enableFacets = e.target.checked;
      facetControls.style.display = state.enableFacets ? 'block' : 'none';
      render();
    });

    inputTableRatio.addEventListener('input', (e) => {
      state.tableRatio = parseInt(e.target.value, 10) / 100;
      valTableRatio.textContent = `${e.target.value}%`;
      render();
    });

    inputStarFacetRatio.addEventListener('input', (e) => {
      state.starFacetRatio = parseInt(e.target.value, 10) / 100;
      valStarFacetRatio.textContent = `${e.target.value}%`;
      render();
    });

    checkFacetFills.addEventListener('change', (e) => {
      state.facetFills = e.target.checked;
      render();
    });

    inputFacetFillOpacity.addEventListener('input', (e) => {
      state.facetFillOpacity = parseInt(e.target.value, 10) / 100;
      valFacetFillOpacity.textContent = `${e.target.value}%`;
      render();
    });

    inputFacetLineColor.addEventListener('input', (e) => {
      state.facetLineColor = e.target.value;
      render();
    });

    // Presets & Randomize
    quickPresetSelect.addEventListener('change', (e) => {
      applyPreset(e.target.value);
    });

    btnRandomize.addEventListener('click', randomize);

    btnReset.addEventListener('click', () => {
      applyPreset('mystic24');
      state.panX = 0;
      state.panY = 0;
      state.zoom = 1.0;
      quickPresetSelect.value = 'mystic24';
      render();
    });

    btnAnimateSpin.addEventListener('click', toggleRotation);

    // Zoom and Pan Controls
    btnZoomIn.addEventListener('click', () => {
      state.zoom = Math.min(4.0, state.zoom * 1.2);
      render();
    });

    btnZoomOut.addEventListener('click', () => {
      state.zoom = Math.max(0.2, state.zoom / 1.2);
      render();
    });

    btnResetView.addEventListener('click', () => {
      state.zoom = 1.0;
      state.panX = 0;
      state.panY = 0;
      render();
    });

    // Export Dropdown
    btnExportMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      exportDropdownMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
      exportDropdownMenu.classList.add('hidden');
    });

    exportSVG.addEventListener('click', exportAsSVG);
    copySVG.addEventListener('click', copySVGToClipboard);
    exportPNG1x.addEventListener('click', () => exportAsRaster('png', 1));
    exportPNG2x.addEventListener('click', () => exportAsRaster('png', 2));
    exportPNG4x.addEventListener('click', () => exportAsRaster('png', 4));
    exportJPEG.addEventListener('click', () => exportAsRaster('jpeg', 2));

    // Theme Toggle (Dark / Light)
    btnToggleTheme.addEventListener('click', () => {
      const isDark = document.body.classList.contains('theme-dark');
      if (isDark) {
        document.body.classList.remove('theme-dark');
        document.body.classList.add('theme-light');
        if (state.canvasTheme === '#090d16' || state.canvasTheme === '#000000') {
          state.canvasTheme = '#f8fafc';
          selectCanvasTheme.value = '#f8fafc';
        }
      } else {
        document.body.classList.remove('theme-light');
        document.body.classList.add('theme-dark');
        if (state.canvasTheme === '#ffffff' || state.canvasTheme === '#f8fafc') {
          state.canvasTheme = '#090d16';
          selectCanvasTheme.value = '#090d16';
        }
      }
      render();
    });

    // Interactive Canvas Mouse Events (Pan, Zoom, Vertex Hit-test)
    setupCanvasInteractions();
  }

  function setupCanvasInteractions() {
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX - state.panX;
      startY = e.clientY - state.panY;
      container.classList.add('panning');
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        state.panX = e.clientX - startX;
        state.panY = e.clientY - startY;
        render();
        return;
      }

      // Hit-testing vertices on hover
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      const centerX = width / 2 + state.panX;
      const centerY = height / 2 + state.panY;

      // Transform mouse coord to diagram coord
      const diagX = (mouseX - centerX) / state.zoom;
      const diagY = (mouseY - centerY) / state.zoom;

      const vertices = computeVertices(0, 0, state.radius, state.points, state.rotation);
      let closestIdx = -1;
      let minDistance = 18 / state.zoom; // hit threshold

      vertices.forEach((v, idx) => {
        const dist = Math.hypot(v.x - diagX, v.y - diagY);
        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = idx;
        }
      });

      if (closestIdx !== state.hoveredVertex) {
        state.hoveredVertex = closestIdx;
        if (closestIdx !== -1) {
          tooltip.textContent = `Vertex ${closestIdx}`;
          tooltip.style.left = `${mouseX}px`;
          tooltip.style.top = `${mouseY}px`;
          tooltip.classList.remove('hidden');
        } else {
          tooltip.classList.add('hidden');
        }
        render();
      } else if (closestIdx !== -1) {
        tooltip.style.left = `${mouseX}px`;
        tooltip.style.top = `${mouseY}px`;
      }
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        container.classList.remove('panning');
      }
    });

    // Zoom on wheel
    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      state.zoom = Math.min(5.0, Math.max(0.2, state.zoom * zoomFactor));
      render();
    }, { passive: false });
  }

  // --- Initialize App ---
  function init() {
    syncUIFromState();
    initEventListeners();
    resizeCanvas();
  }

  // Run when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
