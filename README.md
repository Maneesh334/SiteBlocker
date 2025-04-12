# Site Blocker Chrome Extension

A Chrome extension that allows users to block websites based on their domains. Built using Manifest V3 and the declarativeNetRequest API for efficient website blocking.

## Features

- Block websites by domain name

## Technical Details

The extension uses:
- Chrome's declarativeNetRequest API for efficient request blocking
- Chrome Storage API for persisting blocked sites
- Manifest V3 for modern extension architecture
- Dynamic rule updates for real-time blocking

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory

## Usage

1. Click the extension icon in your Chrome toolbar
2. Enter a domain name (e.g., "example.com") in the input field
3. Click "Add" to block the domain
4. To remove a blocked domain, click the "Remove" button next to it

