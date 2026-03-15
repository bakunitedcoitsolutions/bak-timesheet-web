// import { createServerAction, createServerActionProcedure } from "zsa";
// import { auth } from "@/lib/auth/auth";
// import { getUserActiveStatus, isSessionInvalid } from "@/lib/auth/security";

// const shapeError = ({ err }: { err: unknown }) => {
//   // Handle Error instances (most common case)
//   if (err instanceof Error) {
//     return err.message || "Something went wrong";
//   }

//   // Handle Prisma errors (they have a code and meta property)
//   if (err && typeof err === "object" && "code" in err && "meta" in err) {
//     const prismaError = err as {
//       code: string;
//       meta?: any;
//       message?: string;
//     };
//     // Prisma errors have a message property
//     return (
//       prismaError.message ||
//       `Database error: ${prismaError.code}` ||
//       "Something went wrong"
//     );
//   }

//   // Handle objects with message property
//   if (err && typeof err === "object" && "message" in err) {
//     const message = (err as { message?: unknown }).message;
//     if (message) {
//       return String(message);
//     }
//   }

//   // Handle string errors
//   if (typeof err === "string") {
//     return err;
//   }

//   // Fallback - try to stringify the error
//   try {
//     return String(err) || "Something went wrong";
//   } catch {
//     return "Something went wrong";
//   }
// };

// const baseProcedure = createServerActionProcedure().handler(async () => {
//   try {
//     const session = await auth();
//     if (session?.user?.id) {
//       const isActive = await getUserActiveStatus(session.user.id);
//       if (!isActive) {
//         throw new Error(
//           "Your account is inactive. Please contact your administrator."
//         );
//       }

//       const isInvalid = await isSessionInvalid(session.user.id);
//       if (isInvalid) {
//         throw new Error("Session invalidated. Please log in again.");
//       }
//     }
//     return { session };
//   } catch (error) {
//     throw error;
//   }
// });

// /**
//  * publicAction skips the global security check (getUserActiveStatus, isSessionInvalid).
//  * Use this for actions like logout that must work even if the session is technically invalid.
//  */
// export const publicAction = createServerAction().experimental_shapeError(
//   shapeError
// );

// /**
//  * serverAction includes a global security check for inactive users or invalidated sessions.
//  */
// export const serverAction = baseProcedure
//   .createServerAction()
//   .experimental_shapeError(shapeError);
import { createServerAction } from "zsa";

export const serverAction = createServerAction().experimental_shapeError(
  (error) => {
    const err = error.err;

    // Handle Error instances (most common case)
    if (err instanceof Error) {
      return err.message || "Something went wrong";
    }

    // Handle Prisma errors (they have a code and meta property)
    if (err && typeof err === "object" && "code" in err && "meta" in err) {
      const prismaError = err as {
        code: string;
        meta?: any;
        message?: string;
      };
      // Prisma errors have a message property
      return (
        prismaError.message ||
        `Database error: ${prismaError.code}` ||
        "Something went wrong"
      );
    }

    // Handle objects with message property
    if (err && typeof err === "object" && "message" in err) {
      const message = (err as { message?: unknown }).message;
      if (message) {
        return String(message);
      }
    }

    // Handle string errors
    if (typeof err === "string") {
      return err;
    }

    // Fallback - try to stringify the error
    try {
      return String(err) || "Something went wrong";
    } catch {
      return "Something went wrong";
    }
  }
);
