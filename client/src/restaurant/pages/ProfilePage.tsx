import { useState, useRef } from "react";
import { Card } from "../../admin/components/ui/card";
import { Button } from "../../admin/components/ui/button";
import { Input } from "../../admin/components/ui/input";
import { useRestaurantStore } from "../store/restaurantStore";
import { profileSchema, type ProfileFormValues } from "../types/schemas";
import { Upload, X } from "lucide-react";

export function ProfilePage() {
    const profile = useRestaurantStore((state) => state.profile);
    const updateProfile = useRestaurantStore((state) => state.updateProfile);
    const [values, setValues] = useState<ProfileFormValues>({
        name: profile.name,
        address: profile.address,
        phone: profile.phone,
        category: profile.category,
        openingHours: profile.openingHours,
        closingHours: profile.closingHours,
        licenseNumber: profile.licenseNumber,
        logoUrl: profile.logoUrl ?? "",
        coverPhotoUrl: profile.coverPhotoUrl ?? "",
    });
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    
    // Image upload states
    const [logoPreview, setLogoPreview] = useState<string>(profile.logoUrl ?? "");
    const [coverPreview, setCoverPreview] = useState<string>(profile.coverPhotoUrl ?? "");
    const [useLogoUrl, setUseLogoUrl] = useState<boolean>(!!(profile.logoUrl && !profile.logoUrl.startsWith("data:")));
    const [useCoverUrl, setUseCoverUrl] = useState<boolean>(!!(profile.coverPhotoUrl && !profile.coverPhotoUrl.startsWith("data:")));
    const logoInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: "logoUrl" | "coverPhotoUrl",
        setPreview: (val: string) => void
    ) => {
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
            setValues((prev) => ({ ...prev, [field]: base64 }));
            setPreview(base64);
            setError(null);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = (
        field: "logoUrl" | "coverPhotoUrl",
        setPreview: (val: string) => void,
        inputRef: React.RefObject<HTMLInputElement>
    ) => {
        setValues((prev) => ({ ...prev, [field]: "" }));
        setPreview("");
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const handleChange = (field: keyof ProfileFormValues, value: string) => {
        setValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            const parsed = profileSchema.parse(values);
            setSubmitting(true);
            await updateProfile(parsed);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Invalid data");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm uppercase tracking-[0.4em] text-amber-500">Profile</p>
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Restaurant identity</h1>
                <p className="text-sm text-slate-500">Keep RideN'Bite diners updated with precise business information.</p>
            </div>

            <Card className="rounded-3xl border border-slate-100 p-6 dark:border-slate-900">
                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="text-sm text-slate-500">Restaurant name</label>
                            <Input value={values.name} onChange={(e) => handleChange("name", e.target.value)} />
                        </div>
                        <div>
                            <label className="text-sm text-slate-500">Category</label>
                            <Input value={values.category} onChange={(e) => handleChange("category", e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-slate-500">Address</label>
                        <textarea
                            className="min-h-[80px] w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
                            value={values.address}
                            onChange={(e) => handleChange("address", e.target.value)}
                        />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="text-sm text-slate-500">Phone</label>
                            <Input value={values.phone} onChange={(e) => handleChange("phone", e.target.value)} />
                        </div>
                        <div>
                            <label className="text-sm text-slate-500">Food license number</label>
                            <Input value={values.licenseNumber} onChange={(e) => handleChange("licenseNumber", e.target.value)} />
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="text-sm text-slate-500">Opening hour</label>
                            <Input type="time" value={values.openingHours} onChange={(e) => handleChange("openingHours", e.target.value)} />
                        </div>
                        <div>
                            <label className="text-sm text-slate-500">Closing hour</label>
                            <Input type="time" value={values.closingHours} onChange={(e) => handleChange("closingHours", e.target.value)} />
                        </div>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Logo Upload */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm text-slate-500">Restaurant Logo</label>
                                <button
                                    type="button"
                                    className="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400"
                                    onClick={() => {
                                        setUseLogoUrl(!useLogoUrl);
                                        if (!useLogoUrl) {
                                            removeImage("logoUrl", setLogoPreview, logoInputRef);
                                        }
                                    }}
                                >
                                    {useLogoUrl ? "Upload image instead" : "Use URL instead"}
                                </button>
                            </div>
                            {useLogoUrl ? (
                                <Input
                                    value={values.logoUrl}
                                    onChange={(e) => {
                                        handleChange("logoUrl", e.target.value);
                                        setLogoPreview(e.target.value);
                                    }}
                                    placeholder="https://example.com/logo.jpg"
                                />
                            ) : (
                                <div>
                                    {logoPreview ? (
                                        <div className="relative inline-block">
                                            <img
                                                src={logoPreview}
                                                alt="Logo preview"
                                                className="h-24 w-24 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage("logoUrl", setLogoPreview, logoInputRef)}
                                                className="absolute -right-2 -top-2 rounded-full bg-rose-500 p-1 text-white hover:bg-rose-600 transition"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 transition hover:border-amber-400 hover:bg-amber-50/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-amber-500 dark:hover:bg-amber-500/5">
                                            <input
                                                ref={logoInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleImageUpload(e, "logoUrl", setLogoPreview)}
                                            />
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-500/10">
                                                    <Upload className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                </div>
                                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Upload logo</p>
                                                <p className="text-xs text-slate-400">PNG, JPG up to 5MB</p>
                                            </div>
                                        </label>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Cover Photo Upload */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm text-slate-500">Cover Photo</label>
                                <button
                                    type="button"
                                    className="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400"
                                    onClick={() => {
                                        setUseCoverUrl(!useCoverUrl);
                                        if (!useCoverUrl) {
                                            removeImage("coverPhotoUrl", setCoverPreview, coverInputRef);
                                        }
                                    }}
                                >
                                    {useCoverUrl ? "Upload image instead" : "Use URL instead"}
                                </button>
                            </div>
                            {useCoverUrl ? (
                                <Input
                                    value={values.coverPhotoUrl}
                                    onChange={(e) => {
                                        handleChange("coverPhotoUrl", e.target.value);
                                        setCoverPreview(e.target.value);
                                    }}
                                    placeholder="https://example.com/cover.jpg"
                                />
                            ) : (
                                <div>
                                    {coverPreview ? (
                                        <div className="relative inline-block">
                                            <img
                                                src={coverPreview}
                                                alt="Cover preview"
                                                className="h-24 w-40 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage("coverPhotoUrl", setCoverPreview, coverInputRef)}
                                                className="absolute -right-2 -top-2 rounded-full bg-rose-500 p-1 text-white hover:bg-rose-600 transition"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 transition hover:border-amber-400 hover:bg-amber-50/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-amber-500 dark:hover:bg-amber-500/5">
                                            <input
                                                ref={coverInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleImageUpload(e, "coverPhotoUrl", setCoverPreview)}
                                            />
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-500/10">
                                                    <Upload className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                </div>
                                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Upload cover</p>
                                                <p className="text-xs text-slate-400">PNG, JPG up to 5MB</p>
                                            </div>
                                        </label>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    {error && <p className="text-sm text-rose-500">{error}</p>}
                    <Button type="submit" className="rounded-full px-6" disabled={submitting}>
                        {submitting ? "Saving" : "Save profile"}
                    </Button>
                </form>
            </Card>
        </div>
    );
}
