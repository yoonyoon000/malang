# 3D Squishy Hand Toy

React + Vite + React Three Fiber로 만든 GitHub Pages 배포 가능한 3D 말랑이 주물주물 사이트입니다.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## GitHub Pages deployment

This project is configured for this repository's GitHub Pages path:

```js
base: '/malang/'
```

If your repository name is different, update `base` in `vite.config.js`.

```js
base: '/your-repository-name/'
```

## Deploy with gh-pages

```bash
npm install
npm run build
npm run deploy
```

Then enable GitHub Pages in the repository settings and select the `gh-pages` branch.

## Controls

- Press and hold anywhere on the scene to squeeze the toy.
- Release to let it spring back with overshoot.
- Use the bottom buttons to reset, squeeze harder, change color, change shape, or toggle auto squeeze mode.
