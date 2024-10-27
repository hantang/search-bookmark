# bookmark-search

![Deploy Site](https://github.com/hantang/search-bookmark/actions/workflows/deploy.yml/badge.svg)
![GitHub Tag](https://img.shields.io/github/v/tag/hantang/search-bookmark)
![GitHub Commit](https://img.shields.io/github/last-commit/hantang/search-bookmark)

[:memo: 中文](./README.zh-CN.md)

Search your bookmarks in a more flexible way.

## Features

- Load from browser's bookmarks (Chrome/Chromium extension only).
- Parse from bookmark file (html format) automatically.
- RegExp search.
- Highlight.
- Sort by columns.

## Versions

- :art: Chrome extension: download `zip` file from latest [release](https://github.com/hantang/search-bookmark/releases) and unpacked it, then open `chrome://extensions/` in your browser, enable _Developer mode_ and then _Load unpacked_ the directory.
- Web online version, use this [:link: site link](https://hantang.github.io/search-bookmark).

## Snapshots

- extension version:
  ![snapshot](images/snapshot-extension.png)

- web online version:
  ![snapshot](images/snapshot-web.png)

## Changelog

- :tada: Add `pintree` page, forked from [Pintree-io/pintree](https://github.com/Pintree-io/pintree): change [json file](./src/json/pintree.json) before deploy.
- :rocket: Add `dupes` page, forked from [vaeth/bookmarkdupes](https://github.com/vaeth/bookmarkdupes): only from extension version.

## TODO

- [ ] Export error of `Vivaldi` browser (in extension popup.html)
  - [x] Export from bookmark search page (only extension, JSON format).
- [x] Support load from JSON format file (only web page).
- [ ] Parse favicon from url.

## More

The icon is from [:link: iconfinder](https://www.iconfinder.com/icons/8725808).
