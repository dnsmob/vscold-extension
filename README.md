# VS Cold 🤧

A playful VS Code extension that simulates cold symptoms by playing random sneeze sounds at intervals. Perfect for adding some humor to your coding sessions or pranking your pair programming partner!

## Features

- 🎵 Plays random sneeze sounds
- ⏰ Configurable sneeze frequency with fun severity levels
- 🔕 Easy enable/disable via Command Palette or Settings
- 🎲 Never plays the same sneeze twice in a row
- 💾 Remembers your preferences across sessions

## Severity Levels

- **Sniffles**: Sneeze every 5-10 minutes (mild cold)
- **Flu**: Sneeze every 3-7 minutes (moderate cold)
- **Plague**: Sneeze every 2-5 minutes (severe cold)

## Usage

1. **Open a File**: Opening any file in VS Code starts the sneeze timer
2. **Configure**: Adjust severity in Settings (`Ctrl/Cmd + ,` → Extensions → VS Cold)
3. **Enable/Disable**: Use Command Palette (`Ctrl/Cmd + Shift + P`) → "VS Cold: Get Sick" or "VS Cold: Stop Sneezing"

## Commands

- `VS Cold: Get Sick` - Start the sneeze timer
- `VS Cold: Stop Sneezing` - Stop the sneeze timer

## Settings

- `vscold.enabled` - Enable or disable the extension
- `vscold.severity` - Choose how frequently sneezes occur (Sniffles, Flu, Plague)

## Installation

1. Install from VS Code Marketplace
2. Start coding and enjoy the sneezes! 🤧

## Requirements

- macOS (uses `afplay` for audio playback.. is it default?)

## Known Issues

- Currently only supports macOS for audio playback

## Release Notes

### 0.0.1

Initial release of VS Cold
- Random sneeze sound playback
- Configurable severity levels
- Enable/disable functionality
- Persistent settings

## Contributing

Found a bug or want to contribute? Feel free to open an issue or pull request!

## License

MIT

---

**Enjoy coding with VS Cold!** 🤧💻
