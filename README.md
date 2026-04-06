# Salama Ride - Kenyan Transport Booking Platform

Salama Ride is a premium, reliable, and safe transport booking platform specifically engineered for the Kenyan market. It provides a seamless, localized experience for users to book various ride types (Economy, Comfort, or Bodaboda) while giving administrators powerful tools to manage fleets, drivers, and complex logistics.

## 🇰🇪 Why Salama Ride?

Unlike generic ride-hailing templates, Salama Ride is built with the Kenyan context in mind:
- **Localized Pricing:** Fare estimations based on local traffic patterns and vehicle types.
- **M-Pesa Ready:** Designed for seamless mobile money integration.
- **Bodaboda Support:** Dedicated category for the most popular transport mode in Kenya.
- **Admin Control:** Full visibility into operations, from driver shifts to vehicle maintenance.

## 🚀 Features

### For Users
- **Google Authentication:** Secure login using Google accounts.
- **Real-time Booking:** Book rides from various locations in Kenya with instant fare estimation.
- **Ride History:** View past and current rides with status updates.
- **Profile Management:** Manage personal information and view account status.
- **M-Pesa Integration (Simulated):** Seamless payment flow designed for the Kenyan market.
- **Responsive Design:** Fully optimized for both desktop and mobile devices.

### For Administrators
- **Comprehensive Dashboard:** Overview of revenue, total rides, active drivers, and average ratings.
- **Driver Management:** Add, update, and remove drivers from the platform.
- **Fleet Management:** Track vehicle status (Available, In Use, Maintenance).
- **Route Management:** Define and manage common routes and base distances.
- **Operations Tracking:** Monitor driver shifts and leave requests.
- **Promotions & Discounts:** Create promo codes and "Happy Hour" discounts to boost engagement.
- **Ride Monitoring:** Real-time tracking and status management of all rides.

## 🛠 Tech Stack

- **Frontend:** React 19, Vite, TypeScript
- **Styling:** Tailwind CSS 4
- **Animations:** Motion (framer-motion)
- **Icons:** Lucide React
- **Backend/Database:** Firebase (Authentication & Firestore)
- **Routing:** React Router 7
- **Notifications:** Sonner (Toasts)
- **Form Handling:** React Hook Form & Zod
- **Maps:** Google Maps API (via `@react-google-maps/api`)

## 📂 Project Structure

```text
/src
  /components        # Reusable UI components (Navbar, Footer, AuthProvider, etc.)
  /lib               # Firebase configuration, types, and utility functions
  /pages             # Main application views (Home, Booking, Admin, etc.)
  /services          # (Optional) Logic for external API interactions
  App.tsx            # Main application entry and routing
  main.tsx           # React DOM rendering entry point
  index.css          # Global styles and Tailwind imports
/public              # Static assets
firestore.rules      # Security rules for Firestore database
vercel.json          # Deployment configuration for Vercel
```

## ⚙️ Setup and Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A Firebase project

### Local Development
1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd salama-ride
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your Firebase and Google Maps credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_FIRESTORE_DATABASE_ID=your_database_id
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## 🔥 Firebase Configuration

### Authentication
- Enable **Google Sign-In** in the Firebase Console.
- Add your deployment domains (e.g., `localhost`, `*.vercel.app`) to the **Authorized Domains** list.

### Firestore Database
- Create a Firestore database in **Production Mode**.
- Deploy the provided `firestore.rules` to ensure secure data access.

### Security Rules Highlights
- **Users:** Users can only read/write their own profile data.
- **Admins:** Specific users (identified by email) have full access to administrative collections.
- **Rides:** Users can create rides and read their own ride history.
- **Drivers/Fleet:** Publicly readable for booking, but only writable by admins.

## 🌐 Deployment

The project is optimized for deployment on **Vercel**.

1. Connect your GitHub repository to Vercel.
2. Configure the environment variables in the Vercel project settings.
3. Vercel will automatically detect the Vite build settings.
4. The `vercel.json` file ensures that client-side routing works correctly by redirecting all requests to `index.html`.

## 🛡 Security

- **Environment Variables:** Sensitive keys are never committed to version control.
- **Firestore Rules:** Strict server-side validation for all data operations.
- **Auth Guards:** Client-side route protection for the Admin Dashboard and User Profile.

## 📄 License

This project is licensed under the MIT License.
