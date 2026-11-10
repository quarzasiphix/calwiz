/**
 * Non-intrusive install guidance, shown only on the settings page.
 * Chromium: uses the deferred `beforeinstallprompt` event.
 * iOS Safari: no API exists, so we explain Share → Add to Home Screen.
 */
import { useEffect, useState } from "react";
import { Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
  });
}

export function isStandalone(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function InstallHelp() {
  const [canPrompt, setCanPrompt] = useState(Boolean(deferred));
  const [installed, setInstalled] = useState(isStandalone());
  useEffect(() => {
    const onPrompt = () => setTimeout(() => setCanPrompt(Boolean(deferred)), 0);
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return <p className="text-sm text-muted">Calwiz is installed on this device and works offline.</p>;
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return (
    <div className="text-sm text-muted">
      <p>Install Calwiz to open it from your home screen, full-screen and offline. It's the same private app — nothing extra is downloaded or tracked.</p>
      {canPrompt ? (
        <button
          className="btn-solid mt-3"
          onClick={async () => {
            await deferred?.prompt();
            const choice = await deferred?.userChoice;
            deferred = null;
            setCanPrompt(false);
            if (choice?.outcome === "accepted") setInstalled(true);
          }}
        >
          <Download size={16} aria-hidden /> Install Calwiz
        </button>
      ) : ios ? (
        <p className="mt-2">
          On iPhone or iPad: open in Safari, tap <strong className="text-ink">Share</strong>, then <strong className="text-ink">Add to Home Screen</strong>.
        </p>
      ) : (
        <p className="mt-2">Use your browser menu's “Install app” or “Add to Home screen” option.</p>
      )}
    </div>
  );
}
