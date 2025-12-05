import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Clock, MapPin, Plus, Minus, Heart, Loader2 } from "lucide-react";
import { Card } from "../../admin/components/ui/card";
import { Button } from "../../admin/components/ui/button";
import { Badge } from "../../admin/components/ui/badge";
import { useCartStore, type Restaurant } from "../store/cartStore";
import { toast } from "../../admin/components/ui/use-toast";
import { customerApi, type Restaurant as ApiRestaurant, type MenuItem } from "../services/customerApi";

// Menu categories defined as string type for flexibility

const categoryLabels: Record<string, string> = {
    BIRYANI: "Biryani",
    BURGER: "Burgers",
    DESSERT: "Desserts",
    DRINK: "Drinks",
    PASTA: "Pasta",
    PIZZA: "Pizza",
    RICE_BOWL: "Rice Bowls",
    SALAD: "Salads",
    SEAFOOD: "Seafood",
    SPECIAL: "Specials",
};

const categoryOrder: string[] = [
    "SPECIAL",
    "BIRYANI",
    "BURGER",
    "PIZZA",
    "PASTA",
    "SEAFOOD",
    "RICE_BOWL",
    "SALAD",
    "DRINK",
    "DESSERT",
];

export function RestaurantDetail() {
    const { restaurantId } = useParams();
    const navigate = useNavigate();

    const [restaurant, setRestaurant] = useState<ApiRestaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);

    const {
        items: cartItems,
        addItem,
    } = useCartStore();

    useEffect(() => {
        const fetchRestaurant = async () => {
            if (!restaurantId) return;
            
            setLoading(true);
            setError(null);
            
            try {
                const data = await customerApi.getRestaurantById(restaurantId);
                setRestaurant(data);
                
                // Check if restaurant is favorited
                try {
                    const favorites = await customerApi.getFavorites();
                    setIsFavorite(favorites.some((f: { restaurantId?: string }) => f.restaurantId === restaurantId));
                } catch {
                    // User might not be logged in
                }
            } catch (err) {
                console.error("Error fetching restaurant:", err);
                setError("Failed to load restaurant details");
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurant();
    }, [restaurantId]);

    const handleToggleFavorite = async () => {
        if (!restaurant) return;
        
        setFavoriteLoading(true);
        try {
            if (isFavorite) {
                // Find favorite id and remove
                const favorites = await customerApi.getFavorites();
                const fav = favorites.find((f: { id: string; restaurantId?: string }) => f.restaurantId === restaurant.id);
                if (fav) {
                    await customerApi.removeFavorite(fav.id);
                }
                setIsFavorite(false);
                toast({
                    title: "Removed from favorites",
                    description: `${restaurant.name} has been removed from your favorites`,
                });
            } else {
                await customerApi.addFavorite({ restaurantId: restaurant.id });
                setIsFavorite(true);
                toast({
                    title: "Added to favorites",
                    description: `${restaurant.name} has been added to your favorites`,
                });
            }
        } catch (err) {
            console.error("Error toggling favorite:", err);
            toast({
                title: "Error",
                description: "Please log in to manage favorites",
                variant: "destructive",
            });
        } finally {
            setFavoriteLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                <p className="mt-4 text-slate-500">Loading restaurant...</p>
            </div>
        );
    }

    if (error || !restaurant) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <h2 className="text-2xl font-semibold">Restaurant not found</h2>
                <p className="text-slate-500 mt-2">{error}</p>
                <Button
                    onClick={() => navigate("/customer/restaurants")}
                    className="mt-4"
                >
                    Browse Restaurants
                </Button>
            </div>
        );
    }

    // Determine if restaurant is open (based on status or hours)
    const isOpen = restaurant.status === "ACTIVE";
    
    // Default cover image if not available
    const coverImage = restaurant.storefrontImage || 
        "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200";
    
    // Group menu items by category
    const menuItems = restaurant.menuItems || [];
    const menuByCategory = menuItems.reduce((acc: Record<string, MenuItem[]>, item: MenuItem) => {
        const category = item.category || "SPECIAL";
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {} as Record<string, MenuItem[]>);

    // Get categories that have items, in order
    const availableCategories = categoryOrder.filter(
        (cat) => menuByCategory[cat] && menuByCategory[cat].length > 0
    );

    // Add any categories not in our predefined order
    Object.keys(menuByCategory).forEach(cat => {
        if (!availableCategories.includes(cat)) {
            availableCategories.push(cat);
        }
    });

    const handleAddToCart = (item: MenuItem) => {
        const cartItem = {
            id: item.id,
            name: item.name,
            price: item.priceCents / 100, // Convert cents to currency
            quantity: 1,
            image: item.image || undefined,
            category: item.category ? (categoryLabels[item.category] || item.category) : "Other",
        };

        const restaurantData: Restaurant = {
            id: restaurant.id,
            name: restaurant.name,
            image: restaurant.storefrontImage || "",
            deliveryFee: 50, // Default delivery fee
            distance: "N/A",
        };

        addItem(cartItem, restaurantData);
        toast({
            title: "Added to cart",
            description: `${item.name} has been added to your cart`,
        });
    };

    const getItemQuantityInCart = (itemId: string) => {
        const item = cartItems.find((i) => i.id === itemId);
        return item?.quantity || 0;
    };

    const formatPrice = (priceCents: number) => {
        return `৳${(priceCents / 100).toFixed(0)}`;
    };

    return (
        <div className="space-y-6">
            {/* Back Button & Cover Image */}
            <div className="relative">
                <div className="h-48 md:h-64 w-full overflow-hidden rounded-xl">
                    <img
                        src={coverImage}
                        alt={restaurant.name}
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 rounded-full bg-white/90 hover:bg-white"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleToggleFavorite}
                    disabled={favoriteLoading}
                    className="absolute top-4 right-4 rounded-full bg-white/90 hover:bg-white"
                >
                    <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
            </div>

            {/* Restaurant Info */}
            <div className="flex flex-col md:flex-row md:items-start gap-4">
                <img
                    src={restaurant.storefrontImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400"}
                    alt={restaurant.name}
                    className="h-24 w-24 rounded-lg object-cover border-4 border-white shadow-lg -mt-12 md:-mt-16 ml-4 z-10"
                />
                <div className="flex-1 px-4 md:px-0">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold">{restaurant.name}</h1>
                        <Badge className={isOpen ? "bg-green-500" : "bg-red-500"}>
                            {isOpen ? "Open" : "Closed"}
                        </Badge>
                    </div>
                    <p className="text-slate-500">{restaurant.cuisine || "Multi-Cuisine"}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                        <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{restaurant.rating?.toFixed(1) || "New"}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500">
                            <Clock className="h-4 w-4" />
                            <span>25-35 min</span>
                        </div>
                        <div className="text-slate-600">
                            Delivery: ৳50
                        </div>
                    </div>
                    {restaurant.address && (
                        <p className="text-sm text-slate-500 mt-2">
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {restaurant.address}
                        </p>
                    )}
                    {restaurant.description && (
                        <p className="text-sm text-slate-600 mt-2">{restaurant.description}</p>
                    )}
                </div>
            </div>

            {/* Category Navigation */}
            {availableCategories.length > 0 && (
                <div className="sticky top-0 z-20 bg-white border-b border-slate-200 -mx-6 px-6 py-3">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {availableCategories.map((category) => (
                            <a
                                key={category}
                                href={`#${category}`}
                                className="flex-shrink-0 px-4 py-2 rounded-full bg-slate-100 hover:bg-orange-100 hover:text-orange-600 text-sm font-medium transition-colors"
                            >
                                {categoryLabels[category] || category}
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Menu Sections */}
            {availableCategories.length > 0 ? (
                <div className="space-y-8">
                    {availableCategories.map((category) => (
                        <section key={category} id={category}>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                {categoryLabels[category] || category}
                                <span className="text-sm font-normal text-slate-500">
                                    ({menuByCategory[category].length} items)
                                </span>
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {menuByCategory[category].map((item: MenuItem) => {
                                    const quantityInCart = getItemQuantityInCart(item.id);
                                    return (
                                        <Card key={item.id} className="overflow-hidden">
                                            <div className="flex">
                                                <div className="flex-1 p-4">
                                                    <h3 className="font-semibold text-slate-900">
                                                        {item.name}
                                                    </h3>
                                                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                                                        {item.description || "Delicious dish from our kitchen"}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-lg font-bold text-orange-600">
                                                            {formatPrice(item.priceCents)}
                                                        </span>
                                                        {item.spiceLevel && (
                                                            <Badge
                                                                variant="outline"
                                                                className={
                                                                    item.spiceLevel === "HOT"
                                                                        ? "border-red-500 text-red-500"
                                                                        : item.spiceLevel === "MEDIUM"
                                                                        ? "border-orange-500 text-orange-500"
                                                                        : "border-green-500 text-green-500"
                                                                }
                                                            >
                                                                {item.spiceLevel}
                                                            </Badge>
                                                        )}
                                                        {!item.available && (
                                                            <Badge variant="secondary">
                                                                Unavailable
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="mt-3">
                                                        {quantityInCart > 0 ? (
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={() =>
                                                                        useCartStore
                                                                            .getState()
                                                                            .updateQuantity(
                                                                                item.id,
                                                                                quantityInCart - 1
                                                                            )
                                                                    }
                                                                >
                                                                    <Minus className="h-4 w-4" />
                                                                </Button>
                                                                <span className="w-8 text-center font-medium">
                                                                    {quantityInCart}
                                                                </span>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={() =>
                                                                        useCartStore
                                                                            .getState()
                                                                            .updateQuantity(
                                                                                item.id,
                                                                                quantityInCart + 1
                                                                            )
                                                                    }
                                                                >
                                                                    <Plus className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleAddToCart(item)}
                                                                disabled={!item.available || !isOpen}
                                                                className="bg-orange-600 hover:bg-orange-700"
                                                            >
                                                                <Plus className="h-4 w-4 mr-1" />
                                                                Add to Cart
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                                {item.image && (
                                                    <div className="w-32 h-32 flex-shrink-0">
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-slate-500">No menu items available yet.</p>
                </div>
            )}

            {/* Floating Cart Button (when items in cart) */}
            {cartItems.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
                    <Button
                        onClick={() => navigate("/customer/cart")}
                        className="bg-orange-600 hover:bg-orange-700 shadow-lg px-6 py-6 text-base"
                    >
                        <span className="mr-2">
                            View Cart ({cartItems.reduce((sum, i) => sum + i.quantity, 0)} items)
                        </span>
                        <span className="font-bold">
                            ৳{(useCartStore.getState().total() || 0).toFixed(0)}
                        </span>
                    </Button>
                </div>
            )}
        </div>
    );
}
