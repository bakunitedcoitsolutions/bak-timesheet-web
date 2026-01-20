import { PrimeReactProvider } from "primereact/api";
import { ToastProvider } from "@/context";
import SessionProvider from "./SessionProvider";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <PrimeReactProvider
        value={{
          unstyled: false,
        }}
      >
        <ToastProvider>{children}</ToastProvider>
      </PrimeReactProvider>
    </SessionProvider>
  );
};

export default Providers;
