import { useTranslation } from "react-i18next";
import FilterDropdown, {
  type FilterDropdownOption,
} from "./FilterDropdown";
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
  countryOptions: FilterDropdownOption[];
  tradeTypeOptions: FilterDropdownOption[];
  periodOptions: FilterDropdownOption[];
};

export default function BottomCountriesPanel({
  periodLabel,
  selectedCountry,
  selectedTradeType,
  selectedPeriod,
  onCountryChange,
  onTradeTypeChange,
  onPeriodChange,
  countries,
  countryOptions,
  tradeTypeOptions,
  periodOptions,
}: BottomCountriesPanelProps) {
  const { t } = useTranslation();

  const declarationLabel =
    selectedTradeType === "Import"
      ? t("dashboard.totalImportCustomsDeclarations")
      : selectedTradeType === "Export"
        ? t("dashboard.totalExportCustomsDeclarations")
        : selectedTradeType === "Transit"
          ? t("dashboard.totalTransitCustomsDeclarations")
          : t("dashboard.totalCustomsDeclarations");

  return (
    <section className="glass-bottom-panel relative mx-auto w-full max-w-400 overflow-visible rounded-[1.65rem] px-4 py-3 sm:px-5 lg:px-6">
      <div className="relative flex flex-col gap-3 overflow-visible">
        <div className="relative z-170 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2.5 text-sm">
            <div className="rounded-full border border-cyan-400/14 bg-slate-950/18 px-3.5 py-1.5 text-cyan-100/90 backdrop-blur-md">
              <span className="mr-2 text-[10px] uppercase tracking-[0.28em] text-cyan-300/70">
                {t("dashboard.category")}
              </span>
              <span className="font-medium text-white">{declarationLabel}</span>
            </div>

            <div className="rounded-full border border-cyan-400/10 bg-slate-950/14 px-3.5 py-1.5 text-slate-200 backdrop-blur-md">
              <span className="mr-2 text-[10px] uppercase tracking-[0.28em] text-cyan-300/70">
                {t("dashboard.ranking")}
              </span>
              <span className="font-medium text-white">
                {t("dashboard.top5Countries")}
              </span>
            </div>

            <div className="rounded-full border border-cyan-400/10 bg-slate-950/14 px-3.5 py-1.5 text-sm text-slate-300 backdrop-blur-md">
              <span className="text-[10px] uppercase tracking-[0.28em] text-cyan-300/70">
                {t("dashboard.period")}
              </span>
              <span className="ml-2 font-medium text-white">{periodLabel}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <FilterDropdown
              label={t("dashboard.country")}
              value={selectedCountry}
              onChange={onCountryChange}
              options={countryOptions}
            />

            <FilterDropdown
              label={t("dashboard.tradeType")}
              value={selectedTradeType}
              onChange={onTradeTypeChange}
              options={tradeTypeOptions}
            />

            <FilterDropdown
              label={t("dashboard.period")}
              value={selectedPeriod}
              onChange={onPeriodChange}
              options={periodOptions}
            />
          </div>
        </div>

        <div className="country-row relative z-0 mt-1 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
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
