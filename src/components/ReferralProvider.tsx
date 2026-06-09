import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { makeReferralCode, type ReferralPersona } from "@/lib/referral";

type ReferralProfile = {
  name: string;
  phone: string;
  persona: ReferralPersona;
  code: string;
  area?: string;
};

type Ctx = {
  profile: ReferralProfile | null;
  setProfile: (p: Omit<ReferralProfile, "code"> & { code?: string }) => void;
  reset: () => void;
};

const C = createContext<Ctx | null>(null);
const KEY = "gharpayy.referral.profile.v1";

export function ReferralProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<ReferralProfile | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setProfileState(JSON.parse(raw));
    } catch {}
  }, []);

  const setProfile: Ctx["setProfile"] = (p) => {
    const full: ReferralProfile = { ...p, code: p.code || makeReferralCode(p.name) };
    setProfileState(full);
    try { localStorage.setItem(KEY, JSON.stringify(full)); } catch {}
  };

  const reset = () => {
    setProfileState(null);
    try { localStorage.removeItem(KEY); } catch {}
  };

  return <C.Provider value={{ profile, setProfile, reset }}>{children}</C.Provider>;
}

export function useReferral() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useReferral must be used inside ReferralProvider");
  return ctx;
}
