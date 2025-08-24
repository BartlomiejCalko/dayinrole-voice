"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Simple cookie helpers scoped to consent cookie
const CONSENT_COOKIE_NAME = "cookie_consent";
const CONSENT_VERSION = "1.0";

type ConsentState = {
  necessary: boolean;
  analytics: boolean;
  version: string;
  timestamp: string;
};

const getConsentCookie = (): ConsentState | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + CONSENT_COOKIE_NAME + "=([^;]+)"));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[2]));
  } catch {
    return null;
  }
};

const setConsentCookie = (consent: ConsentState) => {
  if (typeof document === "undefined") return;
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(consent))}; Path=/; Max-Age=${oneYear}; SameSite=Lax`;
};

const CookieConsent = () => {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const manageToastIdRef = useRef<string | number | null>(null);

  const saveConsent = useCallback((partial: Partial<ConsentState>) => {
    const next: ConsentState = {
      necessary: true,
      analytics: false,
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      ...(getConsentCookie() || {} as ConsentState),
      ...partial,
    } as ConsentState;
    setConsentCookie(next);
    setHasConsent(true);
  }, []);

  const showInitialToast = useCallback(() => {
    toast.dismiss();
    toast(
      "We use cookies",
      {
        description: (
          <div className="text-foreground/80">
            We use essential cookies to run our service and optional analytics cookies to improve it. Read our
            {" "}
            <a href="/cookies" className="text-primary underline">Cookie Policy</a>.
          </div>
        ),
        duration: Infinity,
        action: {
          label: "Accept all",
          onClick: () => saveConsent({ necessary: true, analytics: true, version: CONSENT_VERSION, timestamp: new Date().toISOString() }),
        },
        cancel: {
          label: "Reject non‑essential",
          onClick: () => saveConsent({ necessary: true, analytics: false, version: CONSENT_VERSION, timestamp: new Date().toISOString() }),
        },
      }
    );

    // Secondary manage button
    const id = toast.custom((t) => (
      <div className="rounded-lg border bg-card text-card-foreground p-4 shadow-sm">
        <p className="text-sm mb-3">Want to choose? Manage your preferences.</p>
        <div className="flex gap-2">
          <button
            className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-primary-foreground text-sm hover:opacity-90"
            onClick={() => {
              toast.dismiss(t);
              openManagePreferences();
            }}
            aria-label="Open cookie preferences"
          >
            Manage preferences
          </button>
          <button
            className="inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
            onClick={() => toast.dismiss(t)}
            aria-label="Close"
          >
            Close
          </button>
        </div>
      </div>
    ), { duration: Infinity });

    manageToastIdRef.current = id as any;
  }, [saveConsent]);

  const openManagePreferences = useCallback(() => {
    // Close any existing manage toast
    if (manageToastIdRef.current) {
      toast.dismiss(manageToastIdRef.current);
      manageToastIdRef.current = null;
    }

    const current = getConsentCookie() || { necessary: true, analytics: false } as ConsentState;
    let analyticsChecked = !!current.analytics;

    const id = toast.custom((t) => (
      <div className="rounded-lg border bg-card text-card-foreground p-4 shadow-sm w-[360px]">
        <p className="font-medium mb-2">Cookie preferences</p>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <input type="checkbox" checked readOnly aria-readonly aria-label="Necessary cookies" className="mt-1" />
            <div>
              <p className="text-sm font-medium">Necessary</p>
              <p className="text-xs text-muted-foreground">Required for the site to function (always on).</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              defaultChecked={analyticsChecked}
              aria-label="Analytics cookies"
              className="mt-1"
              onChange={(e) => { analyticsChecked = e.currentTarget.checked; }}
            />
            <div>
              <p className="text-sm font-medium">Analytics</p>
              <p className="text-xs text-muted-foreground">Help us improve the service. Set only with your consent.</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-primary-foreground text-sm hover:opacity-90"
            onClick={() => {
              saveConsent({ necessary: true, analytics: analyticsChecked, version: CONSENT_VERSION, timestamp: new Date().toISOString() });
              toast.dismiss(t);
              toast.success("Preferences saved");
            }}
            aria-label="Save cookie preferences"
          >
            Save
          </button>
          <button
            className="inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
            onClick={() => toast.dismiss(t)}
            aria-label="Cancel"
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: Infinity });

    manageToastIdRef.current = id as any;
  }, [saveConsent]);

  useEffect(() => {
    const existing = getConsentCookie();
    if (existing && existing.version === CONSENT_VERSION) {
      setHasConsent(true);
    } else {
      setHasConsent(false);
      showInitialToast();
    }

    const handler = () => openManagePreferences();
    window.addEventListener("open-cookie-settings", handler);
    return () => window.removeEventListener("open-cookie-settings", handler);
  }, [showInitialToast, openManagePreferences]);

  return null;
};

export default CookieConsent; 