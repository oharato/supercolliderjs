import { vi } from "vitest";

(globalThis as any).jest = vi;
(globalThis as any).spyOn = vi.spyOn;