import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';

/**
 * Direct database script to create admin users
 * Usage: npx tsx scripts/create-admin-direct.ts
 * 
 * You'll need to replace the DATABASE_URL with your actual database URL
 */

async function createAdminUser() {
  try {
    // Replace this with your actual database URL
    const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/chainfundit';
    
    if (DATABASE_URL === 'postgresql://username:password@localhost:5432/chainfundit') {
      console.error('❌ Please set your DATABASE_URL in the script or as an environment variable');
      console.error('Example: DATABASE_URL="postgresql://user:pass@host:port/db" npx tsx scripts/create-admin-direct.ts');
      process.exit(1);
    }

    const email = process.argv[2];
    const password = process.argv[3];
    const role = process.argv[4] || 'admin';

    if (!email || !password) {
      console.error('Usage: npx tsx scripts/create-admin-direct.ts <email> <password> [role]');
      console.error('Example: npx tsx scripts/create-admin-direct.ts admin@chainfundit.com password123 super_admin');
      process.exit(1);
    }

    console.log('🔗 Connecting to database...');
    const sql = postgres(DATABASE_URL);
    const db = drizzle(sql);

    console.log('🔍 Checking if user exists...');

    // Check if user exists
    const existingUser = await sql`
      SELECT id, email FROM users WHERE email = ${email} LIMIT 1
    `;

    if (existingUser.length > 0) {
      // Update existing user
      console.log('👤 User exists, updating to admin role...');
      const hashedPassword = await bcrypt.hash(password, 12);
      
      await sql`
        UPDATE users 
        SET 
          role = ${role},
          password = ${hashedPassword},
          is_verified = true,
          has_completed_profile = true
        WHERE email = ${email}
      `;

      console.log(`✅ Updated existing user ${email} to ${role} role`);
    } else {
      // Create new user
      console.log('👤 Creating new admin user...');
      const hashedPassword = await bcrypt.hash(password, 12);
      
      await sql`
        INSERT INTO users (email, full_name, password, role, is_verified, has_completed_profile)
        VALUES (${email}, ${email.split('@')[0]}, ${hashedPassword}, ${role}, true, true)
      `;

      console.log(`✅ Created new ${role} user: ${email}`);
    }

    console.log('\n🎉 Admin user setup complete!');
    console.log('You can now login at /signin with these credentials');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Role: ${role}`);

    await sql.end();

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
