declare global {
  interface Window {
    clarity?: {
      (...args: unknown[]): void;
      q?: unknown[][];
    };
  }
}

const clarityProjectId = import.meta.env.NEXT_PUBLIC_CLARITY_ID?.trim();
const clarityScriptId = "microsoft-clarity-script";

export function installClarity(): void {
  if (!clarityProjectId || typeof window === "undefined") {
    return;
  }

  if (window.clarity || document.getElementById(clarityScriptId)) {
    return;
  }

  window.clarity = function (...args: unknown[]) {
    window.clarity?.q?.push(args);
  };
  window.clarity.q = [];

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${clarityProjectId}`;
  script.id = clarityScriptId;

  const firstScript = document.getElementsByTagName("script")[0];

  if (firstScript?.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
    return;
  }

  document.head.appendChild(script);
}
