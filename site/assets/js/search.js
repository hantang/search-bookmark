
function filterTable() {
    const table = document.getElementById("dataTable");
    const tr = table.getElementsByTagName("tr");
    const filterConditions = document.querySelectorAll(".filter-condition");
    const conditions = Array.from(filterConditions).filter(cond => cond.querySelector(".regex-input") && cond.querySelector(".regex-input").value.trim() !== '');

    const logic = document.getElementById("logicSelect").value;
    let cnt = 0;
    if (conditions.length === 0) {
        cnt = tr.length - 1
    } else {
        // Loop through all rows of the table
        for (let i = 1; i < tr.length; i++) {
            let displayRow = false;
            let matchCount = 0;

            conditions.forEach((cond) => {
                const column = cond.querySelector(".column-select").value;
                const query = cond.querySelector(".regex-input").value.trim();
                const regex = new RegExp(query, "i");
                const td = tr[i].getElementsByTagName("td")[column];
                const notLogic = cond.querySelector(".logic-select").value;

                // Check if the condition matches the row
                if (td && (
                    (notLogic!=="NOT" && regex.test(td.textContent)) ||
                    (notLogic==="NOT" && !regex.test(td.textContent)) 
                )) {
                    matchCount++;

                    // Highlight matching text
                    const highlightedText = td.textContent.replace(
                        regex,
                        (match) => `<span style="background-color: yellow;">${match}</span>`
                    );
                    const alist = td.querySelectorAll('a');
                    if (alist.length == 0) {
                        td.innerHTML = highlightedText;
                    } else {
                        alist[0].innerHTML = highlightedText
                    }
                    
                }
            });

            // Determine if the row should be displayed
            if (logic === "AND" && matchCount === conditions.length) {
                displayRow = true;
            } else if (logic === "OR" && matchCount > 0) {
                displayRow = true;
            }

            // Update row display
            tr[i].style.display = displayRow ? "" : "none";
            if (displayRow) {
                cnt += 1;
            }
        }
    }
    document.getElementById("dataCount").innerHTML = "Total count = " + cnt;
}

function resetFilters() {
    // Clear all input fields in the filter conditions
    document.querySelectorAll(".regex-input").forEach((input) => {
        input.value = "";
    });

    const table  = document.getElementById("dataTable")
    if (table == null) {
        return
    }

    // Reset table visibility
    const tr = table.getElementsByTagName("tr");
    for (let i = 1; i < tr.length; i++) {
        tr[i].style.display = ""; // Show all rows
    }

    // Remove highlighting
    const tds = table.getElementsByTagName("td");
    for (let i = 0; i < tds.length; i++) {
        tds[i].innerHTML = tds[i].innerText; // Reset innerHTML to remove spans
    }
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
    const container = document.getElementById("filterConditions");

    const newCondition = document.createElement("div");
    newCondition.className = "filter-condition";
    p = document.createElement("span");
    p.innerText = "Filter Logic: "
    newCondition.appendChild(p)
    const logicSelect = createLogicSelect();
    newCondition.appendChild(logicSelect);
    container.appendChild(newCondition);
    addOption(0, container);
}

function toggleMoreFilters() {
    const container = document.getElementById("filterConditions");
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
    const cnt = document.getElementById("dataTable").rows.length;
    document.getElementById("dataCount").innerHTML = "Total count = " + cnt;
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
