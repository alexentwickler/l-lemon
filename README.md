# Little Lemon Capstone

React Native app for the Little Lemon restaurant, built with Expo. It onboards a
guest, keeps their profile on the device, and shows the menu with a search field
and category filters. The wireframe the screens follow is `wireframe.jpg`.

## Screens

- **Onboarding** — shown on the first launch only. Asks for a first name and an
  email address; `Next` stays disabled until both are valid.
- **Home** — header with the logo and a profile button, hero section with the
  search field, the category filter bar, and the menu list.
- **Profile** — the details entered during onboarding plus a phone number, an
  avatar and email preferences. `Save changes` writes to device storage,
  `Log out` clears it and returns to onboarding.

## Data

The menu is fetched once from the course API. On a device it is cached in SQLite,
so every later launch reads from the phone and search and category filtering are
SQL queries against that table. The web build has no SQLite, so it keeps the menu
in memory and refetches after a page reload; both paths behave identically from
the screen's point of view. No category selected means no filter, so the full
menu stays visible until the first chip is tapped.

Dish photos ship with the app because two of the API images are broken upstream —
`grilledFish.jpg` is a blank black file and `lemonDessert.jpg` returns 404.

## Running it

```bash
npm ci
```

```bash
npm start      # Expo Go on a device, or an emulator
npm run web    # browser
```

The web bundle is built with webpack 4, whose md4 hashing OpenSSL 3 refuses.
`webpack.config.js` maps that hash to md5, so `npm run web` also works on Node 17
and newer without a legacy-provider flag.
