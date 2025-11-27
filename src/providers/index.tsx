import { PrimeReactProvider } from "primereact/api";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <PrimeReactProvider
      value={{
        unstyled: false,
      }}
    >
      {children}
    </PrimeReactProvider>
  );
};

export default Providers;
