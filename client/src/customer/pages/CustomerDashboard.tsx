import { Search, Star, Clock, MapPin, TrendingUp, Tag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../admin/components/ui/card";
import { Badge } from "../../admin/components/ui/badge";

// Mock data
const recommendedDishes = [
    {
        id: 1,
        name: "Chicken Biryani",
        restaurant: "Dhaka Spice House",
        price: 350,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400",
        deliveryTime: "25-30 min",
    },
    {
        id: 2,
        name: "Beef Burger",
        restaurant: "Burger Junction",
        price: 450,
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
        deliveryTime: "20-25 min",
    },
    {
        id: 3,
        name: "Grilled Chicken",
        restaurant: "Grill Masters",
        price: 520,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400",
        deliveryTime: "30-35 min",
    },
    {
        id: 4,
        name: "Vegetable Fried Rice",
        restaurant: "Chinese Express",
        price: 280,
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400",
        deliveryTime: "15-20 min",
    },
];

const nearbyRestaurants = [
    {
        id: 1,
        name: "Dhaka Spice House",
        cuisine: "Bangladeshi, Indian",
        rating: 4.8,
        deliveryTime: "25-30 min",
        deliveryFee: 50,
        isOpen: true,
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
        distance: "1.2 km",
    },
    {
        id: 2,
        name: "Burger Junction",
        cuisine: "Fast Food, American",
        rating: 4.6,
        deliveryTime: "20-25 min",
        deliveryFee: 40,
        isOpen: true,
        image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400",
        distance: "0.8 km",
    },
    {
        id: 3,
        name: "Grill Masters",
        cuisine: "BBQ, Continental",
        rating: 4.7,
        deliveryTime: "30-35 min",
        deliveryFee: 60,
        isOpen: true,
        image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
        distance: "2.1 km",
    },
    {
        id: 4,
        name: "Chinese Express",
        cuisine: "Chinese, Thai",
        rating: 4.5,
        deliveryTime: "15-20 min",
        deliveryFee: 30,
        isOpen: false,
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400",
        distance: "3.5 km",
    },
];

const activeOrder = {
    id: "ORD-12345",
    restaurant: "Dhaka Spice House",
    items: 3,
    total: 850,
    status: "cooking",
    estimatedTime: "20 min",
    stages: [
        { name: "Order Placed", completed: true },
        { name: "Preparing", completed: true, current: true },
        { name: "Ready for Pickup", completed: false },
        { name: "On The Way", completed: false },
        { name: "Delivered", completed: false },
    ],
};

const offers = [
    {
        id: 1,
        title: "50% OFF on First Order",
        description: "Use code: FIRST50",
        image: "https://images.unsplash.com/photo-1604147706283-d7119b5b822c?w=800",
        expires: "Dec 31, 2025",
    },
    {
        id: 2,
        title: "Free Delivery on Orders Above ৳500",
        description: "No code needed",
        image: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800",
        expires: "Dec 15, 2025",
    },
];

export function CustomerDashboard() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-slate-500">
                    What would you like to eat today?
                </p>
            </div>

            {/* Search Hero Card */}
            <Card className="bg-gradient-to-r from-orange-500 to-red-500">
                <CardContent className="p-8">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl font-bold text-white mb-2">
                            Search Any Food
                        </h2>
                        <p className="text-orange-50 mb-6">
                            Biryani, burger, chicken fry, or anything you crave...
                        </p>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search for dishes, restaurants, cuisines..."
                                className="w-full rounded-lg border-0 bg-white px-12 py-4 text-base shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-orange-600 px-6 py-2 font-medium text-white hover:bg-orange-700">
                                Search
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Active Order Tracker */}
            {activeOrder && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Active Order</CardTitle>
                                <CardDescription>Order {activeOrder.id} from {activeOrder.restaurant}</CardDescription>
                            </div>
                            <Badge className="bg-orange-500">{activeOrder.estimatedTime} remaining</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            <div className="flex justify-between">
                                {activeOrder.stages.map((stage, index) => (
                                    <div key={index} className="flex flex-col items-center gap-2">
                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                                                stage.completed || stage.current
                                                    ? "border-orange-500 bg-orange-500 text-white"
                                                    : "border-slate-300 bg-white text-slate-400"
                                            }`}
                                        >
                                            {stage.completed ? "✓" : index + 1}
                                        </div>
                                        <span className="text-xs font-medium text-center max-w-[80px]">
                                            {stage.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 -z-10" />
                        </div>
                        <div className="mt-6 flex justify-between text-sm">
                            <span className="text-slate-600">{activeOrder.items} items</span>
                            <span className="font-semibold">Total: ৳{activeOrder.total}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Offers Banner */}
            <div className="grid gap-4 md:grid-cols-2">
                {offers.map((offer) => (
                    <Card key={offer.id} className="overflow-hidden">
                        <div className="relative h-32">
                            <img
                                src={offer.image}
                                alt={offer.title}
                                className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                            <div className="absolute inset-0 p-4 text-white">
                                <h3 className="text-lg font-bold mb-1">{offer.title}</h3>
                                <p className="text-sm text-orange-200">{offer.description}</p>
                                <div className="mt-2 flex items-center gap-2 text-xs">
                                    <Tag className="h-3 w-3" />
                                    <span>Expires: {offer.expires}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Recommended Dishes */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-orange-600" />
                                Recommended for You
                            </CardTitle>
                            <CardDescription>Popular dishes based on your preferences</CardDescription>
                        </div>
                        <a href="#" className="text-sm font-medium text-orange-600 hover:underline">
                            View All
                        </a>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {recommendedDishes.map((dish) => (
                            <div key={dish.id} className="group cursor-pointer rounded-lg border border-slate-200 bg-white transition-shadow hover:shadow-lg">
                                <div className="relative h-48 overflow-hidden rounded-t-lg">
                                    <img
                                        src={dish.image}
                                        alt={dish.name}
                                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-slate-900">{dish.name}</h3>
                                    <p className="text-sm text-slate-500">{dish.restaurant}</p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-lg font-bold text-orange-600">৳{dish.price}</span>
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            <span className="text-sm font-medium">{dish.rating}</span>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                                        <Clock className="h-3 w-3" />
                                        <span>{dish.deliveryTime}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Nearby Restaurants */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-orange-600" />
                                Nearby Restaurants
                            </CardTitle>
                            <CardDescription>Restaurants near your location</CardDescription>
                        </div>
                        <a href="#" className="text-sm font-medium text-orange-600 hover:underline">
                            View All
                        </a>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {nearbyRestaurants.map((restaurant) => (
                            <div key={restaurant.id} className="group cursor-pointer rounded-lg border border-slate-200 bg-white transition-shadow hover:shadow-lg">
                                <div className="relative h-40 overflow-hidden rounded-t-lg">
                                    <img
                                        src={restaurant.image}
                                        alt={restaurant.name}
                                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                    />
                                    <Badge
                                        className={`absolute top-2 right-2 ${
                                            restaurant.isOpen
                                                ? "bg-green-500"
                                                : "bg-red-500"
                                        }`}
                                    >
                                        {restaurant.isOpen ? "Open" : "Closed"}
                                    </Badge>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-slate-900">{restaurant.name}</h3>
                                    <p className="text-sm text-slate-500">{restaurant.cuisine}</p>
                                    <div className="mt-3 flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            <span className="font-medium">{restaurant.rating}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-slate-500">
                                            <Clock className="h-3 w-3" />
                                            <span>{restaurant.deliveryTime}</span>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between text-sm">
                                        <span className="text-slate-600">৳{restaurant.deliveryFee} delivery</span>
                                        <span className="text-slate-500">{restaurant.distance}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
