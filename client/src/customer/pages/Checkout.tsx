import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CreditCard, MapPin, ShoppingBag, Truck, AlertCircle, Loader2, Plus, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../admin/components/ui/card";
import { Button } from "../../admin/components/ui/button";
import { Input } from "../../admin/components/ui/input";
import { Badge } from "../../admin/components/ui/badge";
import { useCartStore } from "../store/cartStore";
import { useAuth } from "../../context/AuthContext";
import { toast } from "../../admin/components/ui/use-toast";
import { customerApi, type Address } from "../services/customerApi";

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    category: string;
    restaurantId: string;
    restaurantName: string;
    deliveryFee: number;
    distance: string;
}

export function Checkout() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    useAuth(); // Ensure user is authenticated
    const {
        items: cartItems,
        getItemsByRestaurant,
        total,
        totalDeliveryFee,
        clearCart,
    } = useCartStore();

    // States
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        label: "Home",
        street: "",
        city: "",
        area: "",
    });
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(true);
    const [processingOrder, setProcessingOrder] = useState(false);

    const itemsByRestaurant = getItemsByRestaurant();
    const grandTotal = total() + totalDeliveryFee();

    // Handle payment callback from SSLCommerz
    useEffect(() => {
        const paymentStatus = searchParams.get("payment");
        const orderId = searchParams.get("orderId");

        if (paymentStatus === "success") {
            toast({
                title: "Payment Successful!",
                description: "Your order has been placed successfully.",
            });
            clearCart();
            navigate(`/customer/orders/${orderId || ""}`);
        } else if (paymentStatus === "failed") {
            toast({
                title: "Payment Failed",
                description: searchParams.get("error") || "Please try again.",
                variant: "destructive",
            });
        } else if (paymentStatus === "cancelled") {
            toast({
                title: "Payment Cancelled",
                description: "You cancelled the payment. Your cart is still intact.",
            });
        }
    }, [searchParams, clearCart, navigate]);

    // Fetch addresses
    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const addressList = await customerApi.getAddresses();
                setAddresses(addressList);
                const defaultAddress = addressList.find((a: Address) => a.isDefault);
                if (defaultAddress) {
                    setSelectedAddressId(defaultAddress.id);
                } else if (addressList.length > 0) {
                    setSelectedAddressId(addressList[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch addresses:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAddresses();
    }, []);

    const handleAddAddress = async () => {
        if (!newAddress.street || !newAddress.city) {
            toast({
                title: "Error",
                description: "Please fill in street and city",
                variant: "destructive",
            });
            return;
        }

        try {
            const created = await customerApi.createAddress({
                ...newAddress,
                isDefault: addresses.length === 0,
            });
            setAddresses([...addresses, created]);
            setSelectedAddressId(created.id);
            setShowNewAddressForm(false);
            setNewAddress({ label: "Home", street: "", city: "", area: "" });
            toast({
                title: "Address Added",
                description: "Your new address has been saved.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add address",
                variant: "destructive",
            });
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            toast({
                title: "Select Address",
                description: "Please select a delivery address",
                variant: "destructive",
            });
            return;
        }

        if (cartItems.length === 0) {
            toast({
                title: "Empty Cart",
                description: "Your cart is empty",
                variant: "destructive",
            });
            return;
        }

        const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
        if (!selectedAddress) return;

        setProcessingOrder(true);

        try {
            // Create orders for each restaurant (separate orders)
            for (const [restaurantId, data] of Object.entries(itemsByRestaurant)) {
                const typedData = data as { restaurant: { deliveryFee: number }; items: CartItem[] };
                const orderData = {
                    restaurantId,
                    items: typedData.items.map((item: CartItem) => ({
                        menuItemId: item.id,
                        quantity: item.quantity,
                    })),
                    deliveryAddress: `${selectedAddress.street}, ${selectedAddress.area || ""}, ${selectedAddress.city}`,
                    deliveryLat: selectedAddress.lat,
                    deliveryLng: selectedAddress.lng,
                    deliveryFee: typedData.restaurant.deliveryFee * 100, // Convert to cents
                    notes,
                };

                const order = await customerApi.createOrder(orderData);

                // Initiate payment for this order
                const paymentResult = await customerApi.initiatePayment(order.id);

                if (paymentResult.success && paymentResult.paymentUrl) {
                    // Redirect to SSLCommerz payment page
                    window.location.href = paymentResult.paymentUrl;
                    return;
                } else {
                    throw new Error(paymentResult.message || "Payment initialization failed");
                }
            }
        } catch (error: any) {
            console.error("Order error:", error);
            toast({
                title: "Order Failed",
                description: error.message || "Failed to place order. Please try again.",
                variant: "destructive",
            });
        } finally {
            setProcessingOrder(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
                    <p className="text-slate-500">Complete your order</p>
                </div>
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <ShoppingBag className="h-16 w-16 text-slate-300 mb-4" />
                        <h2 className="text-xl font-semibold text-slate-700">Your cart is empty</h2>
                        <p className="text-slate-500 mb-6">Add some items to proceed to checkout</p>
                        <Button onClick={() => navigate("/customer/restaurants")}>
                            Browse Restaurants
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
                <p className="text-slate-500">Complete your order</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column - Address & Items */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Delivery Address */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-orange-600" />
                                Delivery Address
                            </CardTitle>
                            <CardDescription>Select where to deliver your order</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {addresses.length === 0 && !showNewAddressForm ? (
                                <div className="text-center py-4">
                                    <AlertCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-slate-500 mb-4">No saved addresses</p>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowNewAddressForm(true)}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Address
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="grid gap-3">
                                        {addresses.map((address) => (
                                            <div
                                                key={address.id}
                                                onClick={() => setSelectedAddressId(address.id)}
                                                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                                                    selectedAddressId === address.id
                                                        ? "border-orange-500 bg-orange-50"
                                                        : "border-slate-200 hover:border-slate-300"
                                                }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{address.label}</span>
                                                            {address.isDefault && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    Default
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-slate-600 mt-1">
                                                            {address.street}
                                                            {address.area && `, ${address.area}`}
                                                        </p>
                                                        <p className="text-sm text-slate-500">{address.city}</p>
                                                    </div>
                                                    {selectedAddressId === address.id && (
                                                        <Check className="h-5 w-5 text-orange-600" />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {!showNewAddressForm && (
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowNewAddressForm(true)}
                                            className="w-full"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add New Address
                                        </Button>
                                    )}
                                </>
                            )}

                            {showNewAddressForm && (
                                <div className="border rounded-lg p-4 space-y-4">
                                    <h3 className="font-medium">Add New Address</h3>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="text-sm font-medium">Label</label>
                                            <select
                                                value={newAddress.label}
                                                onChange={(e) =>
                                                    setNewAddress({ ...newAddress, label: e.target.value })
                                                }
                                                className="w-full mt-1 px-3 py-2 border rounded-md"
                                            >
                                                <option value="Home">Home</option>
                                                <option value="Work">Work</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Area</label>
                                            <Input
                                                value={newAddress.area}
                                                onChange={(e) =>
                                                    setNewAddress({ ...newAddress, area: e.target.value })
                                                }
                                                placeholder="e.g., Dhanmondi"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="text-sm font-medium">Street Address *</label>
                                            <Input
                                                value={newAddress.street}
                                                onChange={(e) =>
                                                    setNewAddress({ ...newAddress, street: e.target.value })
                                                }
                                                placeholder="House no, Road, Block"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">City *</label>
                                            <Input
                                                value={newAddress.city}
                                                onChange={(e) =>
                                                    setNewAddress({ ...newAddress, city: e.target.value })
                                                }
                                                placeholder="e.g., Dhaka"
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button onClick={handleAddAddress}>Save Address</Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowNewAddressForm(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5 text-orange-600" />
                                Order Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {Object.entries(itemsByRestaurant).map(([restaurantId, data]) => (
                                <div key={restaurantId} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold">{data.restaurant.name}</h3>
                                        <div className="flex items-center gap-1 text-sm text-slate-500">
                                            <Truck className="h-4 w-4" />
                                            <span>৳{data.restaurant.deliveryFee} delivery</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {(data.items as CartItem[]).map((item: CartItem) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {item.image && (
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="h-12 w-12 rounded object-cover"
                                                        />
                                                    )}
                                                    <div>
                                                        <p className="font-medium">{item.name}</p>
                                                        <p className="text-sm text-slate-500">
                                                            ৳{item.price} × {item.quantity}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="font-medium">
                                                    ৳{item.price * item.quantity}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3 pt-3 border-t flex justify-between text-sm">
                                        <span>Subtotal</span>
                                        <span className="font-medium">
                                            ৳{(data.items as CartItem[]).reduce((sum: number, i: CartItem) => sum + i.price * i.quantity, 0)}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {/* Order Notes */}
                            <div>
                                <label className="text-sm font-medium">Order Notes (Optional)</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Any special instructions for the restaurant or rider..."
                                    className="w-full mt-1 px-3 py-2 border rounded-md resize-none h-20"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Order Summary */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-4">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Subtotal</span>
                                    <span>৳{total()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Delivery Fee</span>
                                    <span>৳{totalDeliveryFee()}</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between font-semibold">
                                    <span>Total</span>
                                    <span className="text-orange-600">৳{grandTotal}</span>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="border rounded-lg p-3 bg-slate-50">
                                <div className="flex items-center gap-2 mb-2">
                                    <CreditCard className="h-4 w-4 text-slate-600" />
                                    <span className="text-sm font-medium">Payment Method</span>
                                </div>
                                <p className="text-xs text-slate-500">
                                    You will be redirected to SSLCommerz secure payment gateway to complete your payment.
                                </p>
                            </div>

                            <Button
                                onClick={handlePlaceOrder}
                                disabled={processingOrder || !selectedAddressId}
                                className="w-full bg-orange-600 hover:bg-orange-700"
                            >
                                {processingOrder ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>Pay ৳{grandTotal}</>
                                )}
                            </Button>

                            <p className="text-xs text-center text-slate-500">
                                By placing this order, you agree to our Terms of Service
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
