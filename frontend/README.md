# Timetracker Frontend

<div align="center">
  <strong>
    Timetracker software for the <a href="https://www.medi.ch/">medi</a> company
  </strong>
</div>
<div align="center">A highly scalable, offline-first software with the best DX
and a focus on performance and best practices</div>

<br />

<div align="center">
  <!-- Build Status -->
  <a href="https://travis-ci.org/zebbra-repos/Zeiterfassung-medi">
    <img src="https://travis-ci.org/zebbra-repos/Zeiterfassung-medi.svg"
    alt="Build Status" />
  </a>
</div>

<br />

<div align="center">
  <sub>Created by <a href="http://zebbra.ch">zebbra AG</a> and maintained with ❤️
    by an amazing <a href="https://github.com/orgs/zebbra/people">team of developers</a>.
  </sub>
</div>

<sub><i>Keywords: React.js, Redux, Hot Reloading, ESNext, Babel, react-router,
Offline First, ServiceWorker, `styled-components`, redux-saga, FontFaceObserver</i></sub>

## Quick start

1. Clone this repo using `git clone --depth=1 https://github.com/zebbra-repos/Zeiterfassung-medi.git`
2. Move to the appropriate directory: `cd zeiterfassung-medi`.<br />
3. Run `npm run setup` in order to install dependencies and clean the
   git repo.<br />
   _We auto-detect `yarn` for installing packages by default, if you wish to
   force `npm` usage do: `USE_YARN=false npm run setup`_<br />
   _At this point you can run `npm start` to see the app at `http://localhost:3000`._

## Documentation

- [Overview](docs/general): A short overview of the included tools
- [**Commands**](docs/general/commands.md): Getting the most out of this software
- [Testing](docs/testing): How to work with the built-in test harness
- [Styling](docs/css): How to work with the CSS tooling
- [Your app](docs/js): Supercharging your app with Routing, Redux, simple
  asynchronicity helpers, etc.

## Environment variables

- `SENTRY_PUBLIC_DSN` public sentry dsn key for unhandled client side
  javascript exceptions
- `SENTRY_DSN` private sentry dsn key for express server
- `TIMETRACKER_BACKEND_URL` url of the backend

## License

This project is licensed under the MIT license, Copyright (c) 2017 zebbra AG.
For more information see `LICENSE.md`.
