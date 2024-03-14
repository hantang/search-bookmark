function collectBookmarks(bookmarkNodes, path = "") {
  let bookmarks = [];
  function traverse(node, currentPath) {
    if (node.url) {
      bookmarks.push({ url: node.url, title: node.title, path: currentPath });
    } else if (node.children) {
      const newPath = currentPath + node.title + "/";
      node.children.forEach(child => traverse(child, newPath));
    }
  }
  bookmarkNodes.forEach(node => traverse(node, path));
  return bookmarks;
}

function getBookmarkDetails(bookmark) {
  return new Promise((resolve, reject) => {
    chrome.history.getVisits({ url: bookmark.url }, function (visitItems) {
      let visitCount = visitItems.length;
      let lastVisitTime = visitCount > 0 ? new Date(visitItems[0].visitTime).toISOString() : null;
      resolve({
        ...bookmark,
        visited: visitCount > 0,
        lastVisitTime,
        visitCount
      });
    });
  });
}

async function displayBookmarks() {
  try {
    console.log("displayBookmarksAsTable2")
    const bookmarkTree = await chrome.bookmarks.getTree();
    const bookmarks = collectBookmarks(bookmarkTree);
    const bookmarkDetailsPromises = bookmarks.map(bookmark => getBookmarkDetails(bookmark));
    const bookmarkResults = await Promise.all(bookmarkDetailsPromises);

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    const trHead = document.createElement('tr');
    const parts = ["Index", "Folder", "Bookmark", "Website", "FullFolder", "HasPath", "Duplicated", "LastVisitTime", "VisitCount"];
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

    bookmarkResults.forEach((bookmark, index) => {
      const title = bookmark.title.trim();
      const href = bookmark.url;
      const fullFolder = bookmark.path.endsWith("/") ? bookmark.path.slice(0,-1) : bookmark.path;
      const folders = fullFolder.split("/")
      const folder = folders ? folders[folders.length - 1] : '';
      // const visited = bookmark.visited;
      const lastVisitTime = bookmark.lastVisitTime;
      const visitCount = bookmark.visitCount;
      const url = new URL(href);
      const hostname = url.hostname;
      const hasPath = url.pathname && url.pathname !== '/';
      const dup = frequencyCounter[href] > 1

      const texts = new Array(index, folder, "", hostname, fullFolder, hasPath, dup, lastVisitTime, visitCount);
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

    renderPages();
  } catch (error) {
    console.error('Error processing bookmarks:', error);
  }
}

function loadTree() {
  clearContent();
  displayBookmarks();
}

document.getElementById('extensionButton').addEventListener('click', loadTree);
