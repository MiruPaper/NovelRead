import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Example database operations
export const db = {
  // User operations
  async createUser(userData: {
    email: string;
    password: string;
    name?: string;
  }) {
    const { data, error } = await supabase
      .from('User')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserByEmail(email: string) {
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    return data;
  },

  // Novel operations
  async createNovel(novelData: {
    title: string;
    description: string;
    coverImage?: string;
    authorId: string;
  }) {
    const { data, error } = await supabase
      .from('Novel')
      .insert([novelData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getNovelsByAuthor(authorId: string) {
    const { data, error } = await supabase
      .from('Novel')
      .select(`
        *,
        chapters:Chapter(*)
      `)
      .eq('authorId', authorId);

    if (error) throw error;
    return data;
  },

  // Chapter operations
  async createChapter(chapterData: {
    title: string;
    content: string;
    novelId: string;
  }) {
    const { data, error } = await supabase
      .from('Chapter')
      .insert([chapterData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getChaptersByNovel(novelId: string) {
    const { data, error } = await supabase
      .from('Chapter')
      .select('*')
      .eq('novelId', novelId)
      .order('createdAt', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Raw SQL query example
  async executeRawQuery(query: string, params: unknown[] = []) {
    const { data, error } = await supabase.rpc('execute_sql', {
      query,
      params
    });

    if (error) throw error;
    return data;
  }
}; 