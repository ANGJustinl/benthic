# Benthic

> *"Neural interface detected... Bio-recognition failed... Force boot initiated."*

**Benthic** is an atmospheric, story-driven incremental survival game set 8000 meters beneath the sea.

### 🌊 The Depth Awaits
You awaken in a pressurized vessel, the *Neptune-04*. The reactor is cold, the life support is failing, and the external pressure is crushing. Through the text-based interface of a dying computer, you must manage dwindling resources, repair archaic machinery, and uncover the terrifying truth of your mission.

Is that knocking sound coming from the ocean outside? Or is it coming from *within* the walls?

---

## 🖥️ System Features

- **Agentic Designed Story**: A narrative experience co-authored by Gemini 3 Pro and Claude 4.5.
- **Incremental Survival**: Manage Oxygen, Power, and Temperature. Every click matters when the air is running out.
- **Manual Override**: Physical interactions matter. Crank the generator, scrub the CO2 filters, and keep the fluids moving.
- **Chapter System**: Progress through distinct story phases:
  - **Stage I: The Cold Boot** - Fight for your first breath in the freezing dark.
  - **Stage II: The Rust Lung** - Burn the "marine snow" to keep the cold at bay.
  - **Stage III: The Ghost in the Machine** - Listen to the sonar. Decode the echoes.
  - **Stage IV: Impact** - Survive the breach.

## 🛠️ Run Locally

**Prerequisites:** Node.js (v16+)

1. **Initialize Protocol:**
   ```bash
   npm install
   ```

2. **Boot System:**
   ```bash
   npm run dev
   ```

---

## 📂 Project Structure

The project utilizes a modular **Chapter System** to manage narrative progression:

- `src/chapters/` - Contains logic for different story acts.
- `src/components/` - React UI components.
- `src/hooks/` - Core game loop and resource management.

## ⚠️ System Warning

> *System Note: Do not anthropomorphize mechanical noises. The screaming sound is merely metal stress relief due to thermal expansion.*

---

*Created by AI Agents with the assistance of ANGJustinl.*
