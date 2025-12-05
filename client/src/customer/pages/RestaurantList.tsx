import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Search,
    Star,
    Clock,
    Bike,
    MapPin,
    SlidersHorizontal,
    Loader2,
    Heart,
    X,
} from "lucide-react";
import { Card, CardContent } from "../../admin/components/ui/card";
import { Button } from "../../admin/components/ui/button";
import { customerApi, type Restaurant } from "../services/customerApi";
import { toast } from "../../admin/components/ui/use-toast";

const cuisineFilters = [
    "All Cuisines",
    "Bengali",
    "Indian",
    "Chinese",
    "Italian",
    "Japanese",
    "American",
    "Thai",
    "Mexican",
];

export function RestaurantList() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
    const [sortBy, setSortBy] = useState("recommended");
    const [selectedCuisine, setSelectedCuisine] = useState("All Cuisines");
    const [showFilters, setShowFilters] = useState(false);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

    // Filter options
    const [filters, setFilters] = useState({
        openNow: false,
        freeDelivery: false,
        topRated: false,
    });

    useEffect(() => {
        const fetchRestaurants = async () => {
            setLoading(true);
            try {
                const data = await customerApi.getRestaurants({
                    search: searchTerm || undefined,
                    cuisine: selectedCuisine !== "All Cuisines" ? selectedCuisine : undefined,
                });
                setRestaurants(data?.restaurants || []);

                // Fetch favorites
                try {
                    const favs = await customerApi.getFavorites();
                    const favRestaurantIds = new Set(
                        favs.filter((f: { restaurantId?: string }) => f.restaurantId).map((f: { restaurantId?: string }) => f.restaurantId as string)
                    );
                    setFavorites(favRestaurantIds);
                } catch {
                    // User might not be logged in
                }
            } catch (error) {
                console.error("Error fetching restaurants:", error);
                toast({
                    title: "Error",
                    description: "Failed to load restaurants",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();
    }, [searchTerm, selectedCuisine]);

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        if (value) {
            setSearchParams({ q: value });
        } else {
            setSearchParams({});
        }
    };

    const handleToggleFavorite = async (e: React.MouseEvent, restaurant: Restaurant) => {
        e.stopPropagation(); // Prevent navigation

        try {
            if (favorites.has(restaurant.id)) {
                const favs = await customerApi.getFavorites();
                const fav = favs.find((f: { id: string; restaurantId?: string }) => f.restaurantId === restaurant.id);
                if (fav) {
                    await customerApi.removeFavorite(fav.id);
                }
                setFavorites((prev) => {
                    const next = new Set(prev);
                    next.delete(restaurant.id);
                    return next;
                });
            } else {
                await customerApi.addFavorite({ restaurantId: restaurant.id });
                setFavorites((prev) => new Set(prev).add(restaurant.id));
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
            toast({
                title: "Error",
                description: "Please log in to manage favorites",
                variant: "destructive",
            });
        }
    };

    // Apply client-side filters and sorting
    let filteredRestaurants = [...restaurants];

    // Apply filters
    if (filters.openNow) {
        filteredRestaurants = filteredRestaurants.filter((r) => r.status === "ACTIVE");
    }
    if (filters.topRated) {
        filteredRestaurants = filteredRestaurants.filter((r) => (r.rating || 0) >= 4.5);
    }

    // Apply sorting
    if (sortBy === "rating") {
        filteredRestaurants.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "name") {
        filteredRestaurants.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                <p className="mt-4 text-slate-500">Loading restaurants...</p>
            </div>
        );
    }

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
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full rounded-md border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => handleSearch("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                            >
                                <option value="recommended">Recommended</option>
                                <option value="rating">Rating</option>
                                <option value="name">Name</option>
                            </select>
                            <Button
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                                className={showFilters ? "bg-orange-50 border-orange-500" : ""}
                            >
                                <SlidersHorizontal className="h-4 w-4 mr-2" />
                                Filters
                            </Button>
                        </div>
                    </div>

                    {/* Expanded Filters */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t">
                            <div className="flex flex-wrap gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.openNow}
                                        onChange={(e) =>
                                            setFilters({ ...filters, openNow: e.target.checked })
                                        }
                                        className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                                    />
                                    <span className="text-sm">Open Now</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.freeDelivery}
                                        onChange={(e) =>
                                            setFilters({ ...filters, freeDelivery: e.target.checked })
                                        }
                                        className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                                    />
                                    <span className="text-sm">Free Delivery</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.topRated}
                                        onChange={(e) =>
                                            setFilters({ ...filters, topRated: e.target.checked })
                                        }
                                        className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                                    />
                                    <span className="text-sm">Top Rated (4.5+)</span>
                                </label>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Cuisine Filter Pills */}
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
                {cuisineFilters.map((cuisine) => (
                    <button
                        key={cuisine}
                        onClick={() => setSelectedCuisine(cuisine)}
                        className={`flex-shrink-0 rounded-full px-4 py-2 text-sm transition-colors ${
                            selectedCuisine === cuisine
                                ? "bg-orange-600 text-white"
                                : "border border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                    >
                        {cuisine}
                    </button>
                ))}
            </div>

            {/* Results count */}
            <div className="text-sm text-slate-500">
                {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? "s" : ""}{" "}
                found
                {searchTerm && ` for "${searchTerm}"`}
            </div>

            {/* Restaurant Grid */}
            {filteredRestaurants.length === 0 ? (
                <div className="text-center py-12">
                    <MapPin className="h-12 w-12 mx-auto text-slate-300" />
                    <h3 className="mt-4 text-lg font-medium text-slate-900">No restaurants found</h3>
                    <p className="mt-2 text-slate-500">
                        Try adjusting your search or filters to find more restaurants.
                    </p>
                    <Button
                        onClick={() => {
                            setSearchTerm("");
                            setSelectedCuisine("All Cuisines");
                            setFilters({ openNow: false, freeDelivery: false, topRated: false });
                        }}
                        variant="outline"
                        className="mt-4"
                    >
                        Clear Filters
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredRestaurants.map((restaurant) => {
                        const isOpen = restaurant.status === "ACTIVE";
                        const isFavorite = favorites.has(restaurant.id);

                        return (
                            <Card
                                key={restaurant.id}
                                onClick={() => navigate(`/customer/restaurants/${restaurant.id}`)}
                                className={`cursor-pointer overflow-hidden transition-all hover:shadow-lg ${
                                    !isOpen ? "opacity-60" : ""
                                }`}
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={
                                            restaurant.storefrontImage ||
                                            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400"
                                        }
                                        alt={restaurant.name}
                                        className="h-full w-full object-cover transition-transform hover:scale-105"
                                    />
                                    <button
                                        onClick={(e) => handleToggleFavorite(e, restaurant)}
                                        className="absolute top-3 right-3 rounded-full bg-white/90 p-2 hover:bg-white transition-colors"
                                    >
                                        <Heart
                                            className={`h-5 w-5 ${
                                                isFavorite ? "fill-red-500 text-red-500" : "text-slate-600"
                                            }`}
                                        />
                                    </button>
                                    {!isOpen && (
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
                                        <p className="text-sm text-slate-500">
                                            {restaurant.cuisine || "Multi-Cuisine"}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-slate-600">
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            <span className="font-semibold">
                                                {restaurant.rating?.toFixed(1) || "New"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            <span>25-35 min</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border-t pt-3">
                                        <div className="flex items-center gap-1 text-sm text-slate-600">
                                            <Bike className="h-4 w-4" />
                                            <span>৳50</span>
                                        </div>
                                        {restaurant.address && (
                                            <div className="flex items-center gap-1 text-sm text-slate-600">
                                                <MapPin className="h-4 w-4" />
                                                <span className="truncate max-w-[120px]">
                                                    {restaurant.address.split(",")[0]}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
