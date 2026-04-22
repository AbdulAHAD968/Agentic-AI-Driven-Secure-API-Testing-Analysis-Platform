"use client";

// This is now purely a pass-through component.
// The actual layout is handled at the Next.js global level by RootAdminLayout
// to prevent the DOM from unmounting and flickering on page transitions.
export default function AdminLayoutWrapper({ children }) {
  return <>{children}</>;
}
