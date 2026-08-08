import { useState, useEffect, useMemo, useCallback } from "react";
import { ArrowRightLeft, TrendingUp, Loader2, AlertCircle, Landmark } from "lucide-react";


const COLORS = {
  pageBg: "#EFE4D6",      // pale brown background
  cardBg: "#FBF6EF",      // near-white cream card
  fieldBg: "#F5EBDD",     // pale brown input/select fill
  border: "#DCC9B0",      // pale brown border
  maroon: "#6B1F2B",      // primary maroon
  maroonDark: "#4A1420",  // deep maroon (hover/text)
  maroonMid: "#7A2634",   // decorative circle
  textMuted: "#8B6F5C",   // muted brown label text
  textFaint: "#9C8570",   // faint footer text
  onMaroon: "#EFE4D6",    // text/icons on maroon
  onMaroonSoft: "#E4C9B5",// secondary text on maroon
  errorSoft: "#F3D7C8",   // error text on maroon
  placeholder: "#B8A88F", // input placeholder
};

const CURRENCIES = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "PKR", name: "Pakistani Rupee" },
  { code: "INR", name: "Indian Rupee" },
  { code: "AED", name: "UAE Dirham" },
  { code: "SAR", name: "Saudi Riyal" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "CHF", name: "Swiss Franc" },
];

export default function CurrencyConverter() {
  const [amount, setAmount] = useState("1");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("PKR");
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  // useEffect: fetch live exchange rate whenever the currency pair changes
  useEffect(() => {
    let cancelled = false;

    async function fetchRate() {
      setLoading(true);
      setError("");

      // Primary source: Frankfurter (ECB-backed, no key required)
      try {
        const res = await fetch(
          `https://api.frankfurter.app/latest?from=${fromCurrency}&to=${toCurrency}`
        );
        if (!res.ok) throw new Error(`Frankfurter responded ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setRate(data.rates[toCurrency]);
          setLastUpdated(data.date);
          setLoading(false);
        }
        return;
      } catch (primaryErr) {
        console.warn("Frankfurter fetch failed, trying fallback:", primaryErr);
      }

      // Fallback source: open.er-api.com (also free, no key required)
      try {
        const res = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`);
        if (!res.ok) throw new Error(`Fallback responded ${res.status}`);
        const data = await res.json();
        const fallbackRate = data.rates?.[toCurrency];
        if (!fallbackRate) throw new Error("Currency not found in fallback response");
        if (!cancelled) {
          setRate(fallbackRate);
          setLastUpdated(data.time_last_update_utc ?? null);
        }
      } catch (fallbackErr) {
        console.error("Both rate sources failed:", fallbackErr);
        if (!cancelled) {
          setError("Network blocked — check your internet/firewall access to the rate API.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (fromCurrency === toCurrency) {
      setRate(1);
      setLastUpdated(null);
      setLoading(false);
      setError("");
    } else {
      fetchRate();
    }

    return () => {
      cancelled = true;
    };
  }, [fromCurrency, toCurrency]);

  // useMemo: recompute the converted amount only when amount or rate changes,
  // not on every render (e.g. when loading spinner state toggles)
  const convertedAmount = useMemo(() => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || rate === null) return null;
    return (numericAmount * rate).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  }, [amount, rate]);

  const handleSwap = useCallback(() => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  }, [fromCurrency, toCurrency]);

  const handleAmountChange = (e) => {
    const val = e.target.value;
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      setAmount(val);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-6 font-sans"
      style={{ backgroundColor: COLORS.pageBg }}
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 justify-center">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center shadow-md"
            style={{ backgroundColor: COLORS.maroon }}
          >
            <Landmark className="w-5 h-5" strokeWidth={2} style={{ color: COLORS.onMaroon }} />
          </div>
          <div>
            <h1
              className="text-2xl font-serif font-bold tracking-tight"
              style={{ color: COLORS.maroonDark }}
            >
              Rate&nbsp;Keeper
            </h1>
            <p className="text-xs tracking-wide" style={{ color: COLORS.textMuted }}>
              live currency conversion
            </p>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl shadow-xl p-6 sm:p-8"
          style={{ backgroundColor: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}
        >
          {/* Amount input */}
          <label
            className="block text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: COLORS.textMuted }}
          >
            Amount
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0.00"
            className="w-full mb-5 px-4 py-3 rounded-xl text-lg font-semibold outline-none focus:ring-2 transition"
            style={{
              backgroundColor: COLORS.fieldBg,
              border: `1px solid ${COLORS.border}`,
              color: COLORS.maroonDark,
              "--tw-ring-color": COLORS.maroon,
            }}
          />

          {/* Currency selectors */}
          <div className="flex items-center gap-2">
            {/* From */}
            <div className="flex-1">
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: COLORS.textMuted }}
              >
                From
              </label>
              <div className="relative">
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-full appearance-none px-4 py-3 pr-9 rounded-xl font-medium outline-none focus:ring-2 transition cursor-pointer"
                  style={{
                    backgroundColor: COLORS.fieldBg,
                    border: `1px solid ${COLORS.border}`,
                    color: COLORS.maroonDark,
                    "--tw-ring-color": COLORS.maroon,
                  }}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  viewBox="0 0 20 20"
                  fill="none"
                  style={{ color: COLORS.maroon }}
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Swap button */}
            <button
              onClick={handleSwap}
              aria-label="Swap currencies"
              className="mt-6 shrink-0 w-10 h-10 rounded-full active:scale-95 flex items-center justify-center transition shadow-md"
              style={{ backgroundColor: COLORS.maroon }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.maroonDark)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.maroon)}
            >
              <ArrowRightLeft className="w-4 h-4" strokeWidth={2.25} style={{ color: COLORS.onMaroon }} />
            </button>

            {/* To */}
            <div className="flex-1">
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: COLORS.textMuted }}
              >
                To
              </label>
              <div className="relative">
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="w-full appearance-none px-4 py-3 pr-9 rounded-xl font-medium outline-none focus:ring-2 transition cursor-pointer"
                  style={{
                    backgroundColor: COLORS.fieldBg,
                    border: `1px solid ${COLORS.border}`,
                    color: COLORS.maroonDark,
                    "--tw-ring-color": COLORS.maroon,
                  }}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  viewBox="0 0 20 20"
                  fill="none"
                  style={{ color: COLORS.maroon }}
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Result */}
          <div
            className="mt-6 rounded-xl px-5 py-5 text-center relative overflow-hidden"
            style={{ backgroundColor: COLORS.maroon }}
          >
            <div
              className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-40"
              style={{ backgroundColor: COLORS.maroonMid }}
            />
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-2" style={{ color: COLORS.onMaroon }}>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium">Fetching live rate…</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center gap-2 py-2" style={{ color: COLORS.errorSoft }}>
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            ) : (
              <>
                <p
                  className="relative text-xs uppercase tracking-widest mb-1"
                  style={{ color: COLORS.onMaroonSoft }}
                >
                  {amount || "0"} {fromCurrency} equals
                </p>
                <p
                  className="relative text-3xl font-serif font-bold tracking-tight"
                  style={{ color: COLORS.cardBg }}
                >
                  {convertedAmount ?? "—"}{" "}
                  <span className="text-lg font-sans font-semibold" style={{ color: COLORS.onMaroonSoft }}>
                    {toCurrency}
                  </span>
                </p>
              </>
            )}
          </div>

          {/* Rate footer */}
          {!loading && !error && rate !== null && (
            <div
              className="mt-4 flex items-center justify-center gap-1.5 text-xs"
              style={{ color: COLORS.textMuted }}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>
                1 {fromCurrency} = {rate.toLocaleString(undefined, { maximumFractionDigits: 4 })} {toCurrency}
                {lastUpdated ? ` · ${lastUpdated}` : ""}
              </span>
            </div>
          )}
        </div>

        <p className="text-center text-xs mt-5" style={{ color: COLORS.textFaint }}>
          Rates via Frankfurter.app · updates on currency change
        </p>
      </div>
    </div>
  );
}