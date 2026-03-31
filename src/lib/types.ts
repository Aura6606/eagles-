import type { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  name: string;
  phone: string;
  isAdmin: boolean;
  createdAt: Timestamp;
}

export interface Driver {
  id: string;
  name: string;
  vehicleType: 'Economy' | 'Comfort' | 'Bodaboda';
  carModel: string;
  plateNumber: string;
  rating: number;
  pricePerKm: number;
  imageUrl?: string;
}

export interface Ride {
  id: string;
  userId: string;
  driverId: string;
  pickup: string;
  destination: string;
  distance: number;
  fare: number;
  status: 'Pending' | 'Accepted' | 'Completed' | 'Cancelled';
  createdAt: Timestamp;
}

export interface Payment {
  id: string;
  userId: string;
  rideId: string;
  amount: number;
  method: string;
  status: string;
  createdAt: Timestamp;
}

export interface Route {
  id: string;
  name: string;
  pickup: string;
  destination: string;
  baseDistance: number;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  type: string;
  status: 'Available' | 'In Use' | 'Maintenance';
}

export interface DriverLeave {
  id: string;
  driverId: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface WorkShift {
  id: string;
  driverId: string;
  day: string;
  startTime: string;
  endTime: string;
}

export interface Discount {
  id: string;
  code: string;
  percentage: number;
  expiryDate?: string;
  active: boolean;
}

export interface HappyHour {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  discountPercentage: number;
  days: string[];
}
