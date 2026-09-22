import "@tanstack/react-query";

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      /** When true, MutationCache skips the global error toast. */
      skipGlobalErrorToast?: boolean;
    };
  }
}
