import { useState, useRef } from "react";
import { Input } from "../../admin/components/ui/input";
import { Button } from "../../admin/components/ui/button";
import type { MenuItem } from "../types";
import { menuItemSchema, type MenuFormValues } from "../types/schemas";
import { Upload, X, Image as ImageIcon } from "lucide-react";

const categories = [
    "BIRYANI",
    "BURGER",
    "DESSERT",
    "DRINK",
    "PASTA",
    "PIZZA",
    "RICE_BOWL",
    "SALAD",
    "SEAFOOD",
    "SPECIAL",
] as const;

interface MenuFormProps {
    defaultValues?: Partial<MenuItem>;
    onSubmit: (values: MenuFormValues) => Promise<void>;
    onClose: () => void;
}

export function MenuForm({ defaultValues, onSubmit, onClose }: MenuFormProps) {
    const [values, setValues] = useState<MenuFormValues>({
        name: defaultValues?.name ?? "",
        description: defaultValues?.description ?? "",
        category: (defaultValues?.category as MenuFormValues["category"]) ?? "SPECIAL",
        price: defaultValues?.price ?? 0,
        cookingTime: defaultValues?.cookingTime ?? 10,
        spiceLevel: (defaultValues?.spiceLevel as MenuFormValues["spiceLevel"]) ?? "MEDIUM",
        imageUrl: defaultValues?.imageUrl ?? "",
        isAvailable: defaultValues?.isAvailable ?? true,
    });
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState<string>(defaultValues?.imageUrl ?? "");
    const [useUrlInput, setUseUrlInput] = useState<boolean>(!!(defaultValues?.imageUrl && !defaultValues.imageUrl.startsWith("data:")));
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please upload an image file");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("Image size must be less than 5MB");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setValues((prev) => ({ ...prev, imageUrl: base64 }));
            setImagePreview(base64);
            setError(null);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setValues((prev) => ({ ...prev, imageUrl: "" }));
        setImagePreview("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleChange = (field: keyof MenuFormValues, value: string | number | boolean) => {
        setValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            const parsed = menuItemSchema.parse({
                ...values,
                price: Number(values.price),
                cookingTime: Number(values.cookingTime),
            });
            setSubmitting(true);
            await onSubmit(parsed);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Invalid data");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
                <label className="text-sm text-slate-500">Dish name</label>
                <Input value={values.name} onChange={(e) => handleChange("name", e.target.value)} required />
            </div>
            <div>
                <label className="text-sm text-slate-500">Description</label>
                <textarea
                    className="min-h-[80px] w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
                    value={values.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    required
                />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <label className="text-sm text-slate-500">Category</label>
                    <select
                        className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
                        value={values.category}
                        onChange={(e) => handleChange("category", e.target.value)}
                    >
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category.replace("_", " ")}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-sm text-slate-500">Spice level</label>
                    <select
                        className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
                        value={values.spiceLevel}
                        onChange={(e) => handleChange("spiceLevel", e.target.value)}
                    >
                        <option value="MILD">Mild</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HOT">Hot</option>
                    </select>
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <label className="text-sm text-slate-500">Price (৳)</label>
                    <Input
                        type="number"
                        value={values.price}
                        onChange={(e) => handleChange("price", Number(e.target.value))}
                        min={0}
                        required
                    />
                </div>
                <div>
                    <label className="text-sm text-slate-500">Cooking time (minutes)</label>
                    <Input
                        type="number"
                        value={values.cookingTime}
                        onChange={(e) => handleChange("cookingTime", Number(e.target.value))}
                        min={1}
                        required
                    />
                </div>
            </div>
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-slate-500">Dish Image</label>
                    <button
                        type="button"
                        className="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400"
                        onClick={() => {
                            setUseUrlInput(!useUrlInput);
                            if (!useUrlInput) {
                                removeImage();
                            }
                        }}
                    >
                        {useUrlInput ? "Upload image instead" : "Use URL instead"}
                    </button>
                </div>
                {useUrlInput ? (
                    <Input
                        value={values.imageUrl}
                        onChange={(e) => {
                            handleChange("imageUrl", e.target.value);
                            setImagePreview(e.target.value);
                        }}
                        placeholder="https://example.com/dish-image.jpg"
                    />
                ) : (
                    <div className="space-y-3">
                        {imagePreview ? (
                            <div className="relative inline-block">
                                <img
                                    src={imagePreview}
                                    alt="Dish preview"
                                    className="h-32 w-32 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute -right-2 -top-2 rounded-full bg-rose-500 p-1 text-white hover:bg-rose-600 transition"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition hover:border-amber-400 hover:bg-amber-50/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-amber-500 dark:hover:bg-amber-500/5">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                                <div className="flex flex-col items-center gap-2">
                                    <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-500/10">
                                        <Upload className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Click to upload image
                                        </p>
                                        <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>
                                    </div>
                                </div>
                            </label>
                        )}
                    </div>
                )}
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900/60">
                <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Availability</p>
                    <p className="text-xs text-slate-500">Control if the dish is visible to diners</p>
                </div>
                <label className="inline-flex cursor-pointer items-center">
                    <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={values.isAvailable}
                        onChange={(e) => handleChange("isAvailable", e.target.checked)}
                    />
                    <span className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-emerald-500">
                        <span className="ml-1 mt-1 block h-4 w-4 rounded-full bg-white transition peer-checked:ml-6" />
                    </span>
                </label>
            </div>
            {error && <p className="text-sm text-rose-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Saving..." : "Save dish"}
            </Button>
        </form>
    );
}
