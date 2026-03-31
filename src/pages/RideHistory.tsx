import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { db, collection, query, where, orderBy, onSnapshot, doc, getDoc, handleFirestoreError, OperationType } from '../lib/firebase';
import { Ride, Driver } from '../lib/types';
import { History, Car, Calendar, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface RideWithDriver extends Ride {
  driver?: Driver;
}

export default function RideHistory() {
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [rides, setRides] = useState<RideWithDriver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !profile) {
      navigate('/');
      toast.error('Please login to view history');
    }
  }, [profile, authLoading, navigate]);

  useEffect(() => {
    if (!profile) return;

    const q = query(
      collection(db, 'rides'),
      where('userId', '==', profile.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const ridesList: RideWithDriver[] = [];
      
      for (const rideDoc of snapshot.docs) {
        const rideData = { id: rideDoc.id, ...rideDoc.data() } as Ride;
        
        const driverDoc = await getDoc(doc(db, 'drivers', rideData.driverId));
        const driverData = driverDoc.exists() ? (driverDoc.data() as Driver) : undefined;
        
        ridesList.push({ ...rideData, driver: driverData });
      }
      
      setRides(ridesList);
      setLoading(false);
    }, (e) => handleFirestoreError(e, OperationType.GET, 'rides'));

    return () => unsubscribe();
  }, [profile]);

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin h-12 w-12 text-green-500" />
        <p className="text-zinc-500">Loading your ride history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center space-x-4 mb-12">
        <div className="p-3 bg-green-500/10 rounded-2xl">
          <History className="text-green-500 w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Ride History</h1>
          <p className="text-zinc-500">View and track all your previous journeys.</p>
        </div>
      </div>

      {rides.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900 rounded-3xl border border-white/5">
          <Car className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No rides found</h3>
          <p className="text-zinc-500">You haven't booked any rides yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {rides.map((ride, idx) => (
            <motion.div
              key={ride.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-zinc-900 p-6 rounded-3xl border border-white/5 hover:border-green-500/20 transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-zinc-500">
                      <Calendar className="w-4 h-4" />
                      <span>{ride.createdAt?.toDate ? format(ride.createdAt.toDate(), 'PPP p') : 'Recently'}</span>
                    </div>
                    <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      ride.status === 'Completed' ? 'bg-green-500/10 text-green-500' :
                      ride.status === 'Cancelled' ? 'bg-red-500/10 text-red-500' :
                      'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {ride.status === 'Completed' && <CheckCircle2 className="w-3 h-3" />}
                      {ride.status === 'Cancelled' && <XCircle className="w-3 h-3" />}
                      {ride.status === 'Pending' && <Clock className="w-3 h-3" />}
                      <span>{ride.status}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1.5 w-2 h-2 rounded-full bg-green-500 shrink-0" />
                        <div>
                          <p className="text-[10px] text-zinc-500 uppercase font-bold">Pickup</p>
                          <p className="text-sm font-medium">{ride.pickup}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="mt-1.5 w-2 h-2 rounded-full bg-red-500 shrink-0" />
                        <div>
                          <p className="text-[10px] text-zinc-500 uppercase font-bold">Destination</p>
                          <p className="text-sm font-medium">{ride.destination}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 bg-black/40 rounded-2xl border border-white/5">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800">
                        {ride.driver?.imageUrl ? (
                          <img src={ride.driver.imageUrl} alt={ride.driver.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <Car className="w-full h-full p-3 text-zinc-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 uppercase font-bold">Driver</p>
                        <p className="text-sm font-bold">{ride.driver?.name || 'Assigned Driver'}</p>
                        <p className="text-[10px] text-zinc-500">{ride.driver?.carModel} • {ride.driver?.plateNumber}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:text-right md:min-w-[120px] pt-4 md:pt-0 border-t md:border-t-0 border-white/5 flex md:flex-col items-center md:items-end justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase font-bold">Fare Paid</p>
                    <p className="text-2xl font-bold text-green-500">KES {ride.fare}</p>
                  </div>
                  <div className="md:mt-2">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">Distance</p>
                    <p className="text-sm font-medium">{ride.distance} km</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
