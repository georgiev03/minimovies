import { SupabaseClient } from '@supabase/supabase-js';

export abstract class BaseRepository<T> {
  protected tableName: string;
  protected db: SupabaseClient;

  constructor(db: SupabaseClient, tableName: string) {
    this.db = db;
    this.tableName = tableName;
  }

  async findAll(): Promise<T[]> {
    const { data, error } = await this.db
      .from(this.tableName)
      .select('*');
    
    if (error) throw error;
    return data as T[];
  }

  async findById(id: string): Promise<T | null> {
    const { data, error } = await this.db
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as T | null;
  }

  async create(data: Partial<T>): Promise<T> {
    const { data: newData, error } = await this.db
      .from(this.tableName)
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return newData as T;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const { data: updatedData, error } = await this.db
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return updatedData as T;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.db
      .from(this.tableName)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
} 