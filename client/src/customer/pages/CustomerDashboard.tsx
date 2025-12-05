import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Star, Clock, MapPin, TrendingUp, Plus, X, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../admin/components/ui/card";
import { Badge } from "../../admin/components/ui/badge";
import { Button } from "../../admin/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../admin/components/ui/dialog";
import { useCartStore, type Restaurant as CartRestaurant } from "../store/cartStore";
import { toast } from "../../admin/components/ui/use-toast";
import { customerApi, formatPrice, type MenuItem, type Order, type Restaurant } from "../services/customerApi";

export function CustomerDashboard() {
    const navigate = useNavigate();
    const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Data states
    const [popularDishes, setPopularDishes] = useState<MenuItem[]>([]);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [activeOrder, setActiveOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    const { items: cartItems, addItem, total } = useCartStore();

    // Fetch data on mount
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [dishesRes, restaurantsRes, activeOrderRes] = await Promise.all([
                    customerApi.getPopularDishes(8),
                    customerApi.getRestaurants({ limit: 6 }),
                    customerApi.getActiveOrder().catch(() => null),
                ]);

                setPopularDishes(dishesRes || []);
                setRestaurants(restaurantsRes?.restaurants || []);
                setActiveOrder(activeOrderRes);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSearch = () => {
        if (searchQuery.trim()) {
            navigate(`/customer/restaurants?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleAddToCart = (dish: MenuItem) => {
        const cartItem = {
            id: dish.id.toString(),
            name: dish.name,
            price: dish.priceCents / 100,
            quantity: 1,
            image: dish.imageUrl,
            category: dish.category || "Other",
        };

        const restaurantData: CartRestaurant = {
            id: dish.restaurantId.toString(),
            name: dish.restaurant?.name || "Restaurant",
            deliveryFee: 50,
            distance: "2 km",
        };

        addItem(cartItem, restaurantData);
        toast({
            title: "Added to cart",
            description: `${dish.name} has been added to your cart`,
        });
        setSelectedDish(null);
    };

    const getOrderStages = (status: string) => {
        const stages = [
            { name: "Order Placed", key: "PENDING" },
            { name: "Confirmed", key: "CONFIRMED" },
            { name: "Preparing", key: "PREPARING" },
            { name: "Ready", key: "READY" },
            { name: "On The Way", key: "PICKED_UP" },
            { name: "Delivered", key: "DELIVERED" },
        ];

        const currentIndex = stages.findIndex((s) => s.key === status);

        return stages.map((stage, index) => ({
            ...stage,
            completed: index < currentIndex,
            current: index === currentIndex,
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-slate-500">What would you like to eat today?</p>
            </div>

            {/* Search Hero Card */}
            <Card className="bg-gradient-to-r from-orange-500 to-red-500">
                <CardContent className="p-8">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl font-bold text-white mb-2">Search Any Food</h2>
                        <p className="text-orange-50 mb-6">
                            Biryani, burger, chicken fry, or anything you crave...
                        </p>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                placeholder="Search for dishes, restaurants, cuisines..."
                                className="w-full rounded-lg border-0 bg-white px-12 py-4 text-base shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
                            />
                            <button
                                onClick={handleSearch}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-orange-600 px-6 py-2 font-medium text-white hover:bg-orange-700"
                            >
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
                                <CardDescription>
                                    Order #{activeOrder.id} from {activeOrder.restaurant.name}
                                </CardDescription>
                            </div>
                            <Badge className="bg-orange-500">
                                {customerApi.getOrderStatusLabel(activeOrder.status)}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            <div className="flex justify-between">
                                {getOrderStages(activeOrder.status).map((stage, index) => (
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
                            <span className="text-slate-600">{activeOrder.items.length} items</span>
                            <span className="font-semibold">
                                Total: {formatPrice(activeOrder.totalCents)}
                            </span>
                        </div>
                        <div className="mt-4">
                            <Button
                                variant="outline"
                                onClick={() => navigate(`/customer/orders/${activeOrder.id}`)}
                            >
                                Track Order
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Recommended Dishes */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-orange-600" />
                                Popular Dishes
                            </CardTitle>
                            <CardDescription>Top rated dishes from our restaurants</CardDescription>
                        </div>
                        <Button
                            variant="link"
                            onClick={() => navigate("/customer/restaurants")}
                            className="text-orange-600"
                        >
                            View All
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {popularDishes.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            No dishes available yet. Check back later!
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {popularDishes.map((dish) => (
                                <div
                                    key={dish.id}
                                    onClick={() => setSelectedDish(dish)}
                                    className="group cursor-pointer rounded-lg border border-slate-200 bg-white transition-shadow hover:shadow-lg"
                                >
                                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                                        <img
                                            src={
                                                dish.imageUrl ||
                                                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"
                                            }
                                            alt={dish.name}
                                            className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                        />
                                        {dish.category && (
                                            <Badge className="absolute top-2 left-2 bg-orange-500">
                                                {dish.category}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-slate-900">{dish.name}</h3>
                                        <p className="text-sm text-slate-500">
                                            {dish.restaurant?.name || "Restaurant"}
                                        </p>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-lg font-bold text-orange-600">
                                                {formatPrice(dish.priceCents)}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span className="text-sm font-medium">
                                                    {dish.rating.toFixed(1)}
                                                </span>
                                            </div>
                                        </div>
                                        {dish.cookingTime && (
                                            <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                                                <Clock className="h-3 w-3" />
                                                <span>{dish.cookingTime} min</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Nearby Restaurants */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-orange-600" />
                                Restaurants
                            </CardTitle>
                            <CardDescription>Browse restaurants near you</CardDescription>
                        </div>
                        <Button
                            variant="link"
                            onClick={() => navigate("/customer/restaurants")}
                            className="text-orange-600"
                        >
                            View All
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {restaurants.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            No restaurants available yet. Check back later!
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {restaurants.map((restaurant) => (
                                <div
                                    key={restaurant.id}
                                    onClick={() => navigate(`/customer/restaurants/${restaurant.id}`)}
                                    className="group cursor-pointer rounded-lg border border-slate-200 bg-white transition-shadow hover:shadow-lg"
                                >
                                    <div className="relative h-40 overflow-hidden rounded-t-lg bg-gradient-to-br from-orange-400 to-red-500">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-4xl font-bold text-white">
                                                {restaurant.name.charAt(0)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-slate-900">{restaurant.name}</h3>
                                        <p className="text-sm text-slate-500 truncate">{restaurant.address}</p>
                                        <div className="mt-3 flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span className="font-medium">
                                                    {restaurant.avgRating?.toFixed(1) || "New"}
                                                </span>
                                                {restaurant.totalReviews > 0 && (
                                                    <span className="text-slate-400">
                                                        ({restaurant.totalReviews})
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 text-slate-500">
                                                <Clock className="h-3 w-3" />
                                                <span>25-35 min</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dish Detail Modal */}
            <Dialog open={!!selectedDish} onOpenChange={() => setSelectedDish(null)}>
                <DialogContent className="max-w-lg">
                    {selectedDish && (
                        <>
                            <div className="relative h-48 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-lg">
                                <img
                                    src={
                                        selectedDish.imageUrl ||
                                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"
                                    }
                                    alt={selectedDish.name}
                                    className="h-full w-full object-cover"
                                />
                                <button
                                    onClick={() => setSelectedDish(null)}
                                    className="absolute top-3 right-3 rounded-full bg-white/90 p-1.5 hover:bg-white"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <DialogHeader>
                                <DialogTitle className="text-xl">{selectedDish.name}</DialogTitle>
                                <DialogDescription className="text-base text-slate-600">
                                    {selectedDish.description || "Delicious dish from our kitchen"}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-3 py-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-orange-600">
                                        {formatPrice(selectedDish.priceCents)}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        <span className="font-medium">{selectedDish.rating.toFixed(1)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                    <span
                                        onClick={() => {
                                            setSelectedDish(null);
                                            navigate(`/customer/restaurants/${selectedDish.restaurantId}`);
                                        }}
                                        className="cursor-pointer hover:text-orange-600 hover:underline"
                                    >
                                        {selectedDish.restaurant?.name || "Restaurant"}
                                    </span>
                                    {selectedDish.cookingTime && (
                                        <>
                                            <span>•</span>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {selectedDish.cookingTime} min
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {selectedDish.category && (
                                        <Badge variant="outline">{selectedDish.category}</Badge>
                                    )}
                                    {selectedDish.spiceLevel && (
                                        <Badge variant="outline">🌶️ {selectedDish.spiceLevel}</Badge>
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    onClick={() => handleAddToCart(selectedDish)}
                                    className="w-full bg-orange-600 hover:bg-orange-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add to Cart - {formatPrice(selectedDish.priceCents)}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Floating Cart Button */}
            {cartItems.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
                    <Button
                        onClick={() => navigate("/customer/cart")}
                        className="bg-orange-600 hover:bg-orange-700 shadow-lg px-6 py-6 text-base"
                    >
                        <span className="mr-2">
                            View Cart ({cartItems.reduce((sum, i) => sum + i.quantity, 0)} items)
                        </span>
                        <span className="font-bold">৳{total()}</span>
                    </Button>
                </div>
            )}
        </div>
    );
}
