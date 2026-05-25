# Hilal Browser Website

This Vite app powers the public Hilal Browser website and the lightweight
serverless endpoints used by releases.

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Release Endpoints

- `/releases.json` proxies GitHub Releases and feeds the website release-notes
  timeline.
- `/update/6/.../update.xml` is rewritten to `/api/update` and returns Firefox
  application update XML only when a valid MAR manifest exists for the
  requesting platform and channel.

The update endpoint intentionally returns an empty `<updates>` document when a
release has no complete MAR metadata. See `../docs/UPDATES.md` for the release
manifest and signing flow.
