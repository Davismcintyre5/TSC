import { createContext, useContext, useState, useCallback } from "react";

const PaymentContext = createContext(null);

export function PaymentProvider({ children }) {
  const [hold, setHold] = useState(null);
  const [method, setMethod] = useState(null);
  const [reference, setReference] = useState(null);

  const reset = useCallback(() => {
    setHold(null);
    setMethod(null);
    setReference(null);
  }, []);

  return (
    <PaymentContext.Provider
      value={{ hold, setHold, method, setMethod, reference, setReference, reset }}
    >
      {children}
    </PaymentContext.Provider>
  );
}

export const usePayment = () => useContext(PaymentContext);