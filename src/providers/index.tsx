import { PrimeReactProvider } from "primereact/api";

import { ToastProvider } from "@/context";
import { ReactQueryProvider } from "@/lib";
import SessionProvider from "./SessionProvider";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <ReactQueryProvider>
        <PrimeReactProvider
          value={{
            unstyled: false,
          }}
        >
          <ToastProvider>{children}</ToastProvider>
        </PrimeReactProvider>
      </ReactQueryProvider>
    </SessionProvider>
  );
};

export default Providers;
