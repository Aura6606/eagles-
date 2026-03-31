import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation, CreditCard, CheckCircle2, Loader2, Info, ArrowRight, Star, Zap, Map as MapIcon } from 'lucide-react';
import { db, collection, addDoc, Timestamp, onSnapshot, handleFirestoreError, OperationType } from '../lib/firebase';
import { Driver, Ride, Route, Discount, HappyHour } from '../lib/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import MapComponent from '../components/GoogleMap';
import { useAuth } from '../components/AuthProvider';

export default function Booking() {
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [distance, setDistance] = useState(0);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [happyHours, setHappyHours] = useState<HappyHour[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  useEffect(() => {
    if (!authLoading && !profile) {
      navigate('/');
      toast.error('Please login to book a ride');
    }
  }, [profile, authLoading, navigate]);

  useEffect(() => {
    const unsubDrivers = onSnapshot(collection(db, 'drivers'), (s) => setDrivers(s.docs.map(d => ({ id: d.id, ...d.data() } as Driver))), (e) => handleFirestoreError(e, OperationType.GET, 'drivers'));
    const unsubRoutes = onSnapshot(collection(db, 'routes'), (s) => setRoutes(s.docs.map(d => ({ id: d.id, ...d.data() } as Route))), (e) => handleFirestoreError(e, OperationType.GET, 'routes'));
    const unsubDiscounts = onSnapshot(collection(db, 'discounts'), (s) => setDiscounts(s.docs.map(d => ({ id: d.id, ...d.data() } as Discount))), (e) => handleFirestoreError(e, OperationType.GET, 'discounts'));
    const unsubHappyHours = onSnapshot(collection(db, 'happyhours'), (s) => setHappyHours(s.docs.map(d => ({ id: d.id, ...d.data() } as HappyHour))), (e) => handleFirestoreError(e, OperationType.GET, 'happyhours'));

    return () => {
      unsubDrivers(); unsubRoutes(); unsubDiscounts(); unsubHappyHours();
    };
  }, []);

  const checkHappyHour = () => {
    const now = new Date();
    const currentTime = format(now, 'HH:mm');
    const currentDay = format(now, 'EEEE');

    return happyHours.find(h => 
      h.days.includes(currentDay) && 
      currentTime >= h.startTime && 
      currentTime <= h.endTime
    );
  };

  const activeHappyHour = checkHappyHour();

  const handleCalculateFare = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRoute) {
      setPickup(selectedRoute.pickup);
      setDestination(selectedRoute.destination);
      setDistance(selectedRoute.baseDistance);
    } else if (!pickup || !destination) {
      toast.error('Please enter both pickup and destination or select a route');
      return;
    } else {
      const randomDist = Math.floor(Math.random() * 18) + 2;
      setDistance(randomDist);
    }
    setStep(2);
  };

  const handleApplyPromo = () => {
    const discount = discounts.find(d => d.code === promoCode.toUpperCase() && d.active);
    if (discount) {
      setAppliedDiscount(discount);
      toast.success(`Promo code ${promoCode} applied!`);
    } else {
      toast.error('Invalid or expired promo code');
    }
  };

  const calculateTotalFare = (driver: Driver) => {
    let fare = distance * driver.pricePerKm;
    if (activeHappyHour) {
      fare = fare * (1 - activeHappyHour.discountPercentage / 100);
    }
    if (appliedDiscount) {
      fare = fare * (1 - appliedDiscount.percentage / 100);
    }
    return Math.round(fare);
  };

  const handleSelectDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setStep(3);
  };

  const handlePayment = async () => {
    if (!profile || !selectedDriver) return;
    
    setPaymentStatus('processing');

    toast.info(`M-Pesa STK Push sent to ${profile.phone || 'your phone'}...`);
    
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      const fare = distance * selectedDriver.pricePerKm;
      const newRide: Omit<Ride, 'id'> = {
        userId: profile.uid,
        driverId: selectedDriver.id,
        pickup,
        destination,
        distance,
        fare,
        status: 'Pending',
        createdAt: Timestamp.now()
      };

      const rideRef = await addDoc(collection(db, 'rides'), newRide);
      
      await addDoc(collection(db, 'payments'), {
        userId: profile.uid,
        rideId: rideRef.id,
        amount: fare,
        method: 'M-Pesa',
        status: 'Success',
        createdAt: Timestamp.now()
      });

      setPaymentStatus('success');
      toast.success('Payment Successful! Your ride is booked.');
      
      setTimeout(() => {
        navigate('/history');
      }, 2000);
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to complete booking. Please try again.');
      setPaymentStatus('idle');
    }
  };

  if (authLoading || !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Book Your Ride</h1>
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors ${step >= i ? 'bg-green-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
              </div>
              {i < 3 && <div className={`w-12 h-0.5 mx-2 ${step > i ? 'bg-green-500' : 'bg-zinc-800'}`} />}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="bg-zinc-900 p-8 rounded-3xl border border-white/5 space-y-8">
              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center space-x-2">
                  <MapIcon className="text-green-500 w-5 h-5" />
                  <span>Select a Predefined Route</span>
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {routes.map(r => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setSelectedRoute(r);
                        setPickup(r.pickup);
                        setDestination(r.destination);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        selectedRoute?.id === r.id ? 'bg-green-500/10 border-green-500' : 'bg-black border-white/10 hover:border-white/20'
                      }`}
                    >
                      <p className="font-bold text-sm">{r.name}</p>
                      <p className="text-xs text-zinc-500">{r.pickup} → {r.destination}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-zinc-900 px-2 text-zinc-500 font-bold tracking-widest">or enter manually</span></div>
              </div>

              <form onSubmit={handleCalculateFare} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Pickup Location"
                      value={pickup}
                      onChange={(e) => { setPickup(e.target.value); setSelectedRoute(null); }}
                      className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-green-500 outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Destination"
                      value={destination}
                      onChange={(e) => { setDestination(e.target.value); setSelectedRoute(null); }}
                      className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-green-500 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-500 text-black font-bold py-4 rounded-2xl hover:bg-green-400 transition-all active:scale-95 flex items-center justify-center group"
                >
                  Calculate Fare
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>

            <div className="bg-zinc-900 rounded-3xl border border-white/5 overflow-hidden min-h-[400px]">
              <MapComponent />
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-zinc-900 p-6 rounded-3xl border border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <Navigation className="text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Estimated Distance</p>
                  <p className="text-xl font-bold">{distance} km</p>
                </div>
              </div>
              <button onClick={() => setStep(1)} className="text-sm text-green-500 hover:underline">Change Route</button>
            </div>

            <h3 className="text-xl font-bold mb-4 px-2">Select Vehicle Type</h3>
            <div className="grid grid-cols-1 gap-4">
              {drivers.map((driver) => (
                <motion.div
                  key={driver.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectDriver(driver)}
                  className="bg-zinc-900 p-6 rounded-3xl border border-white/5 hover:border-green-500/50 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-black border border-white/10">
                      <img src={driver.imageUrl} alt={driver.vehicleType} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-lg font-bold">{driver.vehicleType}</h4>
                        <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{driver.carModel}</span>
                      </div>
                      <div className="flex items-center space-x-3 mt-1">
                        <div className="flex items-center text-yellow-500">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="ml-1 text-sm font-bold">{driver.rating}</span>
                        </div>
                        <span className="text-zinc-500 text-sm">•</span>
                        <span className="text-zinc-500 text-sm">{driver.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-500">KES {calculateTotalFare(driver)}</p>
                    <p className="text-xs text-zinc-500">KES {driver.pricePerKm}/km</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {activeHappyHour && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-2xl flex items-center space-x-4">
                <Zap className="text-yellow-500 w-6 h-6" />
                <div>
                  <p className="font-bold text-yellow-500">Happy Hour Active: {activeHappyHour.name}!</p>
                  <p className="text-xs text-zinc-400">Enjoy {activeHappyHour.discountPercentage}% off your ride automatically.</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {step === 3 && selectedDriver && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-zinc-900 p-8 rounded-3xl border border-white/5 max-w-lg mx-auto"
          >
            <h3 className="text-2xl font-bold mb-8 text-center">Booking Summary</h3>
            
            <div className="space-y-6 mb-8">
              <div className="flex justify-between items-start">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1 w-2 h-2 rounded-full bg-green-500" />
                    <div>
                      <p className="text-xs text-zinc-500 uppercase font-bold">Pickup</p>
                      <p className="font-medium">{pickup}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="mt-1 w-2 h-2 rounded-full bg-red-500" />
                    <div>
                      <p className="text-xs text-zinc-500 uppercase font-bold">Destination</p>
                      <p className="font-medium">{destination}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500 uppercase font-bold">Vehicle</p>
                  <p className="font-medium">{selectedDriver.vehicleType}</p>
                  <p className="text-xs text-zinc-500">{selectedDriver.carModel}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 space-y-3">
                <div className="flex justify-between text-zinc-400">
                  <span>Distance</span>
                  <span>{distance} km</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Base Fare</span>
                  <span>KES {distance * selectedDriver.pricePerKm}</span>
                </div>
                {activeHappyHour && (
                  <div className="flex justify-between text-yellow-500 text-sm">
                    <span>Happy Hour ({activeHappyHour.name})</span>
                    <span>-{activeHappyHour.discountPercentage}%</span>
                  </div>
                )}
                {appliedDiscount && (
                  <div className="flex justify-between text-green-500 text-sm">
                    <span>Promo Code ({appliedDiscount.code})</span>
                    <span>-{appliedDiscount.percentage}%</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold pt-3">
                  <span>Total Fare</span>
                  <span className="text-green-500">KES {calculateTotalFare(selectedDriver)}</span>
                </div>
              </div>

              {!appliedDiscount && (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter Promo Code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-green-500"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-all"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {paymentStatus === 'idle' && (
              <button
                onClick={handlePayment}
                className="w-full bg-green-500 text-black font-bold py-4 rounded-2xl hover:bg-green-400 transition-all flex items-center justify-center space-x-2"
              >
                <CreditCard className="w-5 h-5" />
                <span>Pay with M-Pesa</span>
              </button>
            )}

            {paymentStatus === 'processing' && (
              <div className="text-center py-4 space-y-4">
                <Loader2 className="w-10 h-10 text-green-500 animate-spin mx-auto" />
                <p className="text-zinc-400 animate-pulse">Processing M-Pesa Payment...</p>
                <p className="text-xs text-zinc-500">Please check your phone for the STK push</p>
              </div>
            )}

            {paymentStatus === 'success' && (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h4 className="text-xl font-bold">Payment Successful!</h4>
                <p className="text-zinc-400">Your driver is on the way.</p>
              </div>
            )}

            <button 
              onClick={() => setStep(2)} 
              disabled={paymentStatus !== 'idle'}
              className="w-full mt-4 text-zinc-500 hover:text-white transition-colors text-sm disabled:opacity-0"
            >
              Back to Vehicle Selection
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-12 p-6 bg-green-500/5 border border-green-500/10 rounded-2xl flex items-start space-x-4">
        <Info className="text-green-500 w-6 h-6 shrink-0" />
        <p className="text-sm text-zinc-400 leading-relaxed">
          <span className="text-green-500 font-bold">M-Pesa Simulation:</span> This app uses a simulation for payments. In a production environment, this would integrate with Safaricom's Daraja API to send a real STK push to your phone.
        </p>
      </div>
    </div>
  );
}
