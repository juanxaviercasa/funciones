import { it, expect, vi } from "vitest";
import { synchronizeProgress } from "../src/sync/protocol";
import { DEFAULT_PROGRESS } from "../src/persistence";
import { awardOnce } from "../src/learning";
it("reintenta conflictos con la revisión vigente sin duplicar recompensas", async () => {
  const local = awardOnce(DEFAULT_PROGRESS, "local", 20, 1000);
  const read = vi
    .fn()
    .mockResolvedValueOnce(null)
    .mockResolvedValue({
      payload: awardOnce(DEFAULT_PROGRESS, "remote", 40, 2000),
      revision: 1,
    });
  const save = vi.fn().mockResolvedValueOnce(false).mockResolvedValue(true);
  const merged = await synchronizeProgress(local, read, save);
  expect(merged.xp).toBe(60);
  expect(save.mock.calls[1][0]).toBe(1);
});
it("rechaza copias remotas corruptas y no escribe", async () => {
  const save = vi.fn();
  await expect(
    synchronizeProgress(
      DEFAULT_PROGRESS,
      async () => ({ payload: { xp: -1 }, revision: 2 }),
      save,
    ),
  ).rejects.toThrow();
  expect(save).not.toHaveBeenCalled();
});
it("limita los reintentos y comunica fallos de conexión", async () => {
  const save = vi.fn().mockResolvedValue(false);
  await expect(
    synchronizeProgress(DEFAULT_PROGRESS, async () => null, save),
  ).rejects.toThrow("Otro dispositivo");
  expect(save).toHaveBeenCalledTimes(3);
  await expect(
    synchronizeProgress(
      DEFAULT_PROGRESS,
      async () => {
        throw Error("Sin conexión");
      },
      save,
    ),
  ).rejects.toThrow("Sin conexión");
});
