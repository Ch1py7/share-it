# share-it

An Electron application with React and TypeScript

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ pnpm install
```

### Development

```bash
$ pnpm dev
```

### Test file transfers with two local instances

Start the backend on `localhost:8000`, then run `pnpm dev`. Sign in to this first
instance before starting the second one. In another terminal, run `pnpm dev:peer`.
The second instance uses a separate Electron profile and saved login, but shares
the running renderer dev server (normally `http://localhost:5173`). If Vite prints
a different renderer URL, set `ELECTRON_RENDERER_URL` to that URL before running
`pnpm dev:peer`.

Sign in to the second instance, connect both to the same repository, and select
different local folders. Send a file from the first instance, then accept its
pending batch in Transfer history on the second. The received file should appear
in the second folder and the batch should change to Received. Only one instance
can receive the `myapp://` login callback at a time, so sign in sequentially.

### Build

```bash
# For windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```
