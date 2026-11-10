/**
 * Service-worker lifecycle UI.
 *
 * Update strategy: `registerType: "prompt"`. A new version installs in the
 * background but does not take control until the user taps "Reload", so a
 * running tab never mixes chunks from two builds. The page also checks for
 * updates hourly and whenever it becomes visible again.
 */
import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { RefreshCw, X } from "lucide-react";

export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, reg) {
      if (!reg) return;
      const check = () => {
        if (document.visibilityState === "visible" && navigator.onLine) reg.update().catch(() => undefined);
      };
      setInterval(check, 60 * 60 * 1000);
      document.addEventListener("visibilitychange", check);
    },
  });

  useEffect(() => {
    if (!offlineReady) return;
    const t = setTimeout(() => setOfflineReady(false), 5000);
    return () => clearTimeout(t);
  }, [offlineReady, setOfflineReady]);

  if (!needRefresh && !offlineReady) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-line bg-raised px-4 py-3 text-sm shadow-2xl lg:bottom-6"
    >
      <span className="flex-1">{needRefresh ? "A new version of Calwiz is ready." : "Calwiz is ready to work offline."}</span>
      {needRefresh && (
        <button className="btn-solid min-h-[36px] px-3" onClick={() => updateServiceWorker(true)}>
          <RefreshCw size={14} aria-hidden /> Reload
        </button>
      )}
      <button
        className="icon-btn h-9 w-9"
        aria-label="Dismiss"
        onClick={() => {
          setNeedRefresh(false);
          setOfflineReady(false);
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
