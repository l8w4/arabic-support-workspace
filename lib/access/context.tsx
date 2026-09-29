"use client";

import { createContext, useContext } from "react";

// Whether the signed-in profile is admin/teacher (can write) vs viewer
// (read-only). Set once in Shell from the server-loaded profile, so every
// client component can hide write controls without re-fetching the profile.
// This is a UX convenience only — RLS (can_edit() in Postgres) is the real
// security boundary and blocks writes regardless of what the UI shows.
const CanEditContext = createContext(false);

export function useCanEdit() {
  return useContext(CanEditContext);
}

export function AccessProvider({ canEdit, children }: { canEdit: boolean; children: React.ReactNode }) {
  return <CanEditContext.Provider value={canEdit}>{children}</CanEditContext.Provider>;
}
