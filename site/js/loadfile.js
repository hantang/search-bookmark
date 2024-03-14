function processFile(file) {
  if (file && file.type === 'text/html') {
    const reader = new FileReader();
    reader.onload = function (event) {
      const fileContent = event.target.result;
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = fileContent;

      var table = tempDiv.querySelector('table');
      if (!table && tempDiv.querySelectorAll('dl dt').length > 0) {
        table = displayBookmarks(fileContent);
      }
      if (table) {
        clearContent();
        displayTable(table);
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

function findFolder(bookmarkElement) {
  let fullFolder = '';
  let currentNode = bookmarkElement.parentElement;
  while (currentNode) {
    tagName = currentNode.tagName.toLowerCase()
    let folder = ''
    if (tagName === 'dl') {
      folder = currentNode.previousElementSibling.textContent.trim(); // h3
    } else if (currentNode.tagName === 'h3') {
      folder = currentNode.textContent.trim();
    }
    if (folder) {
      fullFolder = fullFolder ? `${folder}/${fullFolder}` : folder;
    }
    currentNode = currentNode.parentElement;
  }
  return fullFolder;
}

function displayBookmarks(fileContent) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const trHead = document.createElement('tr');
  const parts = new Array("Index", "Folder", "Bookmark", "Website", "FullFolder", "HasPath", "Duplicated");
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

  const frequencyCounter = {};
  for (const bookmarkElement of bookmarkElements) {
    const element = bookmarkElement.href;
    frequencyCounter[element] = (frequencyCounter[element] || 0) + 1;
  }

  bookmarkElements.forEach((bookmarkElement, index) => {
    const title = bookmarkElement.textContent.trim();
    const href = bookmarkElement.href;
    const fullFolder = findFolder(bookmarkElement);
    const folders = fullFolder.split("/")
    const folder = folders ? folders[folders.length - 1] : '';

    const url = new URL(href);
    const hostname = url.hostname;
    const hasPath = url.pathname && url.pathname !== '/';
    const dup = frequencyCounter[href] > 1

    const texts = new Array(index, folder, "", hostname, fullFolder, hasPath, dup);
    const tr = document.createElement('tr');
    for (let i = 0; i < parts.length; i++) {
      const td = document.createElement('td');
      if (i == 2) {
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
  return table
}


function dragOverHandler(event) {
  event.preventDefault();
}

function dropHandler(event) {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  processFile(file);
}

function openFile() {
  const fileInput = document.getElementById('fileInput');
  fileInput.click();
}

fileInput.addEventListener('change', function (event) {
  const selectedFile = event.target.files[0];
  if (selectedFile) {
    const file = event.target.files[0];
    processFile(file);
    event.target.value = ''; // allow open same file again
  }
});

document.getElementById('openFileButton').addEventListener('click', openFile);
document.getElementById('clearButton').addEventListener('click', clearContent);
document.getElementById('expandButton').addEventListener('click', toggleMoreFilters);
document.getElementById('searchButton').addEventListener('click', filterTable);
document.getElementById('resetButton').addEventListener('click', resetFilters);
