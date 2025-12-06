// Gestione evidenziazioni con localStorage
const STORAGE_KEY = "pascoli_fanciullino_highlights_v1";

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

function generateSummary() {
  const parts = [];
  document.querySelectorAll("[data-seg].highlighted").forEach(span => {
    parts.push(span.innerText.trim());
  });
  const textArea = document.getElementById("summary-text");
  textArea.value = parts.join("\n\n");
  textArea.focus();
}

function clearHighlights() {
  document.querySelectorAll("[data-seg]").forEach(span => {
    span.classList.remove("highlighted");
  });
  saveHighlights();
  const textArea = document.getElementById("summary-text");
  if (textArea) textArea.value = "";
}

// Quiz
function correctQuiz() {
  const questions = document.querySelectorAll(".question");
  let correct = 0;
  let total = questions.length;

  questions.forEach(q => {
    const inputs = q.querySelectorAll("input[type='radio']");
    let isCorrect = false;
    inputs.forEach(input => {
      const label = input.parentElement;
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

  // Evidenzia le risposte corrette scelte
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

document.addEventListener("DOMContentLoaded", () => {
  // Evidenziazioni
  document.querySelector(".textbook")?.addEventListener("click", toggleHighlight);
  loadHighlights();

  document.getElementById("btn-genera-riassunto")?.addEventListener("click", generateSummary);
  document.getElementById("btn-pulisci-evidenziazioni")?.addEventListener("click", clearHighlights);

  // Quiz
  document.getElementById("btn-correggi-quiz")?.addEventListener("click", correctQuiz);
});
