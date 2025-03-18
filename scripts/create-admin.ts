import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdminUser() {
  try {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    
    const { data, error } = await supabase
      .from('User')
      .insert([
        {
          name: 'Admin User',
          email: 'molhoqt51@gmail.com',
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true,
        }
      ])
      .select()
      .single();

    if (error) throw error;
    console.log('Admin user created successfully:', data);
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser(); 