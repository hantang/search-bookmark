document.getElementById('extensionButton').addEventListener('click', function () {
  chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
    const allBookmarks = getBookmarks(bookmarkTreeNodes);
    clearContent();
    displayBookmarksAsTable(allBookmarks);
    renderPages();
  });
});

function loadTree() {
  chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
    // console.log(bookmarkTreeNodes[0]);
    const allBookmarks = getBookmarks(bookmarkTreeNodes);
    clearContent();
    displayBookmarksAsTable(allBookmarks);
    renderPages();
  });
}

function getBookmarks(bookmarkNodes, currentPath = '') {
  let bookmarks = [];
  for (const node of bookmarkNodes) {
    if (node.children) {
      bookmarks = bookmarks.concat(getBookmarks(node.children, currentPath || node.title ? currentPath + '/' + node.title : node.title));
    } else {
      bookmarks.push({ title: node.title, url: node.url, path: currentPath });
    }
  }
  return bookmarks;
}

function displayBookmarksAsTable(bookmarks) {
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

  const frequencyCounter = {};
  for (const bookmark of bookmarks) {
    const element = bookmark.url;
    frequencyCounter[element] = (frequencyCounter[element] || 0) + 1;
  }

  bookmarks.forEach((bookmark, index) => {
    const title = bookmark.title.trim();
    const href = bookmark.url;
    const fullFolder = bookmark.path;
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
  displayTable(table);
}

// document.getElementById('extensionButton').addEventListener('click', loadTree);
