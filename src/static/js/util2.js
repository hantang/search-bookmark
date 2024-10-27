function isBrowserEnvironment() {
  // check chrome extension api env
  return typeof chrome !== "undefined" && chrome.bookmarks;
}

function getBrowserName() {
  const userAgent = navigator.userAgent;
  const brandsList = navigator.userAgentData.brands.map((value) => value.brand) || [];
  const browsers = ["Firefox", "Edge", "Vivaldi", "Brave", "Chrome", "Safari"];
  // match browser names
  const browser = browsers.find(
    (browser) => userAgent.includes(browser) || brandsList.includes(browser)
  );
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
