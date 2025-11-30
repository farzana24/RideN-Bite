import { Search, Star, Clock, Bike, MapPin, Filter, SlidersHorizontal } from "lucide-react";
import { Card, CardContent } from "../../admin/components/ui/card";
import { Badge } from "../../admin/components/ui/badge";
import { useState } from "react";

const restaurants = [
    {
        id: 1,
        name: "Dhaka Spice House",
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
        cuisine: "Indian, Bengali",
        rating: 4.5,
        reviews: 234,
        deliveryTime: "25-35 min",
        deliveryFee: 40,
        distance: "1.2 km",
        isOpen: true,
        promoted: true,
    },
    {
        id: 2,
        name: "Burger Junction",
        image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400",
        cuisine: "American, Burgers",
        rating: 4.8,
        reviews: 567,
        deliveryTime: "20-30 min",
        deliveryFee: 30,
        distance: "0.8 km",
        isOpen: true,
        promoted: false,
    },
    {
        id: 3,
        name: "Grill Masters",
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",
        cuisine: "BBQ, Grilled",
        rating: 4.6,
        reviews: 189,
        deliveryTime: "30-40 min",
        deliveryFee: 50,
        distance: "2.5 km",
        isOpen: true,
        promoted: false,
    },
    {
        id: 4,
        name: "Chinese Express",
        image: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=400",
        cuisine: "Chinese, Asian",
        rating: 4.3,
        reviews: 412,
        deliveryTime: "35-45 min",
        deliveryFee: 45,
        distance: "3.1 km",
        isOpen: false,
        promoted: false,
    },
    {
        id: 5,
        name: "Pizza Paradise",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
        cuisine: "Italian, Pizza",
        rating: 4.7,
        reviews: 678,
        deliveryTime: "25-35 min",
        deliveryFee: 35,
        distance: "1.5 km",
        isOpen: true,
        promoted: true,
    },
    {
        id: 6,
        name: "Sushi Station",
        image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400",
        cuisine: "Japanese, Sushi",
        rating: 4.9,
        reviews: 891,
        deliveryTime: "30-40 min",
        deliveryFee: 60,
        distance: "2.8 km",
        isOpen: true,
        promoted: false,
    },
];

export function RestaurantList() {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("recommended");

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Restaurants Near You</h1>
                <p className="text-slate-500">Discover delicious food from local restaurants</p>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="relative flex-1 max-w-xl">
                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search restaurants or cuisines..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-md border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                            >
                                <option value="recommended">Recommended</option>
                                <option value="rating">Rating</option>
                                <option value="delivery_time">Delivery Time</option>
                                <option value="distance">Distance</option>
                            </select>
                            <button className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50">
                                <SlidersHorizontal className="h-4 w-4" />
                                Filters
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Filters Pills */}
            <div className="flex flex-wrap gap-2">
                <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50">
                    <Filter className="inline h-3 w-3 mr-1" />
                    All Cuisines
                </button>
                <button className="rounded-full bg-orange-600 px-4 py-2 text-sm text-white hover:bg-orange-700">
                    Fast Delivery
                </button>
                <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50">
                    Top Rated
                </button>
                <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50">
                    Free Delivery
                </button>
                <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50">
                    New Restaurants
                </button>
            </div>

            {/* Restaurant Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {restaurants.map((restaurant) => (
                    <Card
                        key={restaurant.id}
                        className={`cursor-pointer overflow-hidden transition-all hover:shadow-lg ${
                            !restaurant.isOpen ? "opacity-60" : ""
                        }`}
                    >
                        <div className="relative h-48 overflow-hidden">
                            <img
                                src={restaurant.image}
                                alt={restaurant.name}
                                className="h-full w-full object-cover transition-transform hover:scale-105"
                            />
                            {restaurant.promoted && (
                                <Badge className="absolute top-3 left-3 bg-orange-600">Promoted</Badge>
                            )}
                            {!restaurant.isOpen && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                    <span className="rounded-full bg-white px-4 py-2 font-semibold text-slate-900">
                                        Currently Closed
                                    </span>
                                </div>
                            )}
                        </div>
                        <CardContent className="p-4 space-y-3">
                            <div>
                                <h3 className="text-lg font-semibold">{restaurant.name}</h3>
                                <p className="text-sm text-slate-500">{restaurant.cuisine}</p>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-slate-600">
                                <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span className="font-semibold">{restaurant.rating}</span>
                                    <span className="text-slate-400">({restaurant.reviews})</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{restaurant.deliveryTime}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t pt-3">
                                <div className="flex items-center gap-1 text-sm text-slate-600">
                                    <Bike className="h-4 w-4" />
                                    <span>৳{restaurant.deliveryFee}</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-slate-600">
                                    <MapPin className="h-4 w-4" />
                                    <span>{restaurant.distance}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
