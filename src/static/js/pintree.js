function searchInData(data, query) {
  // recursive search
  let results = [];
  data.forEach((item) => {
    if (item.title.toLowerCase().includes(query)) {
      results.push(item);
    }
    if (item.children) {
      const childResults = searchInData(item.children, query);
      if (childResults.length > 0) {
        results = results.concat(childResults);
      }
    }
  });
  return results;
}

// Search functionality
function searchBookmarks(query, data) {
  const results = searchInData(data, query.toLowerCase());
  renderBookmarks(results, [{ title: "Search Results", children: results }]);
}

// Clear search results and reset UI
function clearSearchResults(data) {
  const secondLayer = data[0].children;
  renderNavigation(secondLayer, document.getElementById("navigation"));
  renderBookmarks(secondLayer, [{ title: "Bookmark", children: secondLayer }]);
  document.getElementById("searchInput").value = "";
  document.getElementById("clearSearchButton").classList.add("hidden");
}

// Render sidebar navigation
function renderNavigation(folders, container, isFirstRender = false, path = []) {
  container.innerHTML = ""; // Clear previous content
  folders.forEach((folder, index) => {
    if (folder.type === "folder" || folder["children"]) {
      const navItem = document.createElement("li");
      navItem.className =
        "items-center group flex justify-between gap-x-3 rounded-md p-2 text-gray-700 dark:text-gray-400 hover:text-main-500 hover:bg-gray-50 dark:hover:pintree-bg-gray-800 bg-opacity-50";

      const navLinkContainer = document.createElement("div");
      navLinkContainer.className = "flex items-center space-x-2 truncate";

      const folderIcon = document.createElement("span");
      folderIcon.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7a2 2 0 012-2h4l2 2h7a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>';

      const navLink = document.createElement("a");
      navLink.className = "flex text-sm leading-6 font-semibold dark:text-gray-400";
      navLink.innerText = folder.title;

      navLinkContainer.appendChild(folderIcon);
      navLinkContainer.appendChild(navLink);

      const toggleIcon = document.createElement("span");
      toggleIcon.className = "ml-2 transform transition-transform";
      toggleIcon.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>';

      navItem.appendChild(navLinkContainer);
      if (folder.children && folder.children.length > 0) {
        navItem.appendChild(toggleIcon);
      }
      container.appendChild(navItem);

      if (folder.children && folder.children.length > 0) {
        const subList = document.createElement("ul");
        subList.className = "ml-4 space-y-2 hidden";
        renderNavigation(
          folder.children,
          subList,
          false,
          path.concat({ title: folder.title, children: folder.children })
        );
        container.appendChild(subList);

        if (isFirstRender && index === 0) {
          // Expand the first item on initial render
          subList.classList.remove("hidden");
          toggleIcon.classList.add("rotate-90");
        }

        navItem.onclick = (e) => {
          e.stopPropagation();
          document
            .querySelectorAll("#navigation .sidebar-active")
            .forEach((el) => el.classList.remove("sidebar-active"));
          navItem.classList.add("sidebar-active");
          subList.classList.toggle("hidden");
          if (subList.children.length > 0) {
            toggleIcon.classList.toggle("rotate-90");
          }
          renderBookmarks(
            folder.children,
            path.concat({ title: folder.title, children: folder.children })
          );
        };
      } else {
        navItem.onclick = (e) => {
          e.stopPropagation();
          document
            .querySelectorAll("#navigation .sidebar-active")
            .forEach((el) => el.classList.remove("sidebar-active"));
          navItem.classList.add("sidebar-active");
          renderBookmarks(
            folder.children,
            path.concat({ title: folder.title, children: folder.children })
          );
        };
      }
    }
  });
}

// Render breadcrumbs for navigation
function renderBreadcrumbs(path) {
  const breadcrumbsPath = document.getElementById("breadcrumbs-path");
  breadcrumbsPath.innerHTML = ""; // Clear previous breadcrumbs

  path.forEach((item, index) => {
    const breadcrumb = document.createElement("span");
    breadcrumb.className = "cursor-pointer hover:underline";
    breadcrumb.innerText = item.title;
    breadcrumb.onclick = () => {
      // Render bookmarks for the selected breadcrumb
      const newPath = path.slice(0, index + 1);
      renderBookmarks(item.children, newPath);
      updateSidebarActiveState(newPath); // Update sidebar active state
      // Hide clear button when navigating through breadcrumbs
      document.getElementById("clearSearchButton");
    };

    breadcrumbsPath.appendChild(breadcrumb);

    if (index < path.length - 1) {
      const separator = document.createElement("span");
      separator.innerText = " > ";
      breadcrumbsPath.appendChild(separator);
    }
  });
}

// Update the active state of sidebar items
function updateSidebarActiveState(path) {
  document
    .querySelectorAll("#navigation .sidebar-active")
    .forEach((el) => el.classList.remove("sidebar-active"));

  let currentNav = document.getElementById("navigation");

  path.forEach((item, index) => {
    const items = currentNav.querySelectorAll("li");
    items.forEach((navItem) => {
      const navLink = navItem.querySelector("a");
      if (navLink && navLink.innerText === item.title) {
        if (index === path.length - 1) {
          navItem.classList.add("sidebar-active");
        }

        if (index < path.length - 1) {
          const subList = navItem.querySelector("ul");
          if (subList) {
            subList.classList.remove("hidden");
            currentNav = subList;
          }
        }
      }
    });
  });
}

// Create bookmark card element
function createCard(title, url, icon) {
  const card = document.createElement("div");
  card.className =
    "cursor-pointer flex items-center hover:shadow-sm transition-shadow p-4 bg-white shadow-sm ring-1 ring-gray-900/5 dark:pintree-ring-gray-800 rounded-lg hover:bg-gray-100 dark:pintree-bg-gray-900 dark:hover:pintree-bg-gray-800";
  card.onclick = () => window.open(url, "_blank"); // Make the whole card clickable

  const hostname = new URL(url).hostname;
  // const faviconSite = "https://logo.clearbit.com"; // https://favicon.im
  const cardIcon = document.createElement("img");
  cardIcon.src = icon || `https://api.faviconkit.com/${hostname}`;
  cardIcon.alt = title;
  cardIcon.className = "w-8 h-8 mr-4 rounded-full flex-shrink-0 card-icon-bg"; // Smaller size and rounded

  // Check if the image URL returns 404 and replace it with the default icon if it does
  cardIcon.onerror = () => {
    cardIcon.src = "assets/default-icon.svg";
  };

  const cardContent = document.createElement("div");
  cardContent.className = "flex flex-col overflow-hidden"; // Ensure the content is hidden if too long

  const cardTitle = document.createElement("h2");
  cardTitle.className = "text-sm font-medium mb-1 truncate dark:text-gray-400";
  cardTitle.innerText = title;

  // Clean URL by removing http(s) and trailing slash
  const cleanUrl = url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  const cardUrl = document.createElement("p");
  cardUrl.className = "text-xs text-gray-400 dark:text-gray-600 dark:hover:text-gray-400 truncate";
  cardUrl.innerText = cleanUrl; // Use cleaned URL

  cardContent.appendChild(cardTitle);
  cardContent.appendChild(cardUrl); // Add URL paragraph

  card.appendChild(cardIcon);
  card.appendChild(cardContent);

  return card;
}

// Create folder card element
function createFolderCard(title, children, path) {
  const card = document.createElement("div");
  card.className = "folder-card text-gray rounded-lg cursor-pointer flex flex-col items-center";
  card.onclick = () => {
    const newPath = path.concat({ title, children });
    renderBookmarks(children, newPath);
    updateSidebarActiveState(newPath); // Update sidebar active state
  };

  const cardIcon = document.createElement("div");
  cardIcon.innerHTML = `
    <svg viewBox="0 0 100 80" class="folder__svg">
      <rect x="0" y="0" width="100" height="80" class="folder__back" />
      <rect x="15" y="8" width="70" height="60" class="paper-1" />
      <rect x="10" y="18" width="80" height="50" class="paper-2" />
      <rect x="0" y="10" width="100" height="70" class="folder__front" />
      <rect x="0" y="10" width="100" height="70" class="folder__front right" />
    </svg>
  `;
  cardIcon.className = "mb-2";

  const cardTitle = document.createElement("h2");
  cardTitle.className = "text-xs font-normal text-center w-full truncate dark:text-gray-400";
  cardTitle.innerText = title;

  card.appendChild(cardIcon);
  card.appendChild(cardTitle);

  return card;
}

// Show a message when no search results are found
function showNoResultsMessage() {
  const container = document.getElementById("bookmarks");
  container.innerHTML = ""; // Clear previous content

  const messageContainer = document.createElement("div");
  messageContainer.className = "flex flex-col items-center justify-center h-full";

  const icon = document.createElement("svg");
  icon.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  icon.setAttribute("class", "h-16 w-16 text-gray-500");
  icon.setAttribute("fill", "none");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("stroke", "currentColor");
  icon.innerHTML =
    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m9-3a9 9 0 11-18 0 9 9 0 0118 0z" />';

  const title = document.createElement("h2");
  title.className = "text-gray-500 text-xl font-semibold mt-4";
  title.innerText = "Oops, Nothing to See Here!";

  const message = document.createElement("p");
  message.className = "text-gray-500 mt-2";
  message.innerText = "Try another search or discover more cool stuff elsewhere!";

  messageContainer.appendChild(icon);
  messageContainer.appendChild(title);
  messageContainer.appendChild(message);

  container.appendChild(messageContainer);
}

// Render bookmarks
function renderBookmarks(data, path) {
  const container = document.getElementById("bookmarks");
  container.innerHTML = ""; // Clear previous content

  // Render breadcrumbs
  renderBreadcrumbs(path);

  // Separate folders and links
  const folders = data.filter((item) => item.type === "folder" || item["children"]);
  const links = data.filter((item) => item.type === "link" || item["url"]);

  if (folders.length === 0 && links.length === 0) {
    showNoResultsMessage();
    return;
  }

  // Create folder section
  if (folders.length > 0) {
    const folderSection = document.createElement("div");
    folderSection.className =
      "grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-8 2xl:grid-cols-12 gap-6";
    folders.forEach((folder) => {
      const card = createFolderCard(folder.title, folder.children, path);
      folderSection.appendChild(card);
    });
    container.appendChild(folderSection);
  }

  // Add separator line if there are links
  if (folders.length > 0 && links.length > 0) {
    const separator = document.createElement("hr");
    separator.className = "my-1 border-t-1 border-gray-200 dark:pintree-border-gray-800";
    container.appendChild(separator);
  }

  // Create link section
  if (links.length > 0) {
    const linkSection = document.createElement("div");
    linkSection.className = "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-6";
    links.forEach((link) => {
      const card = createCard(link.title, link.url, link.icon);
      linkSection.appendChild(card);
    });
    container.appendChild(linkSection);
  }

  // Update sidebar active state
  updateSidebarActiveState(path);
}

function isBrowserEnvironment() {
  // 简单判断是否在 Chrome 环境中
  return typeof chrome !== "undefined" && chrome.bookmarks;
}
async function getBookmarksFromBrowser() {
  return new Promise((resolve) => {
    chrome.bookmarks.getTree((bookmarkTreeNodes) => {
      const bookmarks = [];
      bookmarkTreeNodes.forEach((node) => {
        const structuredBookmarks = extractBookmarks(node, 0);
        if (structuredBookmarks) {
          // console.log(structuredBookmarks, structuredBookmarks);
          bookmarks.push(structuredBookmarks);
        }
      });
      resolve(bookmarks);
    });
  });
}

function extractBookmarks(node, level) {
  if (node.url) {
    // 如果是书签，返回对象
    return {
      title: node.title,
      url: node.url,
      id: node.id,
      dateAdded: node.dateAdded,
      icon: node.icon,
    };
  } else if (node.children) {
    // 如果是目录，返回包含子项的对象
    const children = node.children
      .map((childNode) => extractBookmarks(childNode, level + 1))
      .filter(Boolean);
    return {
      title: node.title ? node.title : level === 0 ? "ROOT" : `LEVEL-${level}`,
      children: children,
    };
  }
  return null; // 无效节点
}

async function getBookmarksFromLocalFile() {
  const response = await fetch("json/pintree.json");
  return await response.json();
}

document.addEventListener("DOMContentLoaded", async () => {
  const dataFile = "json/pintree.json";

  // copyright year
  const yearElement = document.getElementById("currentYear");
  const startYear = 2024;
  const currentYear = new Date().getFullYear();
  yearElement.textContent =
    currentYear === startYear ? currentYear : `${startYear} - ${currentYear}`;

  // TODO side bar
  // // Variables for sidebar elements
  // const openSidebarButton = document.getElementById("open-sidebar-button");
  // const closeSidebarButton = document.getElementById("close-sidebar-button");
  // const offCanvasMenu = document.getElementById("off-canvas-menu");
  // const offCanvasBackdrop = document.getElementById("off-canvas-backdrop");
  // const offCanvasContent = document.getElementById("off-canvas-content");

  // // Function to open the sidebar
  // const openSidebar = () => {
  //   offCanvasMenu.classList.remove("hidden");
  //   setTimeout(() => {
  //     offCanvasBackdrop.classList.add("opacity-100");
  //     offCanvasContent.classList.add("translate-x-0");
  //   }, 10);
  // };

  // // Function to close the sidebar
  // const closeSidebar = () => {
  //   offCanvasBackdrop.classList.remove("opacity-100");
  //   offCanvasContent.classList.remove("translate-x-0");
  //   setTimeout(() => {
  //     offCanvasMenu.classList.add("hidden");
  //   }, 300); // Match the duration of the transition
  // };

  // // Event listeners for open and close buttons
  // // openSidebarButton.addEventListener("click", openSidebar);
  // closeSidebarButton.addEventListener("click", closeSidebar);
  // // Close sidebar when clicking on the backdrop
  // offCanvasBackdrop.addEventListener("click", closeSidebar);

  // // Open mobile menu openSidebarButton
  // document
  //   .getElementById("open-sidebar-button")
  //   .addEventListener("click", function () {
  //     var navigation = document.getElementById("navigation").cloneNode(true);
  //     document.getElementById("sidebar-2").appendChild(navigation);
  //   });

  // Fetch and render data

  let bookmarks = [];

  if (isBrowserEnvironment()) {
    // console.log("read from isBrowserEnvironment");
    bookmarks = await getBookmarksFromBrowser();
  } else {
    // console.log("read from Local");
    bookmarks = await getBookmarksFromLocalFile();
  }

  document.getElementById("loading-spinner").style.display = "none";

  // Use the first layer of the data directly
  const firstLayer = bookmarks;
  // Render navigation using the first layer of data
  renderNavigation(firstLayer, document.getElementById("navigation"), true);
  // Render bookmarks using the first layer of data, starting from the Bookmark
  renderBookmarks(firstLayer, [{ title: "Bookmark", children: firstLayer }]);

  // Automatically select and show the first item
  if (firstLayer.length > 0) {
    const firstItem = firstLayer[0];
    updateSidebarActiveState([{ title: firstItem.title, children: firstItem.children }]);
    renderBookmarks(firstItem.children, [
      { title: "Bookmark", children: firstLayer },
      { title: firstItem.title, children: firstItem.children },
    ]);
  }

  // Search functionality on button click
  document.getElementById("searchButton").addEventListener("click", function () {
    const query = document.getElementById("searchInput").value;
    searchBookmarks(query, bookmarks);
  });

  // Search functionality on pressing Enter
  document.getElementById("searchInput").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      const query = event.target.value;
      searchBookmarks(query, bookmarks);
    }
  });

  document.getElementById("clearSearchButton").addEventListener("click", () => {
    clearSearchResults(bookmarks);
  });
  // })
  // .catch((error) => {
  //   console.error("Error loading bookmarks:", error);
  //   // Optionally hide the spinner and show an error message
  //   document.getElementById("loading-spinner").style.display = "none";
  // });
});
