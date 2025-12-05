import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const items = await prisma.menuItem.findMany({
        select: {
            name: true,
            available: true,
            priceCents: true,
            restaurant: {
                select: {
                    name: true,
                    owner: {
                        select: {
                            restaurantProfile: {
                                select: { status: true }
                            }
                        }
                    }
                }
            }
        }
    });

    console.log('\n📋 Menu Items:');
    items.forEach(i => {
        const status = i.restaurant.owner?.restaurantProfile?.status ?? 'NO_PROFILE';
        console.log(`  - ${i.name} (₹${i.priceCents/100}) - available: ${i.available}, restaurant status: ${status}`);
    });

    if (items.length === 0) {
        console.log('  (No menu items found)');
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
