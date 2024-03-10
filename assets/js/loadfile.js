function dragOverHandler(event) {
  event.preventDefault();
}

function dropHandler(event) {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  processFile(file);
}

function processFile(file) {
  clearContent();
  if (file && file.type === 'text/html') {
    const reader = new FileReader();
    reader.onload = function (event) {
      const fileContent = event.target.result;
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = fileContent;
      const table = tempDiv.querySelector('table');
      if (table) {
        displayTable(table);
        renderPages()
      } else if (tempDiv.querySelectorAll('dl dt').length > 0) {
        displayBookmarks(fileContent);
        renderPages()
      } else {
        alert('No table or bookmarks found in the HTML file.');
      }

    };
    reader.readAsText(file);
  } else {
    alert('Please drop an HTML file.');
  }
}

function displayTable(table) {
  const tableDiv = document.getElementById('fileContent');
  tableDiv.innerHTML = '';
  table.id = "dataTable";
  tableDiv.appendChild(table.cloneNode(true));
}

function findFolder(bookmarkElement) {
  let folder = '';
  let currentNode = bookmarkElement.parentElement;
  while (currentNode) {
    if (currentNode.tagName === 'DL') {
      folder = currentNode.previousElementSibling.textContent.trim();
      return folder;
    } else if (currentNode.tagName === 'H3') {
      folder = currentNode.textContent.trim();
      return folder;
    }
    currentNode = currentNode.parentElement;
  }
  return folder;
}

function displayBookmarks(fileContent) {
  const tableDiv = document.getElementById('fileContent');
  tableDiv.innerHTML = '';

  const table = document.createElement('table');
  table.id = "dataTable"

  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const trHead = document.createElement('tr');
  const parts = new Array("Folder", "Bookmark", "Website");
  for (let i = 0; i < parts.length; i++) {
    const th = document.createElement('th');
    th.textContent = parts[i];
    trHead.appendChild(th);
  }

  thead.appendChild(trHead);
  table.appendChild(thead);

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = fileContent;

  const bookmarkElements = tempDiv.querySelectorAll('a');
  bookmarkElements.forEach(bookmarkElement => {
    const title = bookmarkElement.textContent.trim();
    const url = bookmarkElement.href;
    const folder = findFolder(bookmarkElement);
    const hostname = new URL(url).hostname;

    const texts = new Array(folder, "", hostname);
    const tr = document.createElement('tr');
    for (let i = 0; i < parts.length; i++) {
      const td = document.createElement('td');
      if (i == 1) {
        const link = document.createElement('a');
        link.href = url;
        link.textContent = title;
        td.appendChild(link);
      } else {
        td.textContent = texts[i];
      }
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  tableDiv.appendChild(table.cloneNode(true));
}

function clearContent() {
  document.getElementById('fileContent').innerHTML = '';
  document.getElementById("filterConditions").innerHTML = "";
}

window.onload = function () {
  document.getElementById('fileInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    processFile(file);
  });

}