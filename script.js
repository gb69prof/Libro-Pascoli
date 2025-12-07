// Gestione evidenziazioni e riassunto con localStorage
const STORAGE_KEY = "pascoli_fanciullino_highlights_v1";
const SUMMARY_KEY = "pascoli_fanciullino_summary_v1";

// -------------------- HIGHLIGHTS (BLOCCHI PREIMPOSTATI) --------------------

function loadHighlights() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    document.querySelectorAll("[data-seg]").forEach(span => {
      const id = span.getAttribute("data-seg");
      if (saved[id]) {
        span.classList.add("highlighted");
      }
    });
  } catch (e) {
    console.warn("Impossibile caricare le evidenziazioni:", e);
  }
}

function saveHighlights() {
  const state = {};
  document.querySelectorAll("[data-seg]").forEach(span => {
    const id = span.getAttribute("data-seg");
    state[id] = span.classList.contains("highlighted");
  });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Impossibile salvare le evidenziazioni:", e);
  }
}

function toggleHighlight(event) {
  const span = event.target.closest("[data-seg]");
  if (!span) return;
  span.classList.toggle("highlighted");
  saveHighlights();
}

// -------------------- RIASSUNTO (TESTO GENERATO) --------------------

function loadSummary() {
  const textarea = document.getElementById("summary-text");
  if (!textarea) return;
  try {
    const saved = localStorage.getItem(SUMMARY_KEY);
    if (saved) {
      textarea.value = saved;
    }
  } catch (e) {
    console.warn("Impossibile caricare il riassunto:", e);
  }
}

function saveSummary() {
  const textarea = document.getElementById("summary-text");
  if (!textarea) return;
  try {
    localStorage.setItem(SUMMARY_KEY, textarea.value);
  } catch (e) {
    console.warn("Impossibile salvare il riassunto:", e);
  }
}

// Usa SOLO i blocchi evidenziati (data-seg evidenziati)
function generateSummaryFromHighlights() {
  const parts = [];
  document.querySelectorAll("[data-seg].highlighted").forEach(span => {
    parts.push(span.innerText.trim());
  });
  const textArea = document.getElementById("summary-text");
  if (!textArea) return;
  textArea.value = parts.join("\n\n");
  saveSummary();
  textArea.focus();
}

// Aggiunge al riassunto quello che l'utente ha selezionato a mano
function addSelectionToSummary() {
  const selection = window.getSelection();
  if (!selection) return;

  const text = selection.toString().trim();
  if (!text) {
    // niente selezione utile
    return;
  }

  const textarea = document.getElementById("summary-text");
  if (!textarea) return;

  const current = textarea.value.trim();
  const toAdd = text;

  textarea.value = current ? current + "\n\n" + toAdd : toAdd;
  saveSummary();
  textarea.focus();
}

// Pulisce evidenziazioni e riassunto
function clearHighlightsAndSummary() {
  document.querySelectorAll("[data-seg]").forEach(span => {
    span.classList.remove("highlighted");
  });
  saveHighlights();

  const textarea = document.getElementById("summary-text");
  if (textarea) {
    textarea.value = "";
  }
  saveSummary();
}

// Scarica il riassunto come file di testo (.txt)
function downloadSummaryFile() {
  const textarea = document.getElementById("summary-text");
  if (!textarea) return;

  const content = textarea.value.trim();
  if (!content) {
    // nessun contenuto da scaricare
    return;
  }

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "riassunto_pascoli.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

// -------------------- QUIZ --------------------

function correctQuiz() {
  const questions = document.querySelectorAll(".question");
  let correct = 0;
  let total = questions.length;

  questions.forEach(q => {
    const inputs = q.querySelectorAll("input[type='radio']");
    let isCorrect = false;
    inputs.forEach(input => {
      const label = input.parentElement;
      // reset sfondo
      label.style.background = "transparent";
      label.style.borderRadius = "0.3rem";
      if (input.checked && input.hasAttribute("data-correct")) {
        isCorrect = true;
      }
    });
    if (isCorrect) {
      correct += 1;
    }
  });

  // Evidenzia le risposte scelte
  questions.forEach(q => {
    const inputs = q.querySelectorAll("input[type='radio']");
    inputs.forEach(input => {
      const label = input.parentElement;
      if (input.checked && input.hasAttribute("data-correct")) {
        label.style.background = "#dcfce7";
      } else if (input.checked && !input.hasAttribute("data-correct")) {
        label.style.background = "#fee2e2";
      }
    });
  });

  const feedback = document.getElementById("quiz-feedback");
  feedback.textContent = `Hai risposto correttamente a ${correct} domanda/e su ${total}.`;
  if (correct === total) {
    feedback.style.color = "#16a34a";
  } else if (correct >= total / 2) {
    feedback.style.color = "#f59e0b";
  } else {
    feedback.style.color = "#dc2626";
  }
}

// -------------------- INIT --------------------

document.addEventListener("DOMContentLoaded", () => {
  // Evidenziazioni blocchi preimpostati
  document.querySelector(".textbook")?.addEventListener("click", toggleHighlight);
  loadHighlights();

  // Riassunto
  loadSummary();

  const btnGen = document.getElementById("btn-genera-riassunto");
  const btnAddSel = document.getElementById("btn-add-selection");
  const btnClear = document.getElementById("btn-pulisci-evidenziazioni");
  const btnQuiz = document.getElementById("btn-correggi-quiz");
  const btnDownload = document.getElementById("btn-download-summary");

  if (btnGen) {
    btnGen.addEventListener("click", generateSummaryFromHighlights);
  }

  if (btnAddSel) {
    btnAddSel.addEventListener("click", addSelectionToSummary);
  }

  if (btnClear) {
    btnClear.addEventListener("click", clearHighlightsAndSummary);
  }

  if (btnQuiz) {
    btnQuiz.addEventListener("click", correctQuiz);
  }

  if (btnDownload) {
    btnDownload.addEventListener("click", downloadSummaryFile);
  }

  // Salvataggio automatico se lo studente modifica a mano il riassunto
  const textarea = document.getElementById("summary-text");
  if (textarea) {
    textarea.addEventListener("input", saveSummary);
  }
});
