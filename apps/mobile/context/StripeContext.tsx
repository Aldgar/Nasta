import React, { createContext, useContext } from "react";

interface StripeAvailability {
  isStripeReady: boolean;
}

const StripeAvailabilityContext = createContext<StripeAvailability>({
  isStripeReady: false,
});

export function StripeAvailabilityProvider({
  isReady,
  children,
}: {
  isReady: boolean;
  children: React.ReactNode;
}) {
  return (
    <StripeAvailabilityContext.Provider value={{ isStripeReady: isReady }}>
      {children}
    </StripeAvailabilityContext.Provider>
  );
}

export function useStripeAvailability() {
  return useContext(StripeAvailabilityContext);
}
