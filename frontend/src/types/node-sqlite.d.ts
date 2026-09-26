// Minimal ambient types for node:sqlite (built into Node >= 22.5).
// @types/node@20 does not ship these yet; the project's tsconfig targets
// ESNext + bundler resolution, so these declarations keep `typecheck` happy
// without installing a newer @types/node or a native addon (no network access).
declare module "node:sqlite" {
  export interface StatementSync {
    get(...params: unknown[]): Record<string, unknown> | undefined;
    all(...params: unknown[]): Array<Record<string, unknown>>;
    run(...params: unknown[]): { changes: number | bigint; lastInsertRowid: number | bigint };
  }

  export class DatabaseSync {
    constructor(
      path: string,
      options?: { readOnly?: boolean; timeout?: number; open?: boolean } | undefined,
    );
    readonly isOpen: boolean;
    close(): void;
    prepare(sql: string): StatementSync;
    exec(sql: string): void;
  }
}