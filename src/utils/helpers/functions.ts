export const devConsole = (...message: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(...message);
  }
};

export const devError = (...message: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.error(...message);
  }
};

export const devWarn = (...message: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.warn(...message);
  }
};

export const devInfo = (...message: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.info(...message);
  }
};
