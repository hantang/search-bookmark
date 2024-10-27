function getBrowserName() {
  const userAgent = navigator.userAgent;
  const browsers = ["Chrome", "Firefox", "Safari", "Edg", "Vivaldi", "Brave"];
  // match browser names
  const browser = browsers.find((browser) => userAgent.includes(browser));
  return browser ? browser.toLowerCase() : "unk-browser";
}

function downloadJson(data) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const formattedDate = `${year}${month}${day}`;
  const browser = getBrowserName();
  const filename = `${browser}-bookmarks-${formattedDate}.json`;

  const blob = new Blob([data], { type: "application/json" });
  if (window.navigator && window.navigator.msSaveBlob) {
    // Edge
    console.log("edge");
    window.navigator.msSaveBlob(blob, filename);
  } else {
    // Chrome
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  }
}

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
