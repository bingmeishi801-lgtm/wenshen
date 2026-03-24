(function () {
  "use strict";

  const STORAGE_KEY = "beforeYouInk.briefData";
  const PLACEHOLDER = "Not provided yet";
  const DEFAULT_BRIEF_DATA = {
    meaningShort: "",
    meaningLong: "",
    priorities: [],
    visualElementsSelected: [],
    visualElementsInclude: "",
    visualElementsAvoid: "",
    styleSelected: "",
    styleNotes: "",
    placementSelected: "",
    sizeSelected: "",
    placementNotes: "",
    finalNotes: "",
    email: "",
    sendBrief: false,
    wantSample: false
  };

  function normalize(value) {
    if (value === null || value === undefined) return "";
    const text = String(value).trim();
    if (!text || text === "null" || text === "undefined") return "";
    return text;
  }

  function normalizeArray(value) {
    return Array.isArray(value) ? value.map(normalize).filter(Boolean) : [];
  }

  function boolValue(value) {
    return value === true || value === "true" || value === 1 || value === "1";
  }

  function readStorage() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (_) {
      return null;
    }
  }

  function writeStorage(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (_) {
      return;
    }
  }

  function loadBriefData() {
    let parsed = null;
    try {
      parsed = JSON.parse(readStorage() || "null");
    } catch (_) {
      parsed = null;
    }
    const source = parsed && typeof parsed === "object" ? parsed : {};
    return {
      ...DEFAULT_BRIEF_DATA,
      ...source,
      meaningShort: normalize(source.meaningShort),
      meaningLong: normalize(source.meaningLong),
      priorities: normalizeArray(source.priorities),
      visualElementsSelected: normalizeArray(source.visualElementsSelected),
      visualElementsInclude: normalize(source.visualElementsInclude),
      visualElementsAvoid: normalize(source.visualElementsAvoid),
      styleSelected: normalize(source.styleSelected),
      styleNotes: normalize(source.styleNotes),
      placementSelected: normalize(source.placementSelected),
      sizeSelected: normalize(source.sizeSelected),
      placementNotes: normalize(source.placementNotes),
      finalNotes: normalize(source.finalNotes),
      email: normalize(source.email),
      sendBrief: boolValue(source.sendBrief),
      wantSample: boolValue(source.wantSample)
    };
  }

  function updateBriefData(mutator) {
    const draft = loadBriefData();
    mutator(draft);
    writeStorage(draft);
    return draft;
  }

  function pageName() {
    const path = window.location.pathname || "";
    const file = path.split("/").pop();
    return file || "start.html";
  }

  function visualSummary(data) {
    const chunks = [];
    if (data.visualElementsSelected.length) chunks.push(data.visualElementsSelected.join(", "));
    if (normalize(data.visualElementsInclude)) chunks.push(`Include: ${normalize(data.visualElementsInclude)}`);
    if (normalize(data.visualElementsAvoid)) chunks.push(`Avoid: ${normalize(data.visualElementsAvoid)}`);
    return chunks.join(" · ");
  }

  function notesSummary(data) {
    return [normalize(data.placementNotes), normalize(data.finalNotes)].filter(Boolean).join(" · ");
  }

  function previewValues(data) {
    return {
      meaning: normalize(data.meaningShort) || normalize(data.meaningLong) || PLACEHOLDER,
      meaningLong: normalize(data.meaningLong) || PLACEHOLDER,
      visual: visualSummary(data) || PLACEHOLDER,
      style: normalize(data.styleSelected) || normalize(data.styleNotes) || PLACEHOLDER,
      placement: normalize(data.placementSelected) || PLACEHOLDER,
      size: normalize(data.sizeSelected) || PLACEHOLDER,
      notes: notesSummary(data) || PLACEHOLDER
    };
  }

  function setValidationMessage(anchor, message) {
    let el = document.getElementById("brief-validation-message");
    if (!el) {
      el = document.createElement("p");
      el.id = "brief-validation-message";
      el.className = "text-xs text-red-600 italic mt-2";
      const parent = anchor && anchor.parentElement ? anchor.parentElement : document.body;
      parent.appendChild(el);
    }
    el.textContent = message || "";
  }

  function clearValidationMessage() {
    const el = document.getElementById("brief-validation-message");
    if (el) el.textContent = "";
  }

  function setChipActive(button, active, mode) {
    const on = !!active;
    if (mode === "start") {
      button.classList.toggle("border-2", on);
      button.classList.toggle("border", !on);
      button.classList.toggle("border-primary-container", on);
      button.classList.toggle("bg-primary-container", on);
      button.classList.toggle("text-white", on);
      button.classList.toggle("shadow-md", on);
      button.classList.toggle("border-surface-container-highest", !on);
      button.classList.toggle("bg-white", !on);
      button.classList.toggle("shadow-sm", !on);
      button.classList.toggle("hover:border-primary-container", !on);
      button.classList.toggle("hover:bg-primary-container/5", !on);
      return;
    }
    if (mode === "step2") {
      button.classList.toggle("border-primary-container", on);
      button.classList.toggle("bg-primary-container", on);
      button.classList.toggle("text-on-primary", on);
      button.classList.toggle("shadow-md", on);
      button.classList.toggle("border-outline-variant", !on);
      button.classList.toggle("text-on-surface-variant", !on);
      button.classList.toggle("hover:border-primary-container", !on);
      button.classList.toggle("hover:bg-surface-container-low", !on);
      return;
    }
    if (mode === "step4-placement") {
      button.classList.toggle("border-primary-container", on);
      button.classList.toggle("bg-primary-container", on);
      button.classList.toggle("text-on-primary", on);
      button.classList.toggle("border-outline-variant", !on);
      button.classList.toggle("text-on-surface-variant", !on);
      button.classList.toggle("hover:border-primary", !on);
    }
  }

  function setSizeCardActive(card, active) {
    const on = !!active;
    card.classList.toggle("border-2", on);
    card.classList.toggle("border-primary-container", on);
    card.classList.toggle("bg-surface-container-lowest", on);
    card.classList.toggle("shadow-[0_10px_30px_rgba(0,33,71,0.08)]", on);
    card.classList.toggle("border", !on);
    card.classList.toggle("border-outline-variant", !on);
    card.classList.toggle("bg-surface", !on);
    card.classList.toggle("hover:bg-surface-container-low", !on);

    const iconBox = card.querySelector(".w-10.h-10.rounded-lg");
    const icon = iconBox ? iconBox.querySelector(".material-symbols-outlined") : null;
    const selector = card.querySelector(".w-5.h-5.rounded-full.border-2");

    if (iconBox) {
      iconBox.classList.toggle("bg-primary-container", on);
      iconBox.classList.toggle("bg-surface-container-highest", !on);
    }
    if (icon) {
      icon.classList.toggle("text-white", on);
      icon.classList.toggle("text-primary-container", !on);
    }

    if (selector) {
      selector.classList.toggle("border-primary-container", on);
      selector.classList.toggle("bg-primary-container", on);
      selector.classList.toggle("border-outline-variant", !on);
      selector.classList.add("flex", "items-center", "justify-center");

      let check = selector.querySelector('.material-symbols-outlined[data-icon="check"]');
      if (!check) {
        check = document.createElement("span");
        check.className = "material-symbols-outlined text-white text-[12px] font-bold leading-none";
        check.setAttribute("data-icon", "check");
        check.textContent = "check";
        selector.appendChild(check);
      }
      check.classList.toggle("opacity-100", on);
      check.classList.toggle("opacity-0", !on);
    }
  }

  function setStyleCardActive(label, active) {
    const on = !!active;
    const card = label.querySelector("div.p-6.rounded-xl");
    const radio = label.querySelector('input[type="radio"][name="style"]');
    const indicator = card ? card.querySelector(".w-4.h-4.rounded-full.border") : null;

    if (radio) {
      radio.checked = on;
    }

    if (card) {
      card.classList.toggle("border-primary-container", on);
      card.classList.toggle("bg-surface-container-lowest", on);
      card.classList.toggle("border-transparent", !on);
      card.classList.toggle("bg-surface-container-low", !on);
    }

    if (indicator) {
      indicator.classList.toggle("border-primary-container", on);
      indicator.classList.toggle("bg-primary-container", on);
      indicator.classList.toggle("border-outline", !on);

      let dot = Array.from(indicator.children).find(function (child) {
        return child.classList &&
          child.classList.contains("w-1.5") &&
          child.classList.contains("h-1.5") &&
          child.classList.contains("rounded-full");
      });

      if (!dot) {
        dot = document.createElement("div");
        dot.className = "brief-style-dot w-1.5 h-1.5 rounded-full bg-white opacity-0";
        indicator.appendChild(dot);
      }

      dot.classList.add("brief-style-dot", "bg-white", "w-1.5", "h-1.5", "rounded-full");
      dot.classList.toggle("opacity-100", on);
      dot.classList.toggle("opacity-0", !on);
    }
  }

  function labelSpan(aside, text) {
    const wanted = normalize(text).toLowerCase();
    return Array.from(aside.querySelectorAll("span")).find(function (span) {
      return normalize(span.textContent).toLowerCase() === wanted;
    }) || null;
  }

  function setAsideValue(aside, label, value) {
    const marker = labelSpan(aside, label);
    if (!marker) return;
    const block = marker.parentElement;
    if (!block) return;
    const p = block.querySelector("p");
    if (p) {
      p.textContent = value;
      return;
    }
    const wrap = block.querySelector(".flex.flex-wrap");
    if (wrap) {
      wrap.innerHTML = "";
      const span = document.createElement("span");
      span.className = "px-2 py-1 bg-surface-container-low rounded text-[11px] text-primary-container";
      span.textContent = value;
      wrap.appendChild(span);
      return;
    }
    const textDiv = block.querySelector("div");
    if (textDiv) {
      textDiv.textContent = value;
    }
  }

  function renderPreview(data) {
    const aside = document.querySelector("aside");
    if (!aside) return;
    const values = previewValues(data);

    setAsideValue(aside, "Meaning", values.meaning);
    setAsideValue(aside, "Visual Elements", values.visual);
    setAsideValue(aside, "Style", values.style);
    setAsideValue(aside, "Placement", values.placement);
    setAsideValue(aside, "Size", values.size);
    setAsideValue(aside, "Notes", values.notes);

    const pending = aside.querySelectorAll("span");
    pending.forEach(function (span) {
      const text = normalize(span.textContent);
      if (text.startsWith("Placement:")) span.textContent = `Placement: ${values.placement}`;
      if (text.startsWith("Size:")) span.textContent = `Size: ${values.size}`;
      if (text.startsWith("Notes:")) span.textContent = `Notes: ${values.notes}`;
    });
  }

  function setupStep1() {
    const shortInput = document.querySelector('input[type="text"][placeholder^="For example: A memorial piece"]');
    const longInput = document.querySelector('textarea[placeholder^="What does this tattoo represent to you?"]');
    const priorityWrap = Array.from(document.querySelectorAll("label")).find(function (label) {
      return normalize(label.textContent).toLowerCase().includes("what matters most to you");
    });
    const chips = priorityWrap && priorityWrap.nextElementSibling ? Array.from(priorityWrap.nextElementSibling.querySelectorAll("button")) : [];
    const continueBtn = document.querySelector('a[href="step-2.html"]');

    let data = loadBriefData();
    if (shortInput) shortInput.value = data.meaningShort;
    if (longInput) longInput.value = data.meaningLong;

    chips.forEach(function (chip) {
      const value = normalize(chip.textContent);
      setChipActive(chip, data.priorities.includes(value), "start");
      chip.addEventListener("click", function (event) {
        event.preventDefault();
        data = updateBriefData(function (draft) {
          const set = new Set(draft.priorities);
          if (set.has(value)) set.delete(value); else set.add(value);
          draft.priorities = Array.from(set);
        });
        setChipActive(chip, data.priorities.includes(value), "start");
        renderPreview(data);
      });
    });

    if (shortInput) shortInput.addEventListener("input", function () {
      data = updateBriefData(function (draft) { draft.meaningShort = shortInput.value; });
      renderPreview(data);
    });
    if (longInput) longInput.addEventListener("input", function () {
      data = updateBriefData(function (draft) { draft.meaningLong = longInput.value; });
      renderPreview(data);
    });

    if (continueBtn) {
      continueBtn.addEventListener("click", function (event) {
        data = updateBriefData(function (draft) {
          if (shortInput) draft.meaningShort = shortInput.value;
          if (longInput) draft.meaningLong = longInput.value;
        });
        if (!normalize(data.meaningShort)) {
          event.preventDefault();
          setValidationMessage(continueBtn, "Please add your one-sentence tattoo idea before continuing.");
          return;
        }
        clearValidationMessage();
      });
    }

    renderPreview(data);
  }

  function setupStep2() {
    const includeInput = document.querySelector('input[type="text"][placeholder^="For example: a lily"]');
    const avoidInput = document.querySelector('input[type="text"][placeholder^="For example: no skulls"]');
    const chips = Array.from(document.querySelectorAll("main .space-y-6 .flex.flex-wrap.gap-3 button"));

    let data = loadBriefData();
    if (includeInput) includeInput.value = data.visualElementsInclude;
    if (avoidInput) avoidInput.value = data.visualElementsAvoid;

    chips.forEach(function (chip) {
      const value = normalize(chip.textContent);
      setChipActive(chip, data.visualElementsSelected.includes(value), "step2");
      chip.addEventListener("click", function (event) {
        event.preventDefault();
        data = updateBriefData(function (draft) {
          const set = new Set(draft.visualElementsSelected);
          if (set.has(value)) set.delete(value); else set.add(value);
          draft.visualElementsSelected = Array.from(set);
        });
        setChipActive(chip, data.visualElementsSelected.includes(value), "step2");
        renderPreview(data);
      });
    });

    if (includeInput) includeInput.addEventListener("input", function () {
      data = updateBriefData(function (draft) { draft.visualElementsInclude = includeInput.value; });
      renderPreview(data);
    });
    if (avoidInput) avoidInput.addEventListener("input", function () {
      data = updateBriefData(function (draft) { draft.visualElementsAvoid = avoidInput.value; });
      renderPreview(data);
    });

    renderPreview(data);
  }

  function setupStep3() {
    const labels = Array.from(document.querySelectorAll("label.group.cursor-pointer"));
    const textarea = document.querySelector('textarea[placeholder^="For example: I want it subtle"]');
    const continueBtn = document.querySelector('a[href="step-4.html"]');

    let data = loadBriefData();

    function applyStyleSelection(selectedValue) {
      labels.forEach(function (styleLabel) {
        const styleTitle = styleLabel.querySelector("h3");
        const styleValue = normalize(styleTitle && styleTitle.textContent);
        setStyleCardActive(styleLabel, styleValue === selectedValue);
      });
    }

    labels.forEach(function (label) {
      const radio = label.querySelector('input[type="radio"][name="style"]');
      const title = label.querySelector("h3");
      const value = normalize(title && title.textContent);
      if (!radio || !value) return;
      radio.value = value;

      setStyleCardActive(label, data.styleSelected === value);

      radio.addEventListener("change", function () {
        data = updateBriefData(function (draft) { draft.styleSelected = value; });
        applyStyleSelection(value);
        renderPreview(data);
      });
      label.addEventListener("click", function () {
        data = updateBriefData(function (draft) { draft.styleSelected = value; });
        applyStyleSelection(value);
        renderPreview(data);
      });
    });

    applyStyleSelection(data.styleSelected);

    if (textarea) {
      textarea.value = data.styleNotes;
      textarea.addEventListener("input", function () {
        data = updateBriefData(function (draft) { draft.styleNotes = textarea.value; });
        renderPreview(data);
      });
    }

    if (continueBtn) {
      continueBtn.addEventListener("click", function (event) {
        data = loadBriefData();
        if (!normalize(data.styleSelected)) {
          event.preventDefault();
          setValidationMessage(continueBtn, "Please choose a style before continuing.");
          return;
        }
        clearValidationMessage();
      });
    }

    renderPreview(data);
  }

  function setupStep4() {
    const placementLabel = Array.from(document.querySelectorAll("label")).find(function (el) {
      return normalize(el.textContent).toLowerCase() === "preferred placement";
    });
    const placementButtons = placementLabel && placementLabel.nextElementSibling ? Array.from(placementLabel.nextElementSibling.querySelectorAll("button")) : [];

    const sizeLabel = Array.from(document.querySelectorAll("label")).find(function (el) {
      return normalize(el.textContent).toLowerCase() === "preferred size";
    });
    const sizeCards = sizeLabel && sizeLabel.nextElementSibling ? Array.from(sizeLabel.nextElementSibling.querySelectorAll("div.cursor-pointer.group.relative")) : [];

    const notes = document.querySelector('textarea[placeholder^="Add any specific details about placement or size"]');
    const continueBtn = document.querySelector('a[href="step-5.html"]');

    let data = loadBriefData();

    placementButtons.forEach(function (button) {
      const value = normalize(button.textContent);
      setChipActive(button, data.placementSelected === value, "step4-placement");
      button.addEventListener("click", function (event) {
        event.preventDefault();
        data = updateBriefData(function (draft) { draft.placementSelected = value; });
        placementButtons.forEach(function (b) {
          setChipActive(b, normalize(b.textContent) === value, "step4-placement");
        });
        renderPreview(data);
      });
    });

    sizeCards.forEach(function (card) {
      const title = card.querySelector("h4");
      const value = normalize(title && title.textContent);
      if (!value) return;
      setSizeCardActive(card, data.sizeSelected === value);
      card.addEventListener("click", function () {
        data = updateBriefData(function (draft) { draft.sizeSelected = value; });
        sizeCards.forEach(function (c) {
          const heading = c.querySelector("h4");
          setSizeCardActive(c, normalize(heading && heading.textContent) === value);
        });
        renderPreview(data);
      });
    });

    if (notes) {
      notes.value = data.placementNotes;
      notes.addEventListener("input", function () {
        data = updateBriefData(function (draft) { draft.placementNotes = notes.value; });
        renderPreview(data);
      });
    }

    if (continueBtn) {
      continueBtn.addEventListener("click", function (event) {
        data = loadBriefData();
        if (!normalize(data.placementSelected) || !normalize(data.sizeSelected)) {
          event.preventDefault();
          setValidationMessage(continueBtn, "Please choose placement and size (or select Not sure yet). ");
          return;
        }
        clearValidationMessage();
      });
    }

    renderPreview(data);
  }

  function setupStep5() {
    const notes = document.getElementById("notes");
    const email = document.getElementById("email");
    const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
    const createBtn = document.querySelector('a[href="brief-result.html"]');

    let data = loadBriefData();
    if (notes) notes.value = data.finalNotes;
    if (email) email.value = data.email;
    if (checkboxes[0]) checkboxes[0].checked = data.sendBrief;
    if (checkboxes[1]) checkboxes[1].checked = data.wantSample;

    if (notes) notes.addEventListener("input", function () {
      data = updateBriefData(function (draft) { draft.finalNotes = notes.value; });
      renderPreview(data);
    });
    if (email) email.addEventListener("input", function () {
      data = updateBriefData(function (draft) { draft.email = email.value; });
    });
    if (checkboxes[0]) checkboxes[0].addEventListener("change", function () {
      data = updateBriefData(function (draft) { draft.sendBrief = checkboxes[0].checked; });
    });
    if (checkboxes[1]) checkboxes[1].addEventListener("change", function () {
      data = updateBriefData(function (draft) { draft.wantSample = checkboxes[1].checked; });
    });

    if (createBtn) {
      createBtn.addEventListener("click", function () {
        data = updateBriefData(function (draft) {
          if (notes) draft.finalNotes = notes.value;
          if (email) draft.email = email.value;
          draft.sendBrief = !!(checkboxes[0] && checkboxes[0].checked);
          draft.wantSample = !!(checkboxes[1] && checkboxes[1].checked);
        });
        renderPreview(data);
      });
    }

    renderPreview(data);
  }

  function init() {
    const page = pageName();
    if (page === "start.html") setupStep1();
    if (page === "step-2.html") setupStep2();
    if (page === "step-3.html") setupStep3();
    if (page === "step-4.html") setupStep4();
    if (page === "step-5.html") setupStep5();
  }

  init();
})();
