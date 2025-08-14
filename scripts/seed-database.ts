
import { supabase } from '../lib/supabase';

// Sample data untuk mengisi database
const sampleData = {
  users: [
    {
      email: 'admin@venapictures.com',
      password: 'password123',
      full_name: 'Admin Vena',
      role: 'Admin'
    }
  ],
  clients: [
    {
      name: 'Andi & Siska',
      email: 'andi@example.com',
      phone: '081111111111',
      since: '2024-01-15',
      status: 'Aktif',
      client_type: 'Langsung',
      last_contact: new Date().toISOString(),
      portal_access_id: 'CLIENT001'
    }
  ],
  packages: [
    {
      name: 'Paket Wedding Basic',
      price: 15000000,
      physical_items: [
        { name: 'Album Wedding', price: 2000000 }
      ],
      digital_items: ['400 Foto Edit', 'Video Highlight'],
      processing_time: '45 hari kerja',
      default_printing_cost: 500000,
      default_transport_cost: 300000,
      photographers: 'Fotografer Utama',
      videographers: 'Videografer Utama'
    }
  ]
};

export async function seedDatabase() {
  try {
    console.log('🌱 Memulai seeding database...');

    // Seed users
    const { error: usersError } = await supabase
      .from('users')
      .insert(sampleData.users);
    if (usersError) throw usersError;
    console.log('✅ Users seeded');

    // Seed clients
    const { error: clientsError } = await supabase
      .from('clients')
      .insert(sampleData.clients);
    if (clientsError) throw clientsError;
    console.log('✅ Clients seeded');

    // Seed packages
    const { error: packagesError } = await supabase
      .from('packages')
      .insert(sampleData.packages);
    if (packagesError) throw packagesError;
    console.log('✅ Packages seeded');

    console.log('🎉 Database seeding selesai!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// Jalankan seeding jika file ini dijalankan langsung
if (require.main === module) {
  seedDatabase();
}
