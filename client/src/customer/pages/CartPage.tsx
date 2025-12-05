import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../admin/components/ui/card";
import { Button } from "../../admin/components/ui/button";
import { useCartStore } from "../store/cartStore";

export function CartPage() {
    const navigate = useNavigate();
    const {
        items,
        updateQuantity,
        removeItem,
        clearCart,
        clearRestaurantItems,
        subtotal,
        totalDeliveryFee,
        total,
        getItemsByRestaurant,
        getRestaurants,
    } = useCartStore();

    const itemsByRestaurant = getItemsByRestaurant();
    const restaurants = getRestaurants();

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
                    <ShoppingBag className="h-12 w-12 text-slate-400" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-900">Your cart is empty</h2>
                <p className="text-slate-500 text-center max-w-md">
                    Looks like you haven't added anything to your cart yet. 
                    Browse restaurants and start ordering!
                </p>
                <Button
                    onClick={() => navigate("/customer/restaurants")}
                    className="bg-orange-600 hover:bg-orange-700"
                >
                    Browse Restaurants
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="rounded-full"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Your Cart</h1>
                    <p className="text-slate-500">
                        {restaurants.length} restaurant{restaurants.length > 1 ? "s" : ""} • {items.length} item{items.length > 1 ? "s" : ""}
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Cart Items by Restaurant */}
                <div className="lg:col-span-2 space-y-4">
                    {Array.from(itemsByRestaurant.entries()).map(([restaurantId, { restaurant, items: restaurantItems }]) => (
                        <Card key={restaurantId}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div>
                                    <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                        <MapPin className="h-3 w-3" />
                                        <span>{restaurant.distance}</span>
                                        <span>•</span>
                                        <span>Delivery: ৳{restaurant.deliveryFee}</span>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => clearRestaurantItems(restaurantId)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Remove all
                                </Button>
                            </CardHeader>
                            <CardContent className="divide-y">
                                {restaurantItems.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                                        {/* Item Image */}
                                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <ShoppingBag className="h-6 w-6 text-slate-400" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Item Details */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-slate-900 truncate">
                                                {item.name}
                                            </h3>
                                            {item.category && (
                                                <p className="text-sm text-slate-500">{item.category}</p>
                                            )}
                                            <p className="text-orange-600 font-medium mt-1">
                                                ৳{item.price}
                                            </p>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            >
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <span className="w-8 text-center font-medium">
                                                {item.quantity}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {/* Item Total */}
                                        <div className="text-right min-w-[70px]">
                                            <p className="font-semibold text-slate-900">
                                                ৳{item.price * item.quantity}
                                            </p>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeItem(item.id)}
                                                className="text-red-600 hover:text-red-700 h-auto p-0 mt-1"
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}

                    {/* Clear All Button */}
                    <div className="flex justify-end">
                        <Button
                            variant="outline"
                            onClick={clearCart}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear Entire Cart
                        </Button>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Subtotal</span>
                                    <span className="font-medium">৳{subtotal()}</span>
                                </div>
                                
                                {/* Delivery fees breakdown */}
                                <div className="space-y-1">
                                    <p className="text-sm text-slate-600">Delivery Fees:</p>
                                    {restaurants.map((restaurant) => (
                                        <div key={restaurant.id} className="flex justify-between text-sm pl-3">
                                            <span className="text-slate-500">
                                                {restaurant.name}
                                                <span className="text-slate-400 ml-1">({restaurant.distance})</span>
                                            </span>
                                            <span className="font-medium">৳{restaurant.deliveryFee}</span>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="flex justify-between text-sm pt-1 border-t border-dashed">
                                    <span className="text-slate-600">Total Delivery</span>
                                    <span className="font-medium">৳{totalDeliveryFee()}</span>
                                </div>
                            </div>

                            <hr className="border-slate-200" />

                            <div className="flex justify-between">
                                <span className="font-semibold">Grand Total</span>
                                <span className="text-xl font-bold text-orange-600">
                                    ৳{total()}
                                </span>
                            </div>

                            {restaurants.length > 1 && (
                                <p className="text-xs text-slate-500 bg-amber-50 p-2 rounded-lg">
                                    Note: Your order will be placed as {restaurants.length} separate orders, one for each restaurant.
                                </p>
                            )}

                            <Button
                                className="w-full bg-orange-600 hover:bg-orange-700"
                                size="lg"
                            >
                                Proceed to Checkout
                            </Button>

                            <p className="text-xs text-center text-slate-500">
                                By placing your order, you agree to our terms and conditions
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
