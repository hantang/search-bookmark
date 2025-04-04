// load and parse bookmark file
// utils
function isValidDate(dateString) {
  // check column is a date column
  // 2024-02-01, 2024-02-01 12:12:12, 2024-02-01T13:32:39.026Z
  const pattern = /\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}:\d{2}(\.\d*)?Z?)?/;
  return dateString === "" || pattern.test(dateString);
}

function collectBookmarks(bookmarkNodes) {
  let bookmarks = [];
  function traverse(node, currentPath) {
    if (node.url) {
      bookmarks.push({ url: node.url, title: node.title, path: currentPath });
    } else if (node.children) {
      const newPath = currentPath + node.title + "/";
      node.children.forEach((child) => traverse(child, newPath));
    }
  }
  bookmarkNodes.forEach((node) => traverse(node, ""));
  return bookmarks;
}

function getBookmarkDetails(bookmark) {
  // chrome extension
  return new Promise((resolve, reject) => {
    chrome.history.getVisits({ url: bookmark.url }, function (visitItems) {
      let visitCount = visitItems.length;
      let lastVisitTime = visitCount > 0 ? new Date(visitItems[0].visitTime).toISOString() : null;
      resolve({
        ...bookmark,
        visited: visitCount > 0,
        lastVisitTime,
        visitCount,
      });
    });
  });
}

function getFavicon(url) {
  const isFirefox = navigator.userAgent.includes("Firefox");
  if (isFirefox) {
    return `http://www.google.com/s2/favicons?domain_url=${url}`;
  }
  return `${chrome.runtime.getURL("/_favicon?")}pageUrl=${encodeURIComponent(url)}&size=32`;
}

// async function getFavicon2(url) {
//   // TODO
//   const defaultIcon = "assets/default-icon.svg";
//   console.log(url);
//   if (url.includes("chromewebstore.google.com")) {
//     return defaultIcon;
//   }
//   try {
//     // const response = await fetch(url);
//     const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;
//     const response = await fetch(proxyUrl, { method: "HEAD" });
//     // Check if the response is okay
//     if (!response.ok) {
//       return defaultIcon;
//     }
//     const text = await response.text();
//     const parser = new DOMParser();
//     const doc = parser.parseFromString(text, "text/html");
//     const iconLink = doc.querySelector("link[rel*='icon']");
//
//     return iconLink ? iconLink.href : defaultIcon;
//   } catch (error) {
//     console.error("Failed favicon:", error);
//     return defaultIcon;
//   }
// }
//
// async function getFaviconForHostnames(bookmarks) {
//   const faviconMap = {};
//   const hostnameDict = {};
//   bookmarks.forEach((bookmark) => {
//     hostname = new URL(bookmark.url).hostname;
//     if (!hostnameDict[hostname]) {
//       hostnameDict[hostname] = bookmark.url; // first URL
//     }
//   });
//
//   // request favicon
//   for (const hostname in hostnameDict) {
//     const url = hostnameDict[hostname];
//     faviconMap[hostname] = await getFavicon2(url);
//   }
//
//   return faviconMap;
// }

function createBookmarkTable(bookmarks, hasVisited, isExtension, faviconMap) {
  console.log("hasVisited", hasVisited, "isExtension", isExtension);
  const frequencyCounter = {};
  for (const bookmark of bookmarks) {
    const element = bookmark.url;
    frequencyCounter[element] = (frequencyCounter[element] || 0) + 1;
  }

  const headers = ["Bookmark", "Website", "Folder", "FullFolder", "HasPath", "Duplicated"];
  if (hasVisited) {
    headers.push(...["LastVisitTime", "VisitCount"]);
  }

  const table = document.createElement("table");
  const thead = table.createTHead();
  const tbody = table.createTBody();
  const row = thead.insertRow();

  headers.forEach((headerText) => {
    let header = document.createElement("th");
    header.textContent = headerText;
    row.appendChild(header);
  });

  bookmarks.forEach((bookmark) => {
    const title = bookmark.title.trim();
    const href = bookmark.url;
    const fullFolder = bookmark.path.endsWith("/") ? bookmark.path.slice(0, -1) : bookmark.path;
    const folders = fullFolder.split("/");
    const folder = folders ? folders[folders.length - 1] : "";

    const url = new URL(href);
    const hostname = url.hostname;
    const hasPath = url.pathname && url.pathname !== "/";
    const dup = frequencyCounter[href] > 1;

    const cardIcon = document.createElement("img");
    cardIcon.src = isExtension
      ? getFavicon(url)
      : faviconMap[hostname] || `https://${hostname}/favicon.ico`;
    const titleText = document.createTextNode(title);

    const link = document.createElement("a");
    link.href = url;
    link.appendChild(cardIcon);
    link.appendChild(titleText);

    const texts = [link, hostname, folder, fullFolder, hasPath, dup];
    if (hasVisited) {
      texts.push(...[bookmark.lastVisitTime, bookmark.visitCount]);
    }
    const tr = tbody.insertRow();
    texts.forEach((text, idx) => {
      if (idx == 0) {
        const trCell = tr.insertCell();
        trCell.appendChild(text);
      } else {
        tr.insertCell().textContent = text;
      }
    });
  });
  return table;
}

async function loadBookmarkTree() {
  // chrome extension
  try {
    const bookmarkTree = await chrome.bookmarks.getTree();
    const bookmarksData = collectBookmarks(bookmarkTree);
    const bookmarkDetailsPromises = bookmarksData.map((bookmark) => getBookmarkDetails(bookmark));
    const bookmarks = await Promise.all(bookmarkDetailsPromises);
    const table = createBookmarkTable(bookmarks, true, true, {});
    renderPages(table);
  } catch (error) {
    console.error("Error processing bookmarks:", error);
  }
}

function collectBookmarksFromFile(rootNode) {
  let bookmarks = [];
  function traverse(node, currentPath = "") {
    const tag = node.tagName.toUpperCase();
    let path = currentPath;
    if (tag == "DT") {
      const folder = node.querySelector("h3");
      const anchor = node.querySelector("a");
      if (folder) {
        path = currentPath + "/" + folder.textContent;
      } else if (anchor) {
        bookmarks.push({
          url: anchor.href,
          title: anchor.textContent,
          path: path,
        });
      }
    }
    for (const child of node.children) {
      traverse(child, path);
    }
  }
  traverse(rootNode);
  return bookmarks;
}

async function loadBookmarkHtmlFile(fileContent) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(fileContent, "text/html");
  var table = doc.querySelector("table");

  if (!table && doc.querySelectorAll("dl dt").length > 0) {
    const rootNode = doc.querySelector("body");
    const bookmarks = collectBookmarksFromFile(rootNode);
    // const faviconMap = await getFaviconForHostnames(bookmarks);
    const faviconMap = {};
    table = createBookmarkTable(bookmarks, false, false, faviconMap);
  }

  if (table) {
    renderPages(table);
  } else {
    alert("No table or bookmarks found in the HTML file.");
  }
}

async function loadBookmarkJsonFile(fileContent) {
  const data = JSON.parse(fileContent);
  const bookmarks = collectBookmarks(data);
  // const bookmarks = rootNode;
  // const faviconMap = await getFaviconForHostnames(bookmarks);
  const faviconMap = {};
  const table = createBookmarkTable(bookmarks, false, false, faviconMap);
  if (table) {
    renderPages(table);
  } else {
    alert("No table or bookmarks found in the HTML file.");
  }
}

async function loadBookmarkFile(file) {
  if (file) {
    const fileType = file.type;
    if (fileType !== "text/html" && fileType !== "application/json") {
      alert("Upload HTML / JSON file!");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileContent = event.target.result;
      if (file.type === "text/html") {
        await loadBookmarkHtmlFile(fileContent);
      } else {
        await loadBookmarkJsonFile(fileContent);
      }
    };
    reader.readAsText(file);
  } else {
    alert("Please drop an HTML file.");
  }
}

// file drag and drop, open
function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function dropHandler(event) {
  const file = event.dataTransfer.files[0];
  loadBookmarkFile(file);
}

function openSameFileAgain(event) {
  const selectedFile = event.target.files[0];
  if (selectedFile) {
    const file = event.target.files[0];
    loadBookmarkFile(file);
    event.target.value = ""; // allow open same file again
  }
}

function createRadioOrCheckbox(itemList, className, isRadio = false, name = "") {
  const container = document.createElement("div");
  itemList.forEach((item, index) => {
    const option = document.createElement("input");
    option.className = className;
    option.value = item;
    option.type = isRadio ? "radio" : "checkbox";
    option.name = name;
    if (isRadio && index == 0) {
      option.checked = true;
    }

    const label = document.createElement("label");
    label.textContent = item;

    container.appendChild(option);
    container.appendChild(label);
  });
  return container;
}

function createTextInput(item, className, name) {
  const container = document.createElement("div");
  const label = document.createElement("label");
  label.textContent = item + ": ";
  const input = document.createElement("input");
  input.type = "text";
  input.name = name;
  // label.toLowerCase().replace(/\s/g, '_');
  input.className = className;

  container.appendChild(label);
  container.appendChild(input);
  return container;
}

// more
function sortTable(column, table) {
  // sort table depends on its type (string, number, date)
  const rows = Array.from(table.getElementsByTagName("tr")).slice(1);
  const isDateColumn = rows.every((row) => isValidDate(row.cells[column].innerText));
  const isNumericColumn = rows.every((row) => !isNaN(parseFloat(row.cells[column].innerText)));

  let sortOrder = 1;
  const sortedColumn = table.getAttribute("data-sorted-column");
  if (sortedColumn === String(column)) {
    sortOrder = -parseInt(table.getAttribute("data-sort-order")) || 1;
  } else {
    const headers = table.getElementsByTagName("th");
    for (let i = 0; i < headers.length; i++) {
      headers[i].classList.remove("asc", "desc");
    }
  }

  // Sort the rows based on the content of the specified column
  rows.sort((rowA, rowB) => {
    const cellA = rowA.cells[column].innerText;
    const cellB = rowB.cells[column].innerText;
    if (isDateColumn) {
      const dateA = cellA === "" ? new Date(0) : new Date(cellA);
      const dateB = cellB === "" ? new Date(0) : new Date(cellB);
      return (dateA - dateB) * sortOrder;
    } else if (isNumericColumn) {
      return (parseFloat(cellA) - parseFloat(cellB)) * sortOrder;
    } else {
      return cellA.localeCompare(cellB) * sortOrder;
    }
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
