import { createContext, useContext } from "react";

const LayoutContext = createContext(false);

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => (
  <LayoutContext.Provider value={true}>{children}</LayoutContext.Provider>
);

export const useHasExternalLayout = () => useContext(LayoutContext);
