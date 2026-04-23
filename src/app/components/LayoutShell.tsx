"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import HomeMasthead from "./HomeMasthead";

// Client wrapper so we can hide the header/footer/masthead on the
// Decap admin route — Decap takes over the page and our chrome
// would interfere with its UI.
export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  // Only the Decap CMS admin route bypasses the site chrome. Do NOT
  // match /admin-portal (Springly stub) which needs the normal nav.
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <HomeMasthead />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
