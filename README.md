# Offai-RN

Offai-RN is a React Native application that runs a large language model (LLM) locally on your device. This allows you to have a private and offline AI assistant.

## Features

- **Offline AI Assistant**: Chat with an AI assistant without an internet connection.
- **Local LLM**: The language model runs directly on your device, ensuring privacy.
- **Model Downloader**: The application includes a component to download the language model from Hugging Face.
- **Chat Interface**: A simple and intuitive chat interface for interacting with the AI.
- **Cross-Platform**: Built with React Native, the app can be run on both Android and iOS devices.

## Tech Stack

- **React Native**: A framework for building native apps using React.
- **Expo**: A platform for making universal React applications.
- **Llama.rn**: A library for running Llama models on-device.
- **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.

## Getting Started

### Prerequisites

- Node.js
- Yarn or npm
- Expo CLI
- Android Studio or Xcode for running on an emulator/simulator or a physical device.

### Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:lucassf2k/offai-rn.git
   ```
2. Navigate to the project directory:
   ```bash
   cd offai-rn
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

### Running the Application

1. Start the Metro bundler:
   ```bash
   npm start
   ```
   or
   ```bash
   yarn start
   ```
2. Follow the instructions in the terminal to run the app on an Android emulator/device or an iOS simulator/device.

## Available Scripts

- `npm start`: Starts the Metro bundler.
- `npm run android`: Runs the app on an Android emulator or connected device.
- `npm run ios`: Runs the app on an iOS simulator or connected device.
- `npm run web`: Runs the app in a web browser.
- `npm test`: Runs the test suite.

## Project Structure

```
offai-rn/
├── android/
├── ios/
├── src/
│   ├── app/
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   ├── components/
│   │   └── download-model.tsx
│   ├── lib/
│   │   └── llama-rn/
│   └── styles/
├── package.json
└── ...
```
