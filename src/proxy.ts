/**
 * Next.js 16 Middleware
 * Handles authentication and authorization for protected routes
 * Uses Next.js 16 middleware patterns with NextAuth v5
 *
 * Note: Make sure next-auth is installed: npm install next-auth
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getUserActiveStatus } from "@/lib/auth/security";
import { prisma } from "./lib";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/login",
    "/api/auth",
    "/_next",
    "/favicon.ico",
    "/assets",
  ];
  return NextResponse.next();

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get token from NextAuth v5
  const tokenResult = await getToken({
    req: request,
    secret: process.env.NEXT_AUTH_SECRET,
    salt: "authjs.session-token", // Required for NextAuth v5
  });

  // Redirect to login if not authenticated
  if (!tokenResult || !tokenResult?.id) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // At this point, we know token exists and has an id (checked above)
  // Type assertion is safe because we've verified tokenResult and tokenResult.id exist
  const userId = tokenResult?.id as number;

  // Check if user is active using Redis cache (fast check)
  // This ensures inactive users are immediately blocked even if they have a valid token
  // Uses Upstash Redis for fast lookups without hitting the database on every request
  const isActive = await getUserActiveStatus(userId);

  if (!isActive) {
    // User has been deactivated - force logout
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "AccountInactive");
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control will be handled elsewhere
  // For now, just ensure user is authenticated and active
  // TODO: Add role/permission checks as needed

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - static assets
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

// const empCodes = [
//   90001, 90002, 90004, 90005, 90006, 90010, 90012, 90013, 90014, 90015, 90017,
//   90019, 90021, 90022, 90023, 90025, 90027, 90028, 90030, 90031, 90032, 90033,
//   90034, 90035, 90036, 90037, 90038, 90039, 90040, 90041, 90043, 90046, 90047,
//   90048, 90050, 90053, 90054, 90055, 90058, 90059, 90060, 90061, 90062, 90063,
//   90064, 90065, 90066, 90067, 90068, 90069, 90070, 90071, 90072, 90073, 90074,
//   90075, 90076, 90077, 90078, 90079, 90080, 90081, 90082, 90083, 90084, 90085,
//   90086, 90087, 90088, 90089, 90090, 90091, 90092, 90093, 90094, 90095, 90096,
//   90097, 90098, 90099, 90100, 90101, 90102, 90103, 90104, 90105, 90106, 90107,
//   90108, 90109, 90110, 90111, 90112, 90113, 90114, 90115, 90116, 90117, 90118,
//   90119, 90120, 90121, 90122, 90123, 90124, 90125, 90126, 90127, 90128, 90129,
//   90130, 90131, 90132, 90133, 90134, 90135, 90136, 90137, 90138, 90139, 90140,
//   90141, 90142, 90143, 90144, 90145, 90146, 90148, 90149, 90150, 90151, 90153,
//   90154, 90155, 90156, 90157, 90158, 90159, 90160, 90161, 90162, 90163, 90164,
//   90165, 90166, 90168, 90169, 90170, 90171, 90172, 90173, 90174, 90175, 90177,
//   90178, 90179, 90180, 90181, 90182, 90183, 90184, 90186, 90187, 90188, 90189,
//   90190, 90191, 90192, 90193, 90194, 90195, 90196, 90198, 90199, 90201, 90202,
//   90203, 90204, 90205, 90206, 90207, 90209, 90210, 90211, 90212, 90213, 90215,
//   90216, 90217, 90218, 90219, 90220, 90222, 90223, 90224, 90225, 90226, 90227,
//   90228, 90229, 90230, 90231, 90232, 90233, 90234, 90235, 90236, 90237, 90239,
//   90240, 90241, 90242, 90243, 90244, 90245, 90246, 90247, 90248, 90249, 90250,
//   90251, 90252, 90253, 90254, 90255, 90256, 90257, 90258, 90259, 90260, 90261,
//   90262, 90263, 90264, 90265, 90266, 90267, 90268, 90269, 90270, 90271, 90272,
//   90273, 90274, 90275, 90276, 90277, 90279, 90281, 90282, 90284, 90285, 90286,
//   90287, 90289, 90290, 90291, 90292, 90293, 90294, 90295, 90296, 90297, 90299,
//   90300, 90301, 90302, 90303, 90304, 90305, 90306, 90307, 90308, 90309, 90310,
//   90311, 90312, 90313, 90314, 90315, 90316, 90317, 90318, 90319, 90320, 90321,
//   90322, 90323, 90324, 90325, 90326, 90327, 90329, 90331, 90332, 90333, 90334,
//   90335, 90336, 90337, 90338, 90339, 90340, 90341, 90342, 90343, 90344, 90345,
//   90346, 90347, 90348, 90349, 90350, 90351, 90352, 90353, 90354, 90355, 90357,
//   90359, 90361, 90363, 90364, 90365, 90366, 90367, 90370, 90371, 90372, 90373,
//   90375, 90376, 90377, 90379, 90380, 90382, 90383, 90385, 90386, 90387, 90388,
//   90389, 90390, 90391, 90392, 90393, 90394, 90395, 90397, 90398, 90399, 90400,
//   90401, 90402, 90403, 90404, 90405, 90407, 90408, 90409, 90410, 90411, 90412,
//   90413, 90414, 90415, 90416, 90417, 90418, 90419, 90420, 90421, 90422, 90423,
//   90424, 90425, 90426, 90427, 90428, 90429, 90430, 90431, 90432, 90433, 90434,
//   90435, 90436, 90437, 90438, 90439, 90440, 90441, 90442, 90444, 90445, 90446,
//   90447, 90448, 90449, 90450, 90451, 90452, 90454, 90456, 90457, 90458, 90459,
//   90460, 90461, 90462, 90463, 90464, 90465, 90466, 90468, 90469, 90470, 90471,
//   90472, 90473, 90474, 90475, 90476, 90477, 90478, 90480, 90481, 90482, 90483,
//   90484, 90485, 90486, 90487, 90489, 90490, 90491, 90492, 90493, 90495, 90497,
//   90500, 90501, 90502, 90503, 90504, 90505, 90508, 90509, 90511, 90513, 90514,
//   90515, 90516, 90517, 90520, 90522, 90523, 90526, 90527, 90528, 90529, 90530,
//   90531, 90532, 90534, 90535, 90536, 90537, 90539, 90540, 90541, 90542, 90543,
//   90544, 90545, 90546, 90547, 90548, 90549, 90550, 90552, 90556, 90557, 90559,
//   90560, 90562, 90563, 90565, 90566, 90567, 90570, 90572, 90573, 90576, 90579,
//   90580, 90581, 90582, 90583, 90585, 90586, 90587, 90589, 90590, 90591, 90592,
//   90593, 90594, 90597, 90598, 90599, 90600, 90601, 90602, 90605, 90606, 90607,
//   90608, 90617, 90620, 90621, 90623, 90624, 90625, 90630, 90631, 90637, 90640,
//   90644, 90647, 90649, 90659, 90736, 90678, 90679, 90680, 90681, 90668, 90669,
//   90658, 90632, 90604,
// ];

// async function updateEmployeeStatus() {
//   const result = await prisma.employee.updateMany({
//     where: {
//       employeeCode: {
//         in: empCodes,
//       },
//     },
//     data: {
//       statusId: 7,
//     },
//   });
//   console.log(`Updated ${result.count} employees.`);
// }
// updateEmployeeStatus();
