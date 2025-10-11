# Aeon - Biomolecular Modeling Platform

Welcome to the Aeon project! This is the codebase for Aeon's web platform.

This project is built using SvelteKit and is designed to showcase our landing page and a proof-of-concept (PoC) for biomolecular analysis.

## Project Overview

- **Landing Page:** The main landing page introduces Aeon and its mission.
- **`/analyze` Endpoint:** This endpoint provides a proof-of-concept for viewing biomolecular analysis results. Users can upload a `.json` file containing findings, and the application will display the formatted JSON data on the page. This allows for easy visualization and review of analysis outputs.

## Getting Started

To get started with the Aeon project, follow these steps:

### Prerequisites

Make sure you have Node.js and npm (or pnpm or yarn) installed on your machine.

### Installation

Clone the repository and install the dependencies:

```bash
git clone <your-repository-url>
cd <your-repository-directory>
npm install
```

### Development

To start the development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

This will launch the development server, and you can access the landing page at `http://localhost:<port>` (usually `http://localhost:5173`). Navigate to `/analyze` to access the proof-of-concept endpoint.

### Building

To create a production build of the application:

```bash
npm run build
```

You can preview the production build locally with:

```bash
npm run preview
```

### Deployment

To deploy your application, you will need to choose an adapter for your target environment. Refer to the [SvelteKit documentation on adapters](https://kit.svelte.dev/docs/adapters) for more information. {{ You might want to add specific deployment instructions here if you have a preferred platform. }}

## Learn More

For more information about SvelteKit, check out the [official SvelteKit documentation](https://kit.svelte.dev/).

---

**Aeon - Navigate Your Healthspan with Causal Intelligence.**
