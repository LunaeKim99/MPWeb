import type { Track } from "@/domain/entities/Track.ts";
import type { TrackRecord } from "@/infrastructure/persistence/dexie/records.ts";

export const TrackMapper = {
  toDomain(record: TrackRecord): Track {
    return { ...record };
  },
  toRecord(entity: Track): TrackRecord {
    return { ...entity };
  },
};
