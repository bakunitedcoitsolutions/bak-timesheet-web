/**
 * User Role Service Schemas (Client-Safe)
 * Zod schemas for frontend validation
 * This file contains ONLY schemas and types - no server-side imports
 */

import { z } from "zod";

// No input schema needed for listUserRoles (no parameters)

export type ListUserRolesInput = z.ZodVoid;
