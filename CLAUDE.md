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

### Testing
- `npm test` - Run all Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:i` - Run I-pattern tests only
- `npm run test:l` - Run L-pattern tests only
- `npm run test:u` - Run U-pattern tests only
- `npm run test:z` - Run Z-pattern tests only
- `npm run test:verbose` - Run tests with verbose output
- `npm run test:silent` - Run tests with minimal output

**Testing Framework**: Jest-based testing system with comprehensive pattern validation tests located in `test/` directory.

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
- `src/game/logic/PikachuGameLogic.js` - Pure game logic (no Phaser dependencies) for testing
- `test/` - Jest-based testing system with comprehensive pattern validation

### Game Scenes
1. **Boot** - Initial boot scene
2. **Preloader** - Asset loading scene  
3. **MainMenu** - Main menu interface
4. **PikachuGame** - Main game scene with card matching logic

### Game Logic
- **Board**: 20x8 grid of cards using standard playing card assets
- **Matrix System**: 10x22 matrix with border padding (8x20 actual game board)
- **Matching Rules**: Cards must be identical and connected via valid paths:
  - **I-pattern**: Straight line (horizontal or vertical)
  - **L-pattern**: Single 90-degree turn
  - **U-pattern**: Path extending to board border with two turns
  - **Z-pattern**: Two-turn path through empty cells
- **Game Features**: New game, hint system, card selection with visual feedback, debug visualization toggle
- **Testing**: Comprehensive Jest test suite with 90+ test cases covering all patterns

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
- ES modules are used throughout the project (`"type": "module"` in package.json)
- Jest tests are completely separated from game logic - no in-game testing methods
- Debug visualization can be toggled in-game to show connection paths (green=valid, red=invalid)