import type { CountryMetricDto } from "../types/dashboard";

type BottomCountriesPanelProps = {
  periodLabel: string;
  selectedCountry: string;
  selectedTradeType: string;
  selectedPeriod: string;
  onCountryChange: (value: string) => void;
  onTradeTypeChange: (value: string) => void;
  onPeriodChange: (value: string) => void;
  countries: CountryMetricDto[];
};

function SmallSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="glass-pill flex min-w-[140px] items-center gap-2.5 pr-3 text-left">
      <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.26em] text-cyan-200/70">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-transparent text-xs font-medium text-white outline-none sm:text-sm"
      >
        {children}
      </select>
    </label>
  );
}

export default function BottomCountriesPanel({
  periodLabel,
  selectedCountry,
  selectedTradeType,
  selectedPeriod,
  onCountryChange,
  onTradeTypeChange,
  onPeriodChange,
  countries,
}: BottomCountriesPanelProps) {
  const declarationLabel =
    selectedTradeType === "Import"
      ? "Total Import Customs Declarations"
      : selectedTradeType === "Export"
        ? "Total Export Customs Declarations"
        : selectedTradeType === "Transit"
          ? "Total Transit Customs Declarations"
          : "Total Customs Declarations";

  return (
    <section className="glass-bottom-panel mx-auto w-full max-w-[1600px] rounded-[1.65rem] px-4 py-3 sm:px-5 lg:px-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2.5 text-sm">
            <div className="rounded-full border border-cyan-400/14 bg-slate-950/18 px-3.5 py-1.5 text-cyan-100/90 backdrop-blur-md">
              <span className="mr-2 text-[10px] uppercase tracking-[0.28em] text-cyan-300/70">
                Category
              </span>
              <span className="font-medium text-white">{declarationLabel}</span>
            </div>

            <div className="rounded-full border border-cyan-400/10 bg-slate-950/14 px-3.5 py-1.5 text-slate-200 backdrop-blur-md">
              <span className="mr-2 text-[10px] uppercase tracking-[0.28em] text-cyan-300/70">
                Ranking
              </span>
              <span className="font-medium text-white">Top 5 Countries</span>
            </div>

            <div className="rounded-full border border-cyan-400/10 bg-slate-950/14 px-3.5 py-1.5 text-sm text-slate-300 backdrop-blur-md">
              <span className="text-[10px] uppercase tracking-[0.28em] text-cyan-300/70">
                Period
              </span>
              <span className="ml-2 font-medium text-white">{periodLabel}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <SmallSelect
              label="Country"
              value={selectedCountry}
              onChange={onCountryChange}
            >
              <option value="All">All Countries</option>
              <option value="China">China</option>
              <option value="India">India</option>
              <option value="Turkey">Turkey</option>
              <option value="Germany">Germany</option>
              <option value="England">England</option>
            </SmallSelect>

            <SmallSelect
              label="Trade Type"
              value={selectedTradeType}
              onChange={onTradeTypeChange}
            >
              <option value="All">All</option>
              <option value="Import">Import</option>
              <option value="Export">Export</option>
              <option value="Transit">Transit</option>
            </SmallSelect>

            <SmallSelect
              label="Period"
              value={selectedPeriod}
              onChange={onPeriodChange}
            >
              <option value="2024-03">March 2024</option>
              <option value="2024-02">February 2024</option>
              <option value="2024-01">January 2024</option>
            </SmallSelect>
          </div>
        </div>

        <div className="country-row mt-1 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {countries.slice(0, 5).map((country, index) => (
            <div key={country.country} className="country-row-item">
              <div className="country-row-head">
                <span className="country-rank">
                  {(index + 1).toString().padStart(2, "0")}
                </span>
                <span className="country-name">{country.country}</span>
              </div>
              <span className="country-value">
                {country.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
