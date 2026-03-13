# super-potato

Super Potato Ranch is a pixel-art inspired idle/clicker game where you:

- Plant potatoes
- Click to grow them faster
- Harvest mature potatoes for coins
- Train harvested potatoes into superheroes

## Run locally

From the repository root, run any static web server. Example with Python:

```bash
py -m http.server 5500
```

Then open `http://localhost:5500/`.

## Host on GitHub Pages

1. Push this repository to GitHub.
2. Open repository **Settings → Pages**.
3. In **Build and deployment**, set:
	- **Source**: Deploy from a branch
	- **Branch**: `main` (or your preferred branch), folder `/ (root)`
4. Save and wait for deployment.

Your game will be served from the GitHub Pages URL for the repository.