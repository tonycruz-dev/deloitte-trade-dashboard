import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import DashboardPage from "./pages/DashboardPage";

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const language = i18n.resolvedLanguage ?? "en";
    const isRtl = language === "ar";

    document.documentElement.lang = language;
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
  }, [i18n.resolvedLanguage]);

  return <DashboardPage />;
}

export default App;
