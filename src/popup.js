document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('loadBookmarksButton').addEventListener('click', function() {
        chrome.tabs.create({ url: 'site/index.html' });
    });
});

