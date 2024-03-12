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
  const tableDiv = document.getElementById('dataTable');
  tableDiv.innerHTML = table.innerHTML;
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
  const parts = new Array("Folder", "Bookmark", "Website", "FullFolder", "HasURLPath");
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
    const href = bookmarkElement.href;
    const fullFolder = findFolder(bookmarkElement);
    const folders = fullFolder.split("/")
    const folder = folders ? folders[folders.length - 1] : '';

    const url = new URL(href);
    const hostname = url.hostname;
    const hasPath = url.pathname && url.pathname !== '/';

    const texts = new Array(folder, "", hostname, fullFolder, hasPath);
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
  displayTable(table)
}

function clearContent() {
  document.getElementById('dataTable').innerHTML = '';
  document.getElementById('dataCount').innerHTML = '';
  document.getElementById("search-options").innerHTML = "";
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
