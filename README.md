# Winter 2027 Anime Guide
## Run locally
Install Node.js 20 or later, then run:

```sh
npm install
npm run dev
```

## Publish to GitHub Pages
The GitHub Actions workflow in `.github/workflows/deploy.yml` builds and deploys this app when you push to `main`. In the repository settings, open **Settings → Pages** and set the build and deployment source to **GitHub Actions**.

The workflow is configured for this repository's project-site URL (`/winter-season/`). After the first successful run, GitHub Pages will show the published URL under **Settings → Pages**.

Selections are saved in this browser's local storage. GitHub Pages is static hosting and does not provide the server-side `actions` API, so saved lists are local to each browser rather than shared between users or devices.
