import { createContext, useContext, useEffect, useState, ReactNode } from "react";

const STORAGE_KEY = "anuttama.selectedCenterId";

interface CenterContextValue {
  centerId: string; // "all" or a property id
  setCenterId: (id: string) => void;
}

const CenterContext = createContext<CenterContextValue | undefined>(undefined);

export const CenterProvider = ({ children }: { children: ReactNode }) => {
  const [centerId, setCenterIdState] = useState<string>(() => {
    if (typeof window === "undefined") return "all";
    return localStorage.getItem(STORAGE_KEY) || "all";
  });

  const setCenterId = (id: string) => {
    setCenterIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    // keep state in sync if changed in another tab
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) setCenterIdState(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <CenterContext.Provider value={{ centerId, setCenterId }}>
      {children}
    </CenterContext.Provider>
  );
};

export const useCenter = () => {
  const ctx = useContext(CenterContext);
  if (!ctx) throw new Error("useCenter must be used within CenterProvider");
  return ctx;
};
