"use client";

import { usePathname } from "next/navigation";
import RootAdminLayout from "./RootAdminLayout";

export default function RootLayoutWrapper({ children }) {
  const pathname = usePathname();
  
  if (pathname === "/login" || pathname === "/") {
    return <>{children}</>;
  }

  return <RootAdminLayout>{children}</RootAdminLayout>;
}
