import { progressSchema } from "../schemas";
import { normalizeProgress, type Progress } from "../persistence";
import { mergeProgress } from "./merge";
type Snapshot = { payload: unknown; revision: number } | null;
export async function synchronizeProgress(
  local: Progress,
  read: () => Promise<Snapshot>,
  compareAndSave: (revision: number, progress: Progress) => Promise<boolean>,
): Promise<Progress> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const remote = await read();
    const merged = remote
      ? mergeProgress(local, progressSchema.parse(remote.payload))
      : normalizeProgress(local);
    if (await compareAndSave(remote?.revision ?? 0, merged)) return merged;
  }
  throw new Error(
    "Otro dispositivo modificó los datos. Intenta sincronizar otra vez.",
  );
}
