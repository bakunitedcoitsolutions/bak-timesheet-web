import { PrimeReactProvider } from "primereact/api";
import { ToastProvider } from "@/context";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <PrimeReactProvider
      value={{
        unstyled: false,
      }}
    >
      <ToastProvider>{children}</ToastProvider>
    </PrimeReactProvider>
  );
};

export default Providers;
