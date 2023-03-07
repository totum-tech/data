import { IRecordedEvent, IStorage } from '../types';
import {RealtimeChannel, SupabaseClient} from "@supabase/supabase-js";
class SupabaseEventStorage implements IStorage {
  supabase: SupabaseClient;
  channel: RealtimeChannel;

  constructor({ supabase, db }: { supabase: SupabaseClient; db: string }) {
    this.supabase = supabase;
    this.channel = this.supabase.channel('eventStorageSubscriber')
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

  subscribe(listener: any) : void {
    this.channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'events' },
        payload => listener(payload.new)
      )
      .subscribe(status => console.info('EventStorage', status));
  }

  async unsubscribe() : Promise<void> {
    await this.supabase.removeChannel(this.channel);
  }
}

export default SupabaseEventStorage;
