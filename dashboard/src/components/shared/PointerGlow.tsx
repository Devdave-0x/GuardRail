'use client';

import { usePointerGlow } from '@/hooks';

/*
  Mounts the single delegated pointermove listener that feeds every .edge-glow element.
  Renders nothing.

  It exists as a component so a server layout can opt in without becoming a client
  component itself. Mount once per route group.
*/
export function PointerGlow(): null {
  usePointerGlow();
  return null;
}
