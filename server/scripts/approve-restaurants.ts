import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('❌ DATABASE_URL environment variable is not set!');
    process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    // Approve all restaurant profiles
    const result = await prisma.restaurantProfile.updateMany({
        data: { status: 'ACTIVE' }
    });
    
    console.log(`✅ Approved ${result.count} restaurant profile(s)`);
    
    // List all restaurants with their profile status
    const restaurants = await prisma.restaurant.findMany({
        select: {
            id: true,
            name: true,
            owner: {
                select: {
                    restaurantProfile: {
                        select: { status: true }
                    }
                }
            },
            _count: {
                select: { menuItems: true }
            }
        }
    });
    
    console.log('\n📋 Restaurants:');
    restaurants.forEach(r => {
        const status = r.owner?.restaurantProfile?.status ?? 'NO_PROFILE';
        console.log(`  - ${r.name} (status: ${status}, menu items: ${r._count.menuItems})`);
    });
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
