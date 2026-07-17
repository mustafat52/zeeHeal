import { redirect } from "next/navigation";

/**
 * Root route. Its only job is to send the bare domain straight to
 * /login — there is no "home page" content of its own. Client and
 * nutritionist routes both live under their own route groups
 * ((client), (nutritionist)), which is what a real Next.js route group
 * requires: a route group alone never resolves "/" on its own, only an
 * actual app/page.tsx like this one can.
 */
export default function RootPage() {
  redirect("/login");
}