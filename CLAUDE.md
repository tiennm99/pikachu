# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview
This is a Pikachu card matching game built with Phaser 3 and Next.js. The game implements the classic "Pikachu" card matching rules where players must match identical cards using I, L, U, or Z-shaped connection patterns.

## Commands

### Development
- `npm run dev` - Start development server on port 8080 (with anonymous usage logging)
- `npm run dev-nolog` - Start development server without logging
- `npm install` - Install dependencies

### Build
- `npm run build` - Create production build in dist folder (with anonymous usage logging)
- `npm run build-nolog` - Create production build without logging

### No Testing Framework
This project does not include any testing framework or linting configuration. There are no test scripts defined in package.json.

## Architecture

### Game Structure
- **Next.js Framework**: Uses Next.js for the web application framework
- **Phaser 3 Game Engine**: Game logic is implemented using Phaser 3 (v3.90.0)
- **React-Phaser Bridge**: Communication between React and Phaser via EventBus

### Key Components
- `src/PhaserGame.jsx` - Bridge component that initializes Phaser and handles React-Phaser communication
- `src/game/main.js` - Phaser game configuration and initialization
- `src/game/EventBus.js` - Event system for React-Phaser communication
- `src/game/scenes/` - Contains all Phaser scene classes

### Game Scenes
1. **Boot** - Initial boot scene
2. **Preloader** - Asset loading scene  
3. **MainMenu** - Main menu interface
4. **PikachuGame** - Main game scene with card matching logic

### Game Logic (PikachuGame.js)
- **Board**: 20x8 grid of cards using standard playing card assets
- **Matching Rules**: Cards must be identical and connected via valid paths:
  - **I-pattern**: Straight line (horizontal or vertical)
  - **L-pattern**: Single 90-degree turn
  - **U-pattern**: Path extending to board border with two turns
  - **Z-pattern**: Two-turn path through empty cells
- **Game Features**: New game, hint system, card selection with visual feedback

### Asset Structure
- Cards are stored in `public/assets/cards/` with naming convention like `2S.png`, `KC.png`
- Background image at `public/assets/bg.png`
- Assets are loaded through Phaser's standard asset loading system

### React-Phaser Communication
- Use `EventBus.emit()` to send events from React to Phaser
- Use `EventBus.on()` to listen for events from Phaser in React
- Scene readiness is communicated via `current-scene-ready` event
- PhaserGame component exposes game instance and current scene via React refs

## Development Notes
- Game runs on port 8080 by default
- Hot reloading is enabled for development
- The project includes anonymous usage logging (can be disabled with -nolog variants)
- All game assets should be placed in `public/assets/` directory
- Scene transitions use `this.scene.start('SceneName')`