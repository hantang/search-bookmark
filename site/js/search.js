function getCheckboxHighlight() {
    const searchOptions = document.querySelectorAll(".filter-condition");
    if (searchOptions.length == 0) {
        return false;
    }
    const selectedCheckboxes = [];
    searchOptions[0].querySelectorAll('.filter-checkbox').forEach(checkbox => {
        if (checkbox.checked) {
            selectedCheckboxes.push(checkbox.value.toLowerCase());
        }
    });
    const options = ['Highlight', 'Match Case', 'Regexp'];
    return selectedCheckboxes.indexOf(options[0].toLowerCase()) >= 0
}

function filterTable() {
    const table = document.getElementById("dataTable");
    const tr = table.getElementsByTagName("tr");
    const searchOptions = document.querySelectorAll(".filter-condition");
    const conditions = Array.from(searchOptions).filter(cond => cond.querySelector(".regex-input") && cond.querySelector(".regex-input").value.trim() !== '');

    const selectedCheckboxes = [];
    let selectedRadioButton = 'AND';
    if (searchOptions.length > 0) {
        const firstOption = searchOptions[0]
        firstOption.querySelectorAll('.filter-checkbox').forEach(checkbox => {
            if (checkbox.checked) {
                selectedCheckboxes.push(checkbox.value.toLowerCase());
            }
        });
        selectedRadioButton = firstOption.querySelector('input[name="filterType"]:checked').value;
    }

    const options = ['Highlight', 'Match Case', 'Regexp'];
    const logicOptions = ['AND', 'OR']
    const highlight = selectedCheckboxes.indexOf(options[0].toLowerCase()) >= 0
    const matchCase = selectedCheckboxes.indexOf(options[1].toLowerCase()) >= 0
    const useRegexp = selectedCheckboxes.indexOf(options[2].toLowerCase()) >= 0
    const isAnd = selectedRadioButton.toLowerCase() == logicOptions[0].toLowerCase();
    
    let cnt = tr.length - 1;
    resetFilters(all=false);
    if (conditions.length > 0) {
        cnt = 0;
        // Loop through all rows of the table
        for (let i = 1; i < tr.length; i++) {
            let displayRow = false;
            let matchCount = 0;

            conditions.forEach((cond) => {
                const column = cond.querySelector(".column-select").value;
                const queryRaw = cond.querySelector(".regex-input").value.trim();
                const notLogic = cond.querySelector(".logic-select").value == 'NOT';
                const td = tr[i].getElementsByTagName("td")[column];

                const query = useRegexp ? queryRaw:queryRaw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');;
                const regex = new RegExp(query, matchCase? "g" :"gi");

                // Check if the condition matches the row
                if (td && (
                    (!notLogic && regex.test(td.textContent)) ||
                    (notLogic && !regex.test(td.textContent)) 
                )) {
                    matchCount++;
                    if (highlight) {
                        const highlightedText = td.textContent.replace(
                            regex,
                            (match) => `<span style="background-color: yellow;">${match}</span>`
                        );
                        if (td.childElementCount == 0) {
                            td.innerHTML = highlightedText;
                        } else {
                            td.childNodes[0].innerHTML = highlightedText
                        }
                    }
                }
            });

            // Determine if the row should be displayed
            if ((isAnd && matchCount === conditions.length) ||
                (!isAnd && matchCount > 0)) {
                displayRow = true;
            } 

            // Update row display
            tr[i].style.display = displayRow ? "" : "none";
            if (displayRow) {
                cnt += 1;
            }
        }
    }
    document.getElementById("dataCount").innerHTML = Math.max(cnt, 0);
}

function resetFilters(all=true) {
    // Clear all input fields in the filter conditions
    if (all) {
        document.querySelectorAll(".regex-input").forEach((input) => {
            input.value = "";
        });
    }

    const table  = document.getElementById("dataTable")
    if (table == null) {
        return
    }

    const trs = table.querySelectorAll('tr[style*="display: none"]');
    trs.forEach(tr => {
        tr.style.display = '';
    });

    if(getCheckboxHighlight()) {
        const tds = table.querySelectorAll('td span');
        tds.forEach(span => {
            if(span.parentNode)
            span.parentNode.innerHTML = span.parentNode.innerText
        })
    }

    const cnt = document.getElementsByTagName("tr").length - 1;
    document.getElementById("dataCount").innerHTML = Math.max(cnt, 0);
}

function addOption(i, container) {
    const conditions = container.querySelectorAll(".filter-condition");
    const rows = document.getElementById("dataTable").rows
    if (rows.length == 0) {
        return;
    }
    const headersCount = rows[0].cells.length;
    if (conditions.length > headersCount || i >= headersCount) {
        return;
    }
    const newCondition = document.createElement("div");
    newCondition.className = "filter-condition";
    const columnSelect = createColumnSelect(i);

    newCondition.appendChild(columnSelect);
    newCondition.innerHTML += `<input type="text" class="regex-input" placeholder="Enter regex...">`;

    const logicSelect = createLogicNotSelect();
    newCondition.appendChild(logicSelect);
    container.appendChild(newCondition);

    // bind to search realtime
    // const regexInput = newCondition.querySelector(".regex-input");
    // regexInput.addEventListener("input", filterTable);
}

function toggleFirstFilters() {
    const container = document.getElementById("search-options");
    const newCondition = document.createElement("div");
    newCondition.className = "filter-condition";
    p = document.createElement("span");
    p.innerText = "Filter Logic: "
    newCondition.appendChild(p)

    const tmpOptionDiv = document.createElement("div");
    const options = ['Highlight', 'Match Case', 'Regexp'];
    options.forEach(option => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = option.toLowerCase();
        checkbox.classList.add('filter-checkbox');
        const label = document.createElement('label');
        label.textContent = option;
        label.htmlFor = option;

        tmpOptionDiv.appendChild(checkbox);
        tmpOptionDiv.appendChild(label);
    });
    newCondition.appendChild(tmpOptionDiv)

    const logicOptions = ['AND', 'OR']
    const tmpRadioDiv = document.createElement("div");
    logicOptions.forEach(option => {
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'filterType';
      radio.value = option.toLowerCase();
      radio.id = `${option.toLowerCase()}Radio`;
      radio.checked = option === 'AND';
      const label = document.createElement('label');
      label.textContent = option;
      label.htmlFor = `${option.toLowerCase()}Radio`;
      tmpRadioDiv.appendChild(radio);
      tmpRadioDiv.appendChild(label);
    });
    newCondition.appendChild(tmpRadioDiv)
    // const logicSelect = createLogicSelect();
    // newCondition.appendChild(logicSelect);
    container.appendChild(newCondition);

    addOption(0, container);
}

function toggleMoreFilters() {
    const container = document.getElementById("search-options");
    const rows = document.getElementById("dataTable").rows
    if (rows.length == 0) {
        return;
    }
    for (let i = 1; i < rows[0].cells.length; i++) {
        addOption(i, container);
    }
}

function createColumnSelect(j = 0) {
    const select = document.createElement("select");
    select.className = "column-select";
    const headers = document.getElementById("dataTable").rows[0].cells;
    for (let i = 0; i < headers.length; i++) {
        const option = document.createElement("option");
        if (i === j) {
            option.selected = true;
            option.disabled = false;
        } else {
            option.disabled = true;
        }
        option.value = i;
        option.textContent = headers[i].textContent;
        select.appendChild(option);
    }
    return select;
}

function createLogicSelect() {
    const select = document.createElement("select");
    select.className = "logic-select";
    select.id = "logicSelect"
    const options = ["AND", "OR"]; // todo
    options.forEach((opt) => {
        const option = document.createElement("option");
        option.value = opt;
        option.textContent = opt;
        select.appendChild(option);
    });
    return select;
}

function createLogicNotSelect() {
    const select = document.createElement("select");
    select.className = "logic-select";
    const options = ["DEFAULT", "NOT"];
    options.forEach((opt) => {
        const option = document.createElement("option");
        option.value = opt;
        option.textContent = opt;
        select.appendChild(option);
    });
    return select;
}

function renderPages() {
    const cnt = document.getElementById("dataTable").rows.length - 1;
    document.getElementById("dataCount").innerHTML = Math.max(cnt);
    toggleFirstFilters();

    const headers = document
        .getElementById("dataTable")
        .getElementsByTagName("th");
    for (let i = 0; i < headers.length; i++) {
        headers[i].addEventListener("click", function () {
            sortTable(i);
        });
    }
};
