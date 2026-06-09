import { createContext, useCallback, useContext, useState } from "react";
import { AddRentForm } from "./AddRentForm";

type Ctx = { open: (defaultArea?: string) => void };
const RentFormCtx = createContext<Ctx>({ open: () => {} });

export function useRentForm() { return useContext(RentFormCtx); }

export function RentFormProvider({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const [defaultArea, setDefaultArea] = useState<string | undefined>();
  const open = useCallback((a?: string) => { setDefaultArea(a); setShow(true); }, []);
  return (
    <RentFormCtx.Provider value={{ open }}>
      {children}
      <AddRentForm open={show} onClose={() => setShow(false)} defaultArea={defaultArea} />
    </RentFormCtx.Provider>
  );
}
