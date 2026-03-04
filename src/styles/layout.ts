export const layout = {
  page: "min-h-screen bg-branco",
  container: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
  grid: {
    books: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4",
    chapters: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4",
    pericopes: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4",
  },
  sidebar: "w-64 flex-shrink-0 border-r border-areia/30 bg-surface",
  main: "flex-1 overflow-y-auto",
} as const;
