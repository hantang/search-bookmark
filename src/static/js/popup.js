document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("loadBookmarksButton")
    .addEventListener("click", function () {
      chrome.tabs.create({ url: "index.html" });
    });
});

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("navigateBookmarksButton")
    .addEventListener("click", function () {
      chrome.tabs.create({ url: "pintree.html" });
    });
});

// export html2json

document
  .getElementById("exportBookmarksButton")
  .addEventListener("click", () => {
    chrome.bookmarks.getTree((bookmarks) => {
      // TODO
      const bookmarksJson = JSON.stringify(bookmarks, null, 2);
      downloadJson(bookmarksJson, "bookmarks.json");
    });
  });

function downloadJson(data, filename) {
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
