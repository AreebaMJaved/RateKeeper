# Rate Keeper — Live Currency Converter

## 📖 Project Overview

Rate Keeper is a single-page currency conversion tool built with React. It lets a user enter an amount, pick a source and target currency from a list of 12 major currencies, and instantly see the converted value using live exchange rates fetched from a public API.

It was built as a practice project to demonstrate core React concepts — controlled inputs, side effects, memoized derived state, and resilient API handling with a fallback data source — inside a small, self-contained UI.

**Target users:** anyone who wants a quick, no-signup currency conversion widget, or a developer studying a compact example of `useEffect` + `useMemo` used together for a real (not toy) purpose.

## 🛠️ Tech Stack

| Category | Technology | Usage |
|---|---|---|
| Frontend | React (functional components + hooks) | Builds the single `CurrencyConverter` component and manages all UI state |
| Styling | Tailwind CSS utility classes | Layout, spacing, typography, responsive sizing |
| Styling | Inline `style` objects (`COLORS` palette) | Applies the maroon / pale-brown color scheme directly, independent of Tailwind's arbitrary-value JIT config |
| Icons | `lucide-react` | `Landmark`, `ArrowRightLeft`, `TrendingUp`, `Loader2`, `AlertCircle` — used for the logo mark, swap button, rate footer, loading, and error states |
| Data | Frankfurter API (`api.frankfurter.app`) | Primary source for live exchange rates, no API key required |
| Data | open.er-api.com | Fallback source used automatically if the primary API call fails |

No routing library, backend, database, or state-management library (Redux/Context) is used — all state lives in local component state via `useState`.

## 🧩 Major Concepts Used

- **`useState`** — tracks `amount`, `fromCurrency`, `toCurrency`, `rate`, `loading`, `error`, and `lastUpdated`.
- **`useEffect`** — runs whenever `fromCurrency` or `toCurrency` changes; fetches the live rate, and cleans up with a `cancelled` flag to avoid setting state after unmount or after a newer request has started.
- **`useMemo`** — recomputes `convertedAmount` only when `amount` or `rate` change, so it isn't recalculated on unrelated re-renders (e.g. the loading spinner toggling).
- **`useCallback`** — memoizes the `handleSwap` function that swaps the two selected currencies.
- **Async/await + try/catch** — used inside the `fetchRate` function for both the primary and fallback API calls.
- **API integration with fallback strategy** — if the Frankfurter request fails or errors, the code automatically retries with a second, independent API before surfacing an error to the user.
- **Controlled form inputs** — the amount `<input>` and both `<select>` elements are fully controlled by React state, with input filtered by a regex (`/^\d*\.?\d*$/`) to only allow valid numeric text.
- **Conditional rendering** — the result panel switches between a loading state, an error state, and the converted-amount display based on component state.
- **Cleanup functions** — the `useEffect` returns a cleanup function that sets `cancelled = true`, preventing race conditions if the user changes currencies quickly.

## ✨ Key Features

- Convert between 12 currencies: USD, EUR, GBP, PKR, INR, AED, SAR, JPY, CAD, AUD, CNY, CHF
- Live exchange rate fetched on every currency-pair change
- One-click swap between "From" and "To" currencies
- Automatic fallback to a second exchange-rate API if the first one fails
- Loading and error states shown directly inside the result card
- Numeric-only amount input (blocks invalid characters as you type)
- Displays the last-updated date of the exchange rate when available

## 📁 Project Structure

This project currently exists as a single component file, intended to be dropped into a Vite + React app:

```text
src/
└── App.jsx    # CurrencyConverter component — all logic, state, and markup
```

(No additional pages, routes, or utility files currently exist. If the project grows, `CURRENCIES`, `COLORS`, and the fetch logic are natural candidates to extract into separate files under `src/data/` and `src/hooks/`.)

## ⚙️ How It Works

1. **On load**, the component initializes with `amount = "1"`, `fromCurrency = "USD"`, and `toCurrency = "PKR"`.
2. **`useEffect` fires** because the currency pair is set for the first time — it calls the Frankfurter API for the current rate. If that call fails, it automatically tries `open.er-api.com` before showing an error.
3. **User types an amount** — the input's `onChange` handler validates the text with a regex and updates `amount` state.
4. **`useMemo` recalculates** the converted amount whenever `amount` or `rate` changes, formatting it with `toLocaleString`.
5. **User changes a currency dropdown** — this updates `fromCurrency` or `toCurrency`, which re-triggers the `useEffect` to fetch a fresh rate for the new pair.
6. **User clicks the swap button** — `handleSwap` swaps `fromCurrency` and `toCurrency`, which again re-triggers the rate fetch.
7. **Result card** shows a spinner while `loading` is true, an error message if both API calls failed, or the converted amount and current rate otherwise.

## 🚀 Installation & Setup

This component is designed to run inside a Vite + React project.

```bash
# 1. Create a new Vite React project
npm create vite@latest rate-keeper -- --template react
cd rate-keeper

# 2. Install dependencies
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install lucide-react

# 3. Configure Tailwind's content paths in tailwind.config.js:
# content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]

# 4. Add the Tailwind directives to src/index.css:
# @tailwind base;
# @tailwind components;
# @tailwind utilities;

# 5. Replace the contents of src/App.jsx with the CurrencyConverter component code

# 6. Run the dev server
npm run dev
```

No `.env` file or API key is required — both exchange-rate APIs used are free and keyless.

## 📜 Available Scripts

These are the standard Vite scripts this project relies on:

```bash
npm run dev       # Starts the local development server
npm run build     # Builds an optimized production bundle
npm run preview   # Serves the production build locally for testing
```

## 🖼️ Screenshots



```markdown
## Screenshots

### Converter — Default State
![Default State](./Screenshots/default.png)

### Converter — Loading State
![Loading State](./Screenshots/loading.png)
```

## 🎓 Learning / Interview Concepts

This project is a good talking point for demonstrating:

- Using `useEffect` for data fetching tied to dependent state (currency pair)
- Using `useMemo` to avoid redundant calculations on unrelated re-renders
- Writing resilient API-calling code with a primary/fallback pattern and proper error surfacing
- Preventing race conditions in async effects with a cancellation flag
- Building fully controlled forms in React
- Structuring conditional UI states (loading / error / success) cleanly in JSX
- Styling a component with a deliberate custom color system rather than default framework colors

## 🔮 Future Improvements

These are not implemented yet — just realistic next steps:

- Extract `CURRENCIES` and `COLORS` into separate files for reusability
- Add a currency search/filter inside the dropdowns instead of a plain `<select>`
- Debounce the amount input if a future version adds server-side validation
- Add unit tests for the conversion math and the fallback-fetch logic
- Persist the last-used currency pair with `localStorage`
- Add a historical rate chart

## 👤 Author

**Areeba MJaved**

GitHub: 
https://github.com/AreebaMJaved

## 📄 License

No license has currently been specified for this project.