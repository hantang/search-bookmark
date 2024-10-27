const openFileStr = "file-input";
const clearButtonStr = "clear-button";
const expandButtonStr = "expand-button";
const searchButtonStr = "search-button";
const resetButtonStr = "reset-button";
const extensionButtonStr = "extension-button";
const openFileButtonStr = "open-file-button";

const dropAreaStr = "drop-area";
const searchOptionStr = "search-options";
const searchAreaStr = "search-area";
const searchLogicOptions = ["AND", "OR"];
const searchFilterOptions = ["KEEP", "EXCLUDE"];
const searchConditionOption = ["Highlight", "Match Case", "RegExp"];

const bookmarkAreaStr = "bookmark-area";
const bookmarkTableStr = "bookmark-table";
const bookmarkCountStr = "bookmark-count";
const searchClassName = "search-condition";

function openBookmarkFile() {
  const fileInput = document.getElementById(openFileStr);
  fileInput.click();
}

// global
function clearContent() {
  document.getElementById(bookmarkTableStr).innerHTML = "";
  document.getElementById(bookmarkCountStr).innerHTML = "";
  document.getElementById(searchOptionStr).innerHTML = "";
  document.getElementById(bookmarkAreaStr).style.display = "none";
  document.getElementById(searchAreaStr).style.display = "none";
}

function renderPages(new_table, clear = true) {
  if (clear) {
    clearContent();
  }

  if (new_table === null) {
    return;
  }
  document.getElementById(bookmarkAreaStr).style.display = "";
  document.getElementById(searchAreaStr).style.display = "";

  // displayTable(new_table);
  const table = document.getElementById(bookmarkTableStr);
  table.innerHTML = new_table.innerHTML;

  const headers = table.getElementsByTagName("th");

  updateTableCount(table);
  const columns = [...headers].map((header) => header.innerText);
  const conditions = initSearchConditions(columns);
  const searchOptions = document.getElementById(searchOptionStr);
  searchOptions.appendChild(conditions);
  for (let i = 0; i < headers.length; i++) {
    headers[i].addEventListener("click", function () {
      sortTable(i, table);
    });
  }
}

// other part
function updateTableCount(table = null, cnt = null) {
  let rowCount = 0;
  if (cnt && cnt > 0) {
    rowCount = cnt;
  } else {
    if (table == null) table = document.getElementById(bookmarkTableStr);
    if (table) {
      rowCount = table.rows.length;
      if (table.rows[0].cells[0].tagName === "TH") rowCount -= 1;
    }
  }

  document.getElementById(bookmarkCountStr).innerHTML = Math.max(rowCount, 0);
}

function initSearchConditions(columns) {
  // two parts
  const className = searchClassName;
  const searchInputClassName = "search-condition-input";
  const searchRadioClassName = "search-condition-radio";
  const searchCheckClassName = "search-condition-check";

  const searchConditions = document.createElement("div");

  const fieldset1 = document.createElement("fieldset");
  const part0 = document.createElement("div");
  part0.className = className;
  const checkboxes = createRadioOrCheckbox(
    searchConditionOption,
    searchCheckClassName,
    false,
    "name-checkbox-input-condition"
  );
  part0.appendChild(checkboxes);
  fieldset1.appendChild(part0);

  const part1 = document.createElement("div");
  part1.className = className;
  const logicRadio = createRadioOrCheckbox(
    searchLogicOptions,
    searchRadioClassName,
    true,
    "name-radio-input-logic"
  );
  part1.append(logicRadio);
  fieldset1.appendChild(part1);
  searchConditions.appendChild(fieldset1);

  const fieldset2 = document.createElement("fieldset");
  columns.forEach((label, index) => {
    const container = document.createElement("div");
    container.className = className;
    const radioElement = createRadioOrCheckbox(
      searchFilterOptions,
      searchRadioClassName,
      true,
      `name-radio-input-filter-${index}`
    );
    const inputElement = createTextInput(label, searchInputClassName, `name-text-input-${index}`);

    container.appendChild(inputElement);
    container.appendChild(radioElement);
    if (index > 0) {
      container.style.display = "none";
    }
    fieldset2.append(container);
  });
  searchConditions.appendChild(fieldset2);
  return searchConditions;
}

function toggleMoreSearchConditions() {
  const className = searchClassName;
  const searchOptions = document.querySelectorAll(`.${className}`);
  const expandButton = document.getElementById(expandButtonStr);
  if (searchOptions.length > 3) {
    if (searchOptions[3].style.display != "") {
      for (let i = 3; i < searchOptions.length; i++) {
        searchOptions[i].style.display = ""; // display
        // TODO reset input
      }
      expandButton.innerText = "Collapse";
    } else {
      for (let i = 3; i < searchOptions.length; i++) {
        searchOptions[i].style.display = "none"; // hidden
      }
      expandButton.innerText = "Expand";
    }
  }
}

function filterTableData() {
  // get checkboxes, radio buttons, text inputs
  const className = searchClassName;
  const searchArea = document.getElementById(searchAreaStr);
  const checkboxes = document.querySelectorAll(`fieldset:nth-child(1) input[type="checkbox"]`);
  const radios = document.querySelectorAll(`fieldset:nth-child(1) input[type="radio"]`);
  const conditionsRaw = searchArea.querySelectorAll(`fieldset:nth-child(2) .${className}`);
  const conditions = Array.from(conditionsRaw).filter(
    (cond) =>
      cond.querySelector(".search-condition-input") &&
      cond.querySelector(".search-condition-input").value !== ""
  );

  const isHighlight = checkboxes[0].checked;
  const isMatchCase = checkboxes[1].checked;
  const isRegexp = checkboxes[2].checked;
  const isLogicAnd = radios[0].checked;

  const table = document.getElementById(bookmarkTableStr);
  const rows = table.rows; // .getElementsByTagName("tr");
  let start = 0;
  if (rows.length > 0 && rows[0].cells[0].tagName === "TH") {
    start = 1;
  }
  if (conditions.length == 0) {
    updateTableCount(null, rows.length - start);
    return;
  }

  resetTableData();
  let cnt = 0;

  for (let i = start; i < rows.length; i++) {
    let displayRow = false;
    let matchCount = 0;

    conditions.forEach((cond) => {
      // # TODO
      const input = cond.querySelector(".search-condition-input");
      const nameParts = input.name.split("-");
      const columnIndex = parseInt(nameParts[nameParts.length - 1]);
      const queryRaw = input.value;
      const isLogicExclude = cond.querySelectorAll(".search-condition-radio")[1].checked; // keep/exclude
      const td = rows[i].getElementsByTagName("td")[columnIndex];

      const query = isRegexp ? queryRaw : queryRaw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(query, isMatchCase ? "g" : "gi"); // i: ignore case

      // Check if the condition matches the row
      if (
        td &&
        ((!isLogicExclude && regex.test(td.textContent)) ||
          (isLogicExclude && !regex.test(td.textContent)))
      ) {
        matchCount++;
        if (isHighlight) {
          const highlightedText = td.textContent.replace(
            regex,
            (match) => `<span style="background-color: yellow;">${match}</span>`
          );
          if (td.childElementCount == 0) {
            td.innerHTML = highlightedText;
          } else {
            td.childNodes[0].innerHTML = highlightedText;
          }
        }
      }
    });

    // Determine if the row should be displayed
    if ((isLogicAnd && matchCount === conditions.length) || (!isLogicAnd && matchCount > 0)) {
      displayRow = true;
    }

    // Update row display
    rows[i].style.display = displayRow ? "" : "none";
    if (displayRow) {
      cnt += 1;
    }
  }
  updateTableCount(null, cnt);
}

function resetTableData() {
  const table = document.getElementById(bookmarkTableStr);
  if (table === null) {
    return;
  }
  // show table rows
  const trs = table.querySelectorAll('tr[style*="display: none"]');
  trs.forEach((tr) => {
    tr.style.display = "";
  });
  // clean highlight
  if (checkConditionOption(0)) {
    const tds = table.querySelectorAll("td span");
    tds.forEach((span) => {
      if (span.parentNode) {
        span.parentNode.innerHTML = span.parentNode.innerText;
      }
    });
  }
  updateTableCount(table);
}

function resetSearchConditions() {
  const className = searchClassName;
  const checkboxes = document.querySelectorAll(`.${className} input[type="checkbox"]`);
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });

  // only first in each groups is checked
  const firstRadioButtons = document.querySelectorAll(
    `.${className} input[type="radio"]:first-child`
  );
  firstRadioButtons.forEach((radioButton) => {
    radioButton.checked = true;
  });

  const firstInputFields = document.querySelectorAll(`.${className} input[type="text"]`);
  firstInputFields.forEach((input) => {
    input.value = "";
  });
}

function resetSearchAndTable() {
  resetTableData();
  resetSearchConditions();
}

function checkConditionOption(index = 0) {
  return document.querySelectorAll(`fieldset:nth-child(1) input[type="checkbox"]`)[index].checked;
}

document.addEventListener("DOMContentLoaded", () => {

  const yearElement = document.getElementById("currentYear");
  const startYear = 2024;
  const currentYear = new Date().getFullYear();
  yearElement.textContent = currentYear === startYear ? currentYear : `${startYear} - ${currentYear}`;

  // add events
  // check chrome extension api env
  const isExtensionEnvironment = typeof chrome !== "undefined" && chrome.extension;
  if (isExtensionEnvironment) {
    const extensionButton = document.getElementById(extensionButtonStr);
    extensionButton.style.display = "";
    extensionButton.addEventListener("click", loadBookmarkTree);
  } else {
    const openFileButton = document.getElementById(openFileButtonStr);
    const fileInput = document.getElementById(openFileStr);
    const dropArea = document.getElementById(dropAreaStr);
    openFileButton.style.display = "";
    dropArea.style.display = "";

    openFileButton.addEventListener("click", openBookmarkFile);
    fileInput.addEventListener("change", openSameFileAgain);
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      dropArea.addEventListener(eventName, preventDefaults, false);
    });
    dropArea.addEventListener("drop", dropHandler, false);
  }

  document.getElementById(clearButtonStr).addEventListener("click", clearContent);
  document.getElementById(expandButtonStr).addEventListener("click", toggleMoreSearchConditions);
  document.getElementById(searchButtonStr).addEventListener("click", filterTableData);
  document.getElementById(resetButtonStr).addEventListener("click", resetSearchAndTable);
});
