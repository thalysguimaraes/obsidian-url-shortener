# Quick URL Shortener for Obsidian

![Banner](banner-image.jpg)

![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22obsidian-url-shortener%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)
![GitHub stars](https://img.shields.io/github/stars/thalysguimaraes/obsidian-url-shortener?style=flat)
![Latest Release](https://img.shields.io/github/v/release/thalysguimaraes/obsidian-url-shortener)

A beautiful and intuitive Obsidian plugin that automatically detects when you paste URLs and offers to shorten them with a stylish bottom-sliding popover.

## ✨ Features

- 🔗 **Automatic URL Detection**: Instantly detects when you paste a URL in your notes
- 🎨 **Beautiful UI**: Modern glassmorphism design with spring animations
- ⚡ **Fast & Free**: Uses the free Ulvis.net API (no authentication required)
- 🎯 **Non-intrusive**: Bottom-sliding popover that doesn't interfere with your workflow
- 🎮 **Command Palette Support**: Shorten URLs at cursor position via command palette
- 📱 **Cross-platform**: Works on desktop and mobile versions of Obsidian

## 📦 Installation

### From Community Plugins (Recommended)

1. Open Obsidian Settings
2. Navigate to **Community Plugins** and disable **Safe Mode**
3. Click **Browse** and search for "Quick URL Shortener"
4. Click **Install**, then **Enable**

### Manual Installation

1. Download the latest release from [GitHub Releases](https://github.com/thalysguimaraes/obsidian-url-shortener/releases)
2. Extract the files to your vault's plugins folder: `<vault>/.obsidian/plugins/obsidian-url-shortener/`
3. Reload Obsidian
4. Enable the plugin in Settings → Community Plugins

## 🚀 Usage

### Method 1: Paste a URL
1. Copy any URL to your clipboard
2. Paste it in your Obsidian note
3. A stylish popover will slide up from the bottom
4. Click "🔗 Shorten" to replace the URL with a shortened version
5. The popover auto-dismisses after 8 seconds or click ✕ to close

### Method 2: Command Palette
1. Place your cursor on any URL in your note
2. Open Command Palette (Cmd/Ctrl + P)
3. Search for "Shorten URL at cursor"
4. Press Enter to shorten the URL

## ⚙️ Configuration

This plugin works out of the box with zero configuration required! It uses the free Ulvis.net API service which provides:

- ✅ No authentication needed
- ✅ 100 requests per hour limit
- ✅ Private/unlisted short URLs
- ✅ Reliable uptime

## 🛠️ Development

### Prerequisites
- Node.js 16+
- npm or yarn

### Setup
```bash
# Clone the repository
git clone https://github.com/thalysguimaraes/obsidian-url-shortener.git

# Navigate to the plugin directory
cd obsidian-url-shortener

# Install dependencies
npm install

# Build the plugin
npm run build

# For development with hot reload
npm run dev
```

### Building from Source
```bash
# Install dependencies
npm install

# Build for production
npm run build

# The compiled plugin will be in main.js
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Obsidian](https://obsidian.md/) for creating an amazing knowledge management tool
- [Ulvis.net](https://ulvis.net) for providing a free URL shortening API
- The Obsidian community for inspiration and support

## 🐛 Known Issues

- Rate limit of 100 requests per hour (API limitation)
- URLs must start with `http://` or `https://` to be detected

## 📮 Support

- 🐛 [Report bugs](https://github.com/thalysguimaraes/obsidian-url-shortener/issues)
- 💡 [Request features](https://github.com/thalysguimaraes/obsidian-url-shortener/issues)
- ☕ [Buy me a coffee](https://buymeacoffee.com/thalysguimaraes)

## 🔄 Changelog

### Version 1.0.0 (2025-08-13)
- 🎉 Initial release
- ✨ Automatic URL detection on paste
- 🎨 Beautiful glassmorphism UI with spring animations
- 🎮 Command palette integration
- 📱 Cross-platform support

---

Made with ❤️ by [Thalys Guimarães](https://github.com/thalysguimaraes)