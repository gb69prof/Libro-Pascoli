// =======================
// SOTTOLINEATURE + LOCALSTORAGE
// =======================

(function () {
  const segSpans = document.querySelectorAll('.textbook span[data-seg]');
  const summaryArea = document.getElementById('summary-text');
  const LS_PREFIX = 'pascoli_fanciullino_seg_';
  const LS_SUMMARY_KEY = 'pascoli_fanciullino_summary';

  if (!segSpans.length) return;

  // Carica stato evidenziazioni da localStorage
  segSpans.forEach(span => {
    const segId = span.getAttribute('data-seg');
    const saved = localStorage.getItem(LS_PREFIX + segId);
    if (saved === '1') {
      span.classList.add('highlighted');
    }
  });

  // Carica riassunto salvato
  if (summaryArea) {
    const savedText = localStorage.getItem(LS_SUMMARY_KEY);
    if (savedText) {
      summaryArea.value = savedText;
    }
    summaryArea.addEventListener('input', () => {
      localStorage.setItem(LS_SUMMARY_KEY, summaryArea.value);
    });
  }

  // Click per attivare/disattivare evidenziazione
  segSpans.forEach(span => {
    span.addEventListener('click', () => {
      const segId = span.getAttribute('data-seg');
      span.classList.toggle('highlighted');
      const isActive = span.classList.contains('highlighted');
      localStorage.setItem(LS_PREFIX + segId, isActive ? '1' : '0');
    });
  });

  // Bottone: genera testo dai segmenti evidenziati
  const btnGenera = document.getElementById('btn-genera-riassunto');
  if (btnGenera && summaryArea) {
    btnGenera.addEventListener('click', () => {
      const evidenziati = Array.from(segSpans)
        .filter(s => s.classList.contains('highlighted'))
        .map(s => s.innerText.trim());

      summaryArea.value = evidenziati.join('\n\n');
      localStorage.setItem(LS_SUMMARY_KEY, summaryArea.value);
    });
  }

  // Bottone: aggiungi selezione manuale al riassunto
  const btnAddSel = document.getElementById('btn-add-selection');
  if (btnAddSel && summaryArea) {
    btnAddSel.addEventListener('click', () => {
      const sel = window.getSelection();
      const text = sel ? sel.toString().trim() : '';
      if (!text) return;

      if (summaryArea.value.trim().length > 0) {
        summaryArea.value += '\n\n' + text;
      } else {
        summaryArea.value = text;
      }
      localStorage.setItem(LS_SUMMARY_KEY, summaryArea.value);
    });
  }

  // Bottone: pulisci evidenziazioni
  const btnClearHighlights = document.getElementById('btn-pulisci-evidenziazioni');
  if (btnClearHighlights) {
    btnClearHighlights.addEventListener('click', () => {
      segSpans.forEach(span => {
        span.classList.remove('highlighted');
        const segId = span.getAttribute('data-seg');
        localStorage.removeItem(LS_PREFIX + segId);
      });
    });
  }

  // Bottone: scarica riassunto come file .txt
  const btnDownload = document.getElementById('btn-download-summary');
  if (btnDownload && summaryArea) {
    btnDownload.addEventListener('click', () => {
      const blob = new Blob([summaryArea.value], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'riassunto_pascoli.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }
})();

// =======================
// QUIZ – CORREZIONE
// =======================

(function () {
  const quizForm = document.getElementById('quiz-form');
  const btnCorreggi = document.getElementById('btn-correggi-quiz');
  const feedback = document.getElementById('quiz-feedback');

  if (!quizForm || !btnCorreggi) return;

  btnCorreggi.addEventListener('click', () => {
    const questions = quizForm.querySelectorAll('.question');
    let total = 0;
    let correct = 0;

    questions.forEach(q => {
      q.classList.remove('correct', 'wrong');
      const qId = q.getAttribute('data-question-id');
      if (!qId) return;

      const radios = q.querySelectorAll('input[type="radio"]');
      if (!radios.length) return;

      total++;
      let chosen = null;
      let rightValue = null;

      radios.forEach(r => {
        if (r.dataset.correct !== undefined) {
          rightValue = r.value;
        }
        if (r.checked) {
          chosen = r.value;
        }
      });

      if (chosen && rightValue && chosen === rightValue) {
        correct++;
        q.classList.add('correct');
      } else if (chosen) {
        q.classList.add('wrong');
      }
    });

    if (feedback) {
      feedback.textContent = `Hai risposto correttamente a ${correct} domande su ${total}.`;
    }
  });
})();

// =======================
// LAVAGNA VIRTUALE
// =======================

(function () {
  const canvas = document.getElementById('lavagna-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const colorInput = document.getElementById('lavagna-color');
  const sizeInput = document.getElementById('lavagna-size');
  const sizeValue = document.getElementById('lavagna-size-value');
  const clearBtn = document.getElementById('lavagna-clear');
  const downloadBtn = document.getElementById('lavagna-download');

  let drawing = false;
  let currentColor = colorInput ? colorInput.value : '#000000';
  let currentSize = sizeInput ? parseInt(sizeInput.value, 10) : 3;
  let lastX = 0;
  let lastY = 0;

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    // Se vuoi preservare il disegno, dovremmo salvare e ridisegnare, qui lo lasciamo "pulito"
  }

  // Primo resize e al cambio di dimensione finestra
  setTimeout(resizeCanvas, 0);
  window.addEventListener('resize', resizeCanvas);

  function getPos(evt) {
    const rect = canvas.getBoundingClientRect();
    let x, y;

    if (evt.touches && evt.touches.length > 0) {
      x = evt.touches[0].clientX - rect.left;
      y = evt.touches[0].clientY - rect.top;
    } else {
      x = evt.clientX - rect.left;
      y = evt.clientY - rect.top;
    }
    return { x, y };
  }

  function startDraw(evt) {
    evt.preventDefault();
    const pos = getPos(evt);
    drawing = true;
    lastX = pos.x;
    lastY = pos.y;
  }

  function draw(evt) {
    if (!drawing) return;
    evt.preventDefault();
    const pos = getPos(evt);

    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastX = pos.x;
    lastY = pos.y;
  }

  function stopDraw(evt) {
    if (!drawing) return;
    evt && evt.preventDefault();
    drawing = false;
  }

  // Pointer events (mouse / penna / touch)
  canvas.addEventListener('pointerdown', startDraw);
  canvas.addEventListener('pointermove', draw);
  canvas.addEventListener('pointerup', stopDraw);
  canvas.addEventListener('pointerleave', stopDraw);
  canvas.addEventListener('pointercancel', stopDraw);

  // Extra touch events per browser vecchi
  canvas.addEventListener('touchstart', startDraw, { passive: false });
  canvas.addEventListener('touchmove', draw, { passive: false });
  canvas.addEventListener('touchend', stopDraw, { passive: false });

  // Cambio colore
  if (colorInput) {
    colorInput.addEventListener('input', () => {
      currentColor = colorInput.value;
    });
  }

  // Cambio spessore
  if (sizeInput && sizeValue) {
    sizeInput.addEventListener('input', () => {
      currentSize = parseInt(sizeInput.value, 10);
      sizeValue.textContent = currentSize + ' px';
    });
  }

  // Pulisci lavagna
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
  }

  // Scarica immagine
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const link = document.createElement('a');
      link.download = 'lavagna-pascoli.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  }
})();
