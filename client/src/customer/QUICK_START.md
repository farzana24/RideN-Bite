# Customer Module - Quick Start Guide

## Access the Customer Module

### Routes
- **Registration:** `/customer/register`
- **Dashboard:** `/customer` (requires authentication)
- **Profile:** `/customer/profile`
- **Order History:** `/customer/orders`
- **Active Order:** `/customer/orders/:orderId`
- **Restaurants:** `/customer/restaurants`
- **Settings:** `/customer/settings`

### Testing Without Authentication
To test the customer module, you'll need to:

1. **Option 1: Create a customer account**
   - Navigate to `/customer/register`
   - Fill out the registration form
   - Login with customer credentials

2. **Option 2: Modify existing user role**
   - Update a test user's role to 'CUSTOMER' in the database
   - Login with those credentials

3. **Option 3: Temporarily disable authentication**
   - Comment out the `ProtectedRoute` wrapper in `App.tsx`
   - Access `/customer` directly

## Page Overview

### 1. Registration (`/customer/register`)
**Purpose:** New user sign-up with profile picture upload
**Features:**
- Profile picture upload with preview
- Two-column form (full name, email, phone, password)
- Full-width delivery address field
- Terms and conditions checkbox
- Link to login page

### 2. Dashboard (`/customer`)
**Purpose:** Main landing page for customers
**Sections:**
- **Hero Search Bar:** Large search with gradient background
- **Active Order Tracker:** 5-stage timeline showing order progress
- **Offers Banner:** 2 promotional cards
- **Recommended Dishes:** 4-column grid of food items
- **Nearby Restaurants:** 3-column grid of restaurants

### 3. Profile (`/customer/profile`)
**Purpose:** Manage personal information and settings
**Sections:**
- **Profile Header:** Avatar, name, email, badges, edit button
- **Personal Details:** Name, email, phone (editable)
- **Delivery Address:** Address textarea with add new button
- **Change Password:** Current, new, confirm password fields

### 4. Order History (`/customer/orders`)
**Purpose:** View past and current orders
**Features:**
- Search orders by ID or restaurant
- Filter by status (All, Delivered, Cooking, Cancelled)
- Date range filter
- Table with order details
- View Details and Reorder buttons

### 5. Active Order (`/customer/orders/:orderId`)
**Purpose:** Track current order in real-time
**Layout:**
- **Left:** Order timeline (5 stages) and item details
- **Right:** Delivery address, restaurant info, rider info
**Features:**
- Visual progress indicator
- ETA badge at top
- Call restaurant/rider buttons
- Price breakdown

### 6. Restaurant List (`/customer/restaurants`)
**Purpose:** Browse and search restaurants
**Features:**
- Full-width search bar
- Sort by: Recommended, Rating, Delivery Time, Distance
- Filter pills (Fast Delivery, Top Rated, Free Delivery, etc.)
- 3-column grid of restaurant cards
- Open/Closed badges
- Promoted restaurant badges

### 7. Settings (`/customer/settings`)
**Purpose:** Configure notifications and preferences
**Sections:**
- **Notification Preferences:** 5 toggle switches
  - Email Alerts
  - SMS Alerts
  - Push Notifications
  - Order Updates
  - Promotions & Offers
- **Appearance:** Dark mode toggle
- Save/Cancel buttons

## UI Components

### Sidebar Navigation (Left)
- **Logo** at top
- **5 Navigation Items:**
  1. Dashboard (Home icon) - Orange when active
  2. Orders (Package icon)
  3. Restaurants (Store icon)
  4. Profile (User icon)
  5. Settings (Settings icon)
- **Logout Button** at bottom (red hover)

### Top Navigation Bar
- **Search Bar** (left side)
- **Cart Icon** with count badge (3)
- **Notifications Icon** with count badge (2)
- **Profile Dropdown** (right side)
  - Avatar with name
  - Dropdown menu: View Profile, Settings, Logout

## Design Details

### Color Scheme
- **Primary:** Orange (#EA580C - orange-600)
- **Hover:** Dark Orange (#C2410C - orange-700)
- **Background:** Light Gray (#F8FAFC - slate-50)
- **Text:** Dark Slate (#0F172A - slate-900)
- **Muted:** Medium Slate (#64748B - slate-500)

### Icons (Lucide React)
All icons use Lucide React library:
- Home, Package, Store, User, Settings (navigation)
- Search, Phone, Mail, Upload (actions)
- Star, Clock, Bike, MapPin (info)
- CheckCircle2, Truck (status)

### Card Component
Following admin design:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title Here</CardTitle>
    <CardDescription>Description text</CardDescription>
  </CardHeader>
  <CardContent>
    // Content here
  </CardContent>
</Card>
```

### Badge Component
Color-coded statuses:
- **Green:** Delivered
- **Orange:** Cooking/On The Way
- **Red:** Cancelled
- **Blue:** Info/Promoted

### Table Component
Admin-style table for Order History:
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column Name</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Data</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## Mock Data Available

### Recommended Dishes (4 items)
- Beef Biryani - ৳350
- Chicken Tikka - ৳280
- Naan Bread - ৳30
- Various other items

### Nearby Restaurants (6 items)
- Dhaka Spice House (Indian, Bengali)
- Burger Junction (American, Burgers)
- Grill Masters (BBQ, Grilled)
- Chinese Express (Chinese, Asian)
- Pizza Paradise (Italian, Pizza)
- Sushi Station (Japanese, Sushi)

### Orders (4 items)
- ORD-12345 to ORD-12342
- Statuses: Delivered, Cancelled
- Total amounts: ৳560-1250

## Responsive Breakpoints

- **Mobile:** < 768px (single column)
- **Tablet:** 768px - 1024px (2 columns)
- **Desktop:** > 1024px (3-4 columns)

### Grid Layouts
- Restaurant Cards: 1 → 2 → 3 columns
- Recommended Dishes: 1 → 2 → 4 columns
- Registration Form: Stacked → 2 columns

## Testing Checklist

- [ ] Registration form displays correctly
- [ ] Profile picture upload works
- [ ] Dashboard loads with all sections
- [ ] Active order tracker shows current stage
- [ ] Navigation between pages works
- [ ] Sidebar highlights active page
- [ ] Cart and notification badges visible
- [ ] Order history table displays orders
- [ ] Active order page shows timeline
- [ ] Restaurant list grid displays correctly
- [ ] Settings toggles work
- [ ] All icons render properly
- [ ] Responsive design works on mobile

## Browser Support

Tested with:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Notes

### To modify colors:
Search for `orange-600` and `orange-700` in customer files and replace with your desired color.

### To add new navigation items:
Edit `CustomerSidebar.tsx` and add to the `navItems` array.

### To customize mock data:
Edit the data objects at the top of each page component.

### To add new pages:
1. Create new page component in `customer/pages/`
2. Add route in `CustomerApp.tsx`
3. Add navigation item in `CustomerSidebar.tsx`

## Support

For issues or questions, refer to:
- [Customer Module README](./README.md) - Detailed documentation
- Admin components in `admin/components/ui/` - Reusable UI components
- [Lucide React Icons](https://lucide.dev/) - Icon library documentation
- [Tailwind CSS](https://tailwindcss.com/) - Styling documentation

---

**Status:** ✅ Ready for use
**Last Updated:** January 2025
