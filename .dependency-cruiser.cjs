// Architecture / dependency rule (Uncle Bob): no cycles + layers respected +
// forbidden cross-layer imports. Discovered layering (acyclic except one
// baselined edge): (root) -> components/pages -> components/{layout,common}
// -> components/ui -> leaves (utils/types/constants/styles/i18n); data tier
// stores->services, contexts, hooks. See obt/.claude/quality-gates-plan.md.

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      comment: "No circular dependencies (the dependency graph must be acyclic).",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "leaves-no-upward-imports",
      comment: "Leaf modules (utils/types/constants/styles/i18n) must not import app layers.",
      severity: "error",
      from: { path: "^src/(utils|types|constants|styles|i18n)/" },
      to: { path: "^src/(components|services|stores|contexts|hooks)/" },
    },
    {
      name: "data-tier-not-import-components",
      comment: "services/stores must not import UI components.",
      severity: "error",
      from: { path: "^src/(services|stores)/" },
      to: { path: "^src/components/" },
    },
    {
      name: "ui-primitives-no-upward-imports",
      comment: "components/ui (primitives) must not import higher layers (utils is allowed for cn).",
      severity: "error",
      from: { path: "^src/components/ui/" },
      to: {
        path: "^src/(components/pages|components/layout|components/common|services|stores|contexts|hooks)/",
      },
    },
    {
      name: "layout-not-import-pages",
      comment: "components/layout must not import components/pages (AppShell auth guard is baselined).",
      severity: "error",
      from: { path: "^src/components/layout/" },
      to: { path: "^src/components/pages/" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsConfig: { fileName: "tsconfig.app.json" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default", "types"],
    },
  },
};
