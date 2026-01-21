import { isAxiosError } from "axios";
import { createServerAction } from "zsa";

export const serverAction = createServerAction().experimental_shapeError(
  (error) => {
    if (isAxiosError(error.err)) {
      return (
        error.err?.response?.data?.message ||
        error.err?.message ||
        "Something went wrong"
      );
    }
    return "CONTEXT: SERVER ACTION Something went wrong";
  }
);
