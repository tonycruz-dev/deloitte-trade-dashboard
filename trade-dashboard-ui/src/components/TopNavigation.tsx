import { CircleHelp, Home, Search } from "lucide-react";

const primaryTabs = [
  "Goods Movement",
  "Ports",
  "Authorized Economic Operator",
  "Passenger Movement",
  "Clearance",
  "Customs Services",
  "Seizures",
  "Revenue",
  "Customer Experience",
];

const secondaryTabs = ["Import", "Export", "Transit", "International Trade"];

export default function TopNavigation() {
  return (
    <header className="glass-topnav mx-auto w-full max-w-[1600px] rounded-[2rem] px-4 py-4 sm:px-5 lg:px-6">
      <div className="relative flex flex-col gap-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="nav-icon-button" aria-label="Search">
              <Search className="h-4 w-4" />
            </button>
            <button type="button" className="nav-icon-button" aria-label="Help">
              <CircleHelp className="h-4 w-4" />
            </button>
            <button type="button" className="nav-icon-button px-3 text-[11px] font-semibold tracking-[0.24em]">
              EN
            </button>
            <button type="button" className="nav-icon-button" aria-label="Home">
              <Home className="h-4 w-4" />
            </button>
          </div>

          <div className="order-first xl:order-none xl:absolute xl:left-1/2 xl:top-0 xl:-translate-x-1/2">
            <div className="date-pill">
              1 January 2024 - 31 December 2024
            </div>
          </div>

          <div className="hidden xl:block xl:w-[220px]" />
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          {primaryTabs.map((tab, index) => (
            <button
              key={tab}
              type="button"
              className={
                index === 0
                  ? "primary-tab primary-tab-active"
                  : "primary-tab"
              }
            >
              {tab}
            </button>
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-2 border-t border-cyan-400/10 pt-3">
          {secondaryTabs.map((tab, index) => (
            <button
              key={tab}
              type="button"
              className={
                index === 0
                  ? "secondary-tab secondary-tab-active"
                  : "secondary-tab"
              }
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
