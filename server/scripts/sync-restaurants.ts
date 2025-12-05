import { prisma } from '../src/lib/prisma';

async function syncRestaurants() {
    console.log('Syncing RestaurantProfiles with Restaurant table...\n');

    // Find all RestaurantProfiles that don't have a corresponding Restaurant
    const restaurantProfiles = await prisma.restaurantProfile.findMany({
        include: {
            user: true,
        },
    });

    let created = 0;

    for (const profile of restaurantProfiles) {
        // Check if Restaurant already exists for this user
        const existingRestaurant = await prisma.restaurant.findFirst({
            where: { ownerId: profile.userId },
        });

        if (!existingRestaurant) {
            // Create the Restaurant record
            await prisma.restaurant.create({
                data: {
                    ownerId: profile.userId,
                    name: profile.businessName,
                    address: profile.address,
                    lat: profile.lat,
                    lng: profile.lng,
                },
            });
            console.log(`✓ Created Restaurant for ${profile.businessName} (User: ${profile.user.email})`);
            created++;
        }
    }

    console.log(`\n✅ Sync complete! Created ${created} Restaurant records.`);
}

syncRestaurants().catch((error) => {
    console.error('Error syncing restaurants:', error);
    process.exit(1);
});
