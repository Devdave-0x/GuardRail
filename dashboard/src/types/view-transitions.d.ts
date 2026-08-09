/* View Transitions API isn't in TS's bundled DOM lib yet. Minimal ambient shape for the
   subset ThemeToggle uses. */
interface ViewTransition {
  ready: Promise<void>;
  finished: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition: () => void;
}

interface Document {
  startViewTransition?: (callback: () => void | Promise<void>) => ViewTransition;
}
