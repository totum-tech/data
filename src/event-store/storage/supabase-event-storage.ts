import { IRecordedEvent, IStorage } from '../types';
import {SupabaseClient} from "@supabase/supabase-js";
class SupabaseEventStorage implements IStorage {
  supabase: SupabaseClient;
  db: string;

  constructor({ supabase, db }: { supabase: SupabaseClient; db: string }) {
    this.supabase = supabase;
    this.db = db;
  }

  async save(event: IRecordedEvent): Promise<void> {
    await this.supabase.from('events').insert([event]);
    return;
  }

  async load(): Promise<IRecordedEvent[]> {
    let {
      data: events, error
    } = await this.supabase.from('events').select('*') as { data: IRecordedEvent[], error: any };

    if (error) {
      throw new Error(error);
    }

    return events;
  }
}

export default SupabaseEventStorage;
