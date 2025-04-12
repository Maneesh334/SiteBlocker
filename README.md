# Site Blocker Chrome Extension

A simple Chrome extension that allows you to block websites based on their domains.

## Features

- Add domains to block
- Remove blocked domains
- Persistent blocking across browser sessions
- Simple and intuitive interface

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory

## Usage

1. Click the extension icon in your Chrome toolbar
2. Enter a domain name (e.g., "example.com") in the input field
3. Click "Add" to block the domain
4. To remove a blocked domain, click the "Remove" button next to it

## Notes

- The extension will block all subdomains of the specified domain
- Changes are saved automatically
- The extension requires permissions to block websites and store your preferences

## Development

The extension consists of the following files:
- `manifest.json`: Extension configuration
- `popup.html`: User interface
- `popup.js`: Popup functionality
- `background.js`: Website blocking logic 