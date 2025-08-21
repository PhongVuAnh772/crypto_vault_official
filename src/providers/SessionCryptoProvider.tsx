import { SessionCrypto } from "@tonconnect/protocol";
import React, { createContext, ReactNode, useMemo, useState } from "react";
interface AppContextType {
  sessionCrypto?: SessionCrypto;
  setSessionCrypto: (value: SessionCrypto) => void;
}
const defaultValue: AppContextType = {
  sessionCrypto: undefined,
  setSessionCrypto: () => {},
};
export const AppContext = createContext<AppContextType>(defaultValue);

export const SessionCryptoProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [sessionCrypto, setSessionCrypto] = useState<
    SessionCrypto | undefined
  >();
  const contextValue = useMemo(
    () => ({ sessionCrypto, setSessionCrypto }),
    [sessionCrypto]
  );
  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
