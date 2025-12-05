import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database connection setup
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ DATABASE_URL environment variable is not set!');
    console.log('Please set it in your .env file');
    process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Starting database seeding...');

    // Safe to use connectionString here since we checked it exists above
    const dbInfo = connectionString!.split('@')[1]?.split('?')[0] || 'configured';
    console.log(`📦 Database: ${dbInfo}`);

    // Hash the password
    const hashedPassword = await bcrypt.hash('123456', 10);

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
        where: { email: 'admin@ridenbite.com' },
    });

    if (existingAdmin) {
        console.log('⚠️  Admin user already exists. Updating password...');
        await prisma.user.update({
            where: { email: 'admin@ridenbite.com' },
            data: {
                password: hashedPassword,
                role: 'ADMIN',
            },
        });
        console.log('✅ Admin user password updated!');
    } else {
        console.log('👤 Creating admin user...');
        await prisma.user.create({
            data: {
                email: 'admin@ridenbite.com',
                password: hashedPassword,
                name: 'Admin User',
                role: 'ADMIN',
            },
        });
        console.log('✅ Admin user created successfully!');
    }

    console.log('\n📝 Admin Credentials:');
    console.log('   Email: admin@ridenbite.com');
    console.log('   Password: 123456');
    console.log('   Role: ADMIN');

    // Create or update restaurant owner
    const existingRestaurant = await prisma.user.findUnique({
        where: { email: 'restaurant@ridenbite.com' },
    });

    let restaurantOwnerId: number;
    
    if (existingRestaurant) {
        console.log('\n⚠️  Restaurant owner already exists. Updating...');
        await prisma.user.update({
            where: { email: 'restaurant@ridenbite.com' },
            data: {
                password: hashedPassword,
                role: 'RESTAURANT',
                emailVerified: true,
            },
        });
        restaurantOwnerId = existingRestaurant.id;
        console.log('✅ Restaurant owner updated!');
    } else {
        console.log('\n👨‍🍳 Creating restaurant owner...');
        const restaurantOwner = await prisma.user.create({
            data: {
                email: 'restaurant@ridenbite.com',
                password: hashedPassword,
                name: 'Kitchen Console',
                phone: '+8801700000000',
                role: 'RESTAURANT',
                emailVerified: true,
            },
        });
        restaurantOwnerId = restaurantOwner.id;
    }

    // Check if restaurant exists
    const existingRestaurantData = await prisma.restaurant.findUnique({
        where: { ownerId: restaurantOwnerId },
    });

    if (!existingRestaurantData) {
        // Create restaurant
        console.log('🏪 Creating restaurant...');
        const restaurant = await prisma.restaurant.create({
            data: {
                ownerId: restaurantOwnerId,
                name: "RideN'Bite Kitchen",
                address: '27 Gulshan Avenue, Dhaka',
                lat: 23.7805733,
                lng: 90.4139857,
            },
        });

        // Create restaurant profile
        console.log('📋 Creating restaurant profile...');
        await prisma.restaurantProfile.create({
            data: {
                userId: restaurantOwnerId,
                businessName: "RideN'Bite Kitchen",
                address: '27 Gulshan Avenue, Dhaka',
                lat: 23.7805733,
                lng: 90.4139857,
                cuisine: ['Fast Casual', 'Bangladeshi Fusion'],
                openingHours: { opening: '10:00', closing: '23:30' },
                taxId: 'RB-928331',
                deliveryOptions: ['DELIVERY', 'PICKUP'],
                status: 'ACTIVE',
            },
        });

        // Create sample menu items
        console.log('🍔 Creating sample menu items...');
        await prisma.menuItem.createMany({
            data: [
                {
                    restaurantId: restaurant.id,
                    name: 'Dhaka Dynamite Burger',
                    description: 'Smash patty, naga aioli, pickled onions, brioche bun',
                    priceCents: 45000,
                    category: 'BURGER',
                    cookingTime: 12,
                    spiceLevel: 'MEDIUM',
                    rating: 4.8,
                    available: true,
                    imageUrl: 'https://placehold.co/64',
                    tags: ['spicy', 'bestseller'],
                },
                {
                    restaurantId: restaurant.id,
                    name: 'Grilled Prawn Platter',
                    description: 'Charcoal grilled Bay-of-Bengal prawns with herb rice',
                    priceCents: 82000,
                    category: 'SEAFOOD',
                    cookingTime: 20,
                    spiceLevel: 'HOT',
                    rating: 4.6,
                    available: true,
                    imageUrl: 'https://placehold.co/64',
                    tags: ['seafood', 'grilled'],
                },
                {
                    restaurantId: restaurant.id,
                    name: 'Naga Chicken Wings',
                    description: 'Fiery wings with traditional naga pepper sauce',
                    priceCents: 35000,
                    category: 'SPECIAL',
                    cookingTime: 15,
                    spiceLevel: 'HOT',
                    rating: 4.7,
                    available: true,
                    imageUrl: 'https://placehold.co/64',
                    tags: ['spicy', 'chicken'],
                },
                {
                    restaurantId: restaurant.id,
                    name: 'Sweet Chili Fries',
                    description: 'Crispy fries with sweet chili glaze',
                    priceCents: 25000,
                    category: 'SPECIAL',
                    cookingTime: 10,
                    spiceLevel: 'MILD',
                    rating: 4.5,
                    available: true,
                    imageUrl: 'https://placehold.co/64',
                    tags: ['sides', 'vegetarian'],
                },
            ],
        });

        console.log('✅ Restaurant, profile, and menu items created!');
    } else {
        console.log('✅ Restaurant already exists!');
    }

    console.log('\n📝 Restaurant Credentials:');
    console.log('   Email: restaurant@ridenbite.com');
    console.log('   Password: 123456');
    console.log('   Role: RESTAURANT');
    console.log('\n✨ Seeding completed!');
}

main()
    .catch((e: any) => {
        console.error('❌ Error during seeding:', e.message);
        if (e.code === 'P1000') {
            console.log('\n💡 Tip: Check your DATABASE_URL in .env file');
            console.log('   Make sure PostgreSQL is running and credentials are correct');
        }
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
