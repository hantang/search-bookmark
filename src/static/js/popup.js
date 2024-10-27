document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loadBookmarksButton").addEventListener("click", () => {
    chrome.tabs.create({ url: "index.html" });
  });

  document.getElementById("navigateBookmarksButton").addEventListener("click", () => {
    chrome.tabs.create({ url: "pintree.html" });
  });

  document.getElementById("dupesBookmarksButton").addEventListener("click", () => {
    chrome.tabs.create({ url: "dupes.html" });
  });

  // export html2json
  document.getElementById("exportBookmarksButton").addEventListener("click", () => {
    chrome.bookmarks.getTree((bookmarks) => {
      const bookmarksJson = JSON.stringify(bookmarks, null, 2);
      downloadJson(bookmarksJson);
    });
  });
});
