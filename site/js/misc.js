
function adjustTableWidth(width) {
  const table = document.getElementById("dataTable");
  table.style.width = width + "%";

  const label = document.getElementById("tableWidthLabel");
  label.textContent = width + "%";
}

function sortTable(column) {
  const table = document.getElementById("dataTable");
  const rows = Array.from(table.getElementsByTagName("tr")).slice(1);
  let sortOrder = 1;

  const sortedColumn = table.getAttribute("data-sorted-column");
  if (sortedColumn === String(column)) {
    // Toggle sorting order
    sortOrder = -parseInt(table.getAttribute("data-sort-order")) || 1;
  } else {
    // Reset sorting indicators
    const headers = table.getElementsByTagName("th");
    for (let i = 0; i < headers.length; i++) {
      headers[i].classList.remove("asc", "desc");
    }
  }

  // Sort the rows based on the content of the specified column
  rows.sort((a, b) => {
    const textA = a.getElementsByTagName("td")[column].textContent.toLowerCase();
    const textB = b.getElementsByTagName("td")[column].textContent.toLowerCase();
    return textA.localeCompare(textB) * sortOrder;
  });

  // Reorder the rows in the table
  for (let i = 0; i < rows.length; i++) {
    table.appendChild(rows[i]);
  }

  // Update sorting indicator
  const header = table.getElementsByTagName("th")[column];
  header.classList.toggle("asc", sortOrder === 1);
  header.classList.toggle("desc", sortOrder === -1);

  // Store sorted column and order
  table.setAttribute("data-sorted-column", column);
  table.setAttribute("data-sort-order", sortOrder);
}

function clearContent() {
  document.getElementById('dataTable').innerHTML = '';
  document.getElementById('dataCount').innerHTML = '';
  document.getElementById("search-options").innerHTML = "";
}

function displayTable(table) {
  const tableDiv = document.getElementById('dataTable');
  tableDiv.innerHTML = table.innerHTML;
}

// check chrome extension api env
const isExtensionEnvironment = typeof chrome !== 'undefined' && chrome.extension;
if (isExtensionEnvironment) {
  document.getElementById('extensionButton').style.display = '';
  document.getElementById('openFileButton').style.display = 'none';
  // document.getElementById('fileInput').style.display = '';
  document.getElementById('drop-area').style.display = 'none';
} else {
  document.getElementById('extensionButton').style.display = 'none';
  document.getElementById('openFileButton').style.display = '';
  // document.getElementById('fileInput').style.display = '';
  document.getElementById('drop-area').style.display = '';
}
