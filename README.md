# AI-Powered D&D Statblock Generator

![Version](https://img.shields.io/badge/version-v0.8.1-orange) ![License](https://img.shields.io/badge/License-MIT-green.svg) ![Status](https://img.shields.io/badge/status-vibe--coded-red)

This is an experimental, vibe-coded app for generating Dungeons & Dragons 5th Edition monster statblocks. It's powered by whatever local language models you have running on [Ollama](https://ollama.com/).

Think of it as a creative partner. You give it a weird idea, and it gives you a monster to start with. It's built to be simple, local, and infinitely hackable.

## What's the Vibe?

This project is for tinkerers, homebrewers, and anyone who wants to play with local AI in a fun, tangible way. It's not a polished, production-ready tool. It's a starting point. A messy, beautiful, functional starting point.

-   **100% Local**: No cloud APIs, no subscriptions, no tracking. Just you, your machine, and the AI.
-   **Simple Stack**: Built with Flask and vanilla JavaScript so it's easy to understand and modify.
-   **Hack It**: The code is meant to be broken, changed, and improved. See a feature you want? Add it! Think the UI is ugly? Change it! This is your playground.

## How It Works

1.  You write a prompt, like `"a grumpy mushroom that screams when you pick it up"`.
2.  The frontend sends this to the local Flask server.
3.  The Flask server talks to Ollama, forcing the AI to return a JSON object that looks like a D&D statblock.
4.  The frontend displays the result.

## Getting Started

You'll need a few things to get this running.

1.  **Python 3.8+**: To run the server.
2.  **Ollama**: Install it from [ollama.com](https://ollama.com/). This is the magic that runs the AI models.
3.  **Some Models**: You need to actually download some models for Ollama to use. Open your terminal and pull some:
    ```bash
    ollama pull mistral
    ollama pull phi3
    # ...pull any other models you want to try
    ```

### Running the App

1.  **Clone this repo:**
    ```bash
    git clone https://github.com/your-username/dnd-statblock-generator.git
    cd dnd-statblock-generator
    ```

2.  **Install the Python stuff:**
    ```bash
    pip install Flask requests
    ```

3.  **Run the app:**
    ```bash
    python main_app.py
    ```    The script will check if `ollama serve` is running and try to start it if it's not.

4.  **Open your browser** to `http://localhost:5000`. Start making monsters!

## Project Structure (for hacking)

-   `main_app.py`: This is the backend. All the Flask routes and the logic for talking to Ollama lives here. The `STATBLOCK_SCHEMA` dictionary is the soul of the project—it's the JSON structure the AI is forced to follow.
-   `templates/index.html`: The one and only HTML file. It's the skeleton of the site.
-   `static/app.js`: This is where the frontend magic happens. It handles form submission, talking to the backend, and rendering the statblock.
-   `static/style.css`: It's CSS. Make it pretty if you want.

---

## Changelog

### `v0.8.1` - It Lives!

This is the first version that actually, you know, *works*. It's held together with digital duct tape, but the core loop is solid.

-   **Fixed**: The main bug where the frontend and backend were talking past each other. They're at least on speaking terms now.
-   **Feature**: You can generate a statblock based on a prompt.
-   **Feature**: You can save the generated monster to a `.aimon` file and load it back in.

---

## Roadmap / Ideas for You to Build

This is less of a formal roadmap and more of a list of ideas. If you're looking for a way to contribute or just want to build something cool, start here.

### **Things to Fix & Polish**

-   **[ ] Make it Pretty**: The current UI is... functional. It could use a major glow-up to look like a real D&D book (parchment, fonts, the works).
-   **[ ] Full Editing**: Right now, you can't edit a generated statblock. It would be awesome to click an "Edit" button and be able to change values directly on the page.
-   **[ ] Better Lists**: Actions and abilities should probably be real lists, not just a blob of text. And you should be able to add or remove them.
-   **[ ] Download as PNG**: Who doesn't want a nice image of their creation to drop into their game notes?

### **Bigger, Wilder Ideas**

-   **[ ] Dynamic Model Loading**: The model list is hardcoded in the HTML. It should be able to automatically detect what models you have installed in Ollama.
-   **[ ] Monster Library**: Instead of just saving files, what about a browser-based library to keep all your creations in one place?
-   **[ ] Two-Column Layout**: Classic D&D statblocks often have two columns. A toggle for that would be sweet.
-   **[ ] "Vibe" Slider**: What if you could tune the "vibe" of the generation? A slider from "Strictly RAW (Rules as Written)" to "Totally Unhinged"?

## License

This is under the MIT License. Do whatever you want with it. Seriously. Go nuts.
