import React, { useState, useEffect } from 'react';
import { db, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, handleFirestoreError, OperationType } from '../lib/firebase';
import { Driver, Ride, Route, Vehicle, DriverLeave, WorkShift, Discount, HappyHour } from '../lib/types';
import { LayoutDashboard, Users, Car, CreditCard, Trash2, TrendingUp, Star, Map as MapIcon, Calendar, Percent, Zap, Truck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';

type AdminTab = 'overview' | 'drivers' | 'rides' | 'fleet' | 'routes' | 'ops' | 'promos';

export default function AdminDashboard() {
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [happyHours, setHappyHours] = useState<HappyHour[]>([]);
  const [leaves, setLeaves] = useState<DriverLeave[]>([]);
  const [shifts, setShifts] = useState<WorkShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isAddingDriver, setIsAddingDriver] = useState(false);
  const [isAddingRoute, setIsAddingRoute] = useState(false);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [isAddingDiscount, setIsAddingDiscount] = useState(false);
  const [isAddingHappyHour, setIsAddingHappyHour] = useState(false);
  const [isAddingLeave, setIsAddingLeave] = useState(false);
  const [isAddingShift, setIsAddingShift] = useState(false);

  const [newDriver, setNewDriver] = useState<Omit<Driver, 'id'>>({
    name: '',
    vehicleType: 'Economy',
    carModel: '',
    plateNumber: '',
    rating: 5.0,
    pricePerKm: 30,
    imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=400'
  });

  const [newRoute, setNewRoute] = useState<Omit<Route, 'id'>>({
    name: '',
    pickup: '',
    destination: '',
    baseDistance: 0
  });

  const [newVehicle, setNewVehicle] = useState<Omit<Vehicle, 'id'>>({
    plateNumber: '',
    model: '',
    type: 'Economy',
    status: 'Available'
  });

  const [newDiscount, setNewDiscount] = useState<Omit<Discount, 'id'>>({
    code: '',
    percentage: 0,
    active: true
  });

  const [newHappyHour, setNewHappyHour] = useState<Omit<HappyHour, 'id'>>({
    name: '',
    startTime: '17:00',
    endTime: '19:00',
    discountPercentage: 15,
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  });

  const [newLeave, setNewLeave] = useState<Omit<DriverLeave, 'id'>>({
    driverId: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    reason: ''
  });

  const [newShift, setNewShift] = useState<Omit<WorkShift, 'id'>>({
    driverId: '',
    day: 'Monday',
    startTime: '08:00',
    endTime: '17:00'
  });

  useEffect(() => {
    if (!authLoading && (!profile || !profile.isAdmin)) {
      navigate('/');
      toast.error('Access denied. Admins only.');
    }
  }, [profile, authLoading, navigate]);

  useEffect(() => {
    const unsubDrivers = onSnapshot(collection(db, 'drivers'), (s) => setDrivers(s.docs.map(d => ({ id: d.id, ...d.data() } as Driver))), (e) => handleFirestoreError(e, OperationType.GET, 'drivers'));
    const unsubRides = onSnapshot(query(collection(db, 'rides'), orderBy('createdAt', 'desc')), (s) => setRides(s.docs.map(d => ({ id: d.id, ...d.data() } as Ride))), (e) => handleFirestoreError(e, OperationType.GET, 'rides'));
    const unsubRoutes = onSnapshot(collection(db, 'routes'), (s) => setRoutes(s.docs.map(d => ({ id: d.id, ...d.data() } as Route))), (e) => handleFirestoreError(e, OperationType.GET, 'routes'));
    const unsubVehicles = onSnapshot(collection(db, 'vehicles'), (s) => setVehicles(s.docs.map(d => ({ id: d.id, ...d.data() } as Vehicle))), (e) => handleFirestoreError(e, OperationType.GET, 'vehicles'));
    const unsubDiscounts = onSnapshot(collection(db, 'discounts'), (s) => setDiscounts(s.docs.map(d => ({ id: d.id, ...d.data() } as Discount))), (e) => handleFirestoreError(e, OperationType.GET, 'discounts'));
    const unsubHappyHours = onSnapshot(collection(db, 'happyhours'), (s) => setHappyHours(s.docs.map(d => ({ id: d.id, ...d.data() } as HappyHour))), (e) => handleFirestoreError(e, OperationType.GET, 'happyhours'));
    const unsubLeaves = onSnapshot(collection(db, 'leaves'), (s) => setLeaves(s.docs.map(d => ({ id: d.id, ...d.data() } as DriverLeave))), (e) => handleFirestoreError(e, OperationType.GET, 'leaves'));
    const unsubShifts = onSnapshot(collection(db, 'shifts'), (s) => {
      setShifts(s.docs.map(d => ({ id: d.id, ...d.data() } as WorkShift)));
      setLoading(false);
    }, (e) => handleFirestoreError(e, OperationType.GET, 'shifts'));

    return () => {
      unsubDrivers(); unsubRides(); unsubRoutes(); unsubVehicles(); unsubDiscounts(); unsubHappyHours(); unsubLeaves(); unsubShifts();
    };
  }, []);

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'drivers'), newDriver);
      toast.success('Driver added');
      setIsAddingDriver(false);
    } catch { toast.error('Failed to add driver'); }
  };

  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'routes'), newRoute);
      toast.success('Route added');
      setIsAddingRoute(false);
    } catch { toast.error('Failed to add route'); }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'vehicles'), newVehicle);
      toast.success('Vehicle added');
      setIsAddingVehicle(false);
    } catch { toast.error('Failed to add vehicle'); }
  };

  const handleAddDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'discounts'), newDiscount);
      toast.success('Discount added');
      setIsAddingDiscount(false);
    } catch { toast.error('Failed to add discount'); }
  };

  const handleAddHappyHour = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'happyhours'), newHappyHour);
      toast.success('Happy Hour added');
      setIsAddingHappyHour(false);
    } catch { toast.error('Failed to add happy hour'); }
  };

  const handleAddLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'leaves'), newLeave);
      toast.success('Leave recorded');
      setIsAddingLeave(false);
    } catch { toast.error('Failed to record leave'); }
  };

  const handleAddShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'shifts'), newShift);
      toast.success('Shift assigned');
      setIsAddingShift(false);
    } catch { toast.error('Failed to assign shift'); }
  };

  const handleDelete = async (coll: string, id: string) => {
    if (confirm('Are you sure?')) {
      try {
        await deleteDoc(doc(db, coll, id));
        toast.success('Deleted successfully');
      } catch { toast.error('Failed to delete'); }
    }
  };

  const stats = {
    revenue: rides.reduce((acc, r) => acc + (r.status === 'Completed' ? r.fare : 0), 0),
    rides: rides.length,
    drivers: drivers.length,
    rating: drivers.reduce((acc, d) => acc + d.rating, 0) / (drivers.length || 1)
  };

  if (authLoading || loading || !profile || !profile.isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-green-500/10 rounded-2xl">
            <LayoutDashboard className="text-green-500 w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-zinc-500">Salama Ride Management System</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 bg-zinc-900 p-1 rounded-2xl border border-white/5">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'drivers', label: 'Drivers', icon: Users },
            { id: 'rides', label: 'Rides', icon: Car },
            { id: 'fleet', label: 'Fleet', icon: Truck },
            { id: 'routes', label: 'Routes', icon: MapIcon },
            { id: 'ops', label: 'Ops', icon: Calendar },
            { id: 'promos', label: 'Promos', icon: Percent },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id ? 'bg-green-500 text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-zinc-900 p-6 rounded-3xl border border-white/5">
              <CreditCard className="text-green-500 mb-4" />
              <p className="text-zinc-500 text-xs font-bold uppercase">Revenue</p>
              <p className="text-2xl font-bold">KES {stats.revenue.toLocaleString()}</p>
            </div>
            <div className="bg-zinc-900 p-6 rounded-3xl border border-white/5">
              <Car className="text-blue-500 mb-4" />
              <p className="text-zinc-500 text-xs font-bold uppercase">Total Rides</p>
              <p className="text-2xl font-bold">{stats.rides}</p>
            </div>
            <div className="bg-zinc-900 p-6 rounded-3xl border border-white/5">
              <Users className="text-purple-500 mb-4" />
              <p className="text-zinc-500 text-xs font-bold uppercase">Drivers</p>
              <p className="text-2xl font-bold">{stats.drivers}</p>
            </div>
            <div className="bg-zinc-900 p-6 rounded-3xl border border-white/5">
              <Star className="text-yellow-500 mb-4" />
              <p className="text-zinc-500 text-xs font-bold uppercase">Avg Rating</p>
              <p className="text-2xl font-bold">{stats.rating.toFixed(1)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-zinc-900 p-6 rounded-3xl border border-white/5">
              <h3 className="font-bold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {rides.slice(0, 5).map(r => (
                  <div key={r.id} className="flex justify-between text-sm p-3 bg-black/20 rounded-xl">
                    <span>{r.pickup} → {r.destination}</span>
                    <span className="text-green-500 font-bold">KES {r.fare}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-zinc-900 p-6 rounded-3xl border border-white/5">
              <h3 className="font-bold mb-4">Map Overview</h3>
              <div className="aspect-video bg-black rounded-2xl flex items-center justify-center border border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 opacity-30 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/36.8219,1.2921,12/800x450?access_token=placeholder')] bg-cover bg-center"></div>
                <div className="relative z-10 text-center p-6">
                  <MapIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-sm font-medium">Google Maps Integration</p>
                  <p className="text-xs text-zinc-500 mt-2">Live vehicle tracking and route visualization</p>
                  <button className="mt-4 px-4 py-2 bg-green-500 text-black text-xs font-bold rounded-full">Configure API Key</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'drivers' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Driver Management</h2>
            <button onClick={() => setIsAddingDriver(!isAddingDriver)} className="bg-green-500 text-black font-bold py-2 px-4 rounded-xl text-sm">
              {isAddingDriver ? 'Cancel' : 'Add Driver'}
            </button>
          </div>
          {isAddingDriver && (
            <form onSubmit={handleAddDriver} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-900 p-6 rounded-3xl border border-white/5">
              <input placeholder="Name" className="bg-black p-3 rounded-xl border border-white/10" value={newDriver.name} onChange={e => setNewDriver({...newDriver, name: e.target.value})} required />
              <select className="bg-black p-3 rounded-xl border border-white/10" value={newDriver.vehicleType} onChange={e => setNewDriver({...newDriver, vehicleType: e.target.value as 'Economy' | 'Comfort' | 'Bodaboda'})}>
                <option value="Economy">Economy</option>
                <option value="Comfort">Comfort</option>
                <option value="Bodaboda">Bodaboda</option>
              </select>
              <input placeholder="Car Model" className="bg-black p-3 rounded-xl border border-white/10" value={newDriver.carModel} onChange={e => setNewDriver({...newDriver, carModel: e.target.value})} required />
              <input placeholder="Plate Number" className="bg-black p-3 rounded-xl border border-white/10" value={newDriver.plateNumber} onChange={e => setNewDriver({...newDriver, plateNumber: e.target.value})} required />
              <input type="number" placeholder="Price/KM" className="bg-black p-3 rounded-xl border border-white/10" value={newDriver.pricePerKm} onChange={e => setNewDriver({...newDriver, pricePerKm: Number(e.target.value)})} required />
              <button type="submit" className="bg-green-500 text-black font-bold rounded-xl">Save</button>
            </form>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map(d => (
              <div key={d.id} className="bg-zinc-900 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                <div>
                  <p className="font-bold">{d.name}</p>
                  <p className="text-xs text-zinc-500">{d.vehicleType} • {d.plateNumber}</p>
                </div>
                <button onClick={() => handleDelete('drivers', d.id)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'fleet' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Fleet Management</h2>
            <button onClick={() => setIsAddingVehicle(!isAddingVehicle)} className="bg-green-500 text-black font-bold py-2 px-4 rounded-xl text-sm">
              {isAddingVehicle ? 'Cancel' : 'Add Vehicle'}
            </button>
          </div>
          {isAddingVehicle && (
            <form onSubmit={handleAddVehicle} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-900 p-6 rounded-3xl border border-white/5">
              <input placeholder="Plate Number" className="bg-black p-3 rounded-xl border border-white/10" value={newVehicle.plateNumber} onChange={e => setNewVehicle({...newVehicle, plateNumber: e.target.value})} required />
              <input placeholder="Model" className="bg-black p-3 rounded-xl border border-white/10" value={newVehicle.model} onChange={e => setNewVehicle({...newVehicle, model: e.target.value})} required />
              <select className="bg-black p-3 rounded-xl border border-white/10" value={newVehicle.status} onChange={e => setNewVehicle({...newVehicle, status: e.target.value as 'Available' | 'In Use' | 'Maintenance'})}>
                <option value="Available">Available</option>
                <option value="In Use">In Use</option>
                <option value="Maintenance">Maintenance</option>
              </select>
              <button type="submit" className="bg-green-500 text-black font-bold rounded-xl">Save</button>
            </form>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map(v => (
              <div key={v.id} className="bg-zinc-900 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                <div>
                  <p className="font-bold">{v.plateNumber}</p>
                  <p className="text-xs text-zinc-500">{v.model}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${v.status === 'Available' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{v.status}</span>
                </div>
                <button onClick={() => handleDelete('vehicles', v.id)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'routes' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Route Management</h2>
            <button onClick={() => setIsAddingRoute(!isAddingRoute)} className="bg-green-500 text-black font-bold py-2 px-4 rounded-xl text-sm">
              {isAddingRoute ? 'Cancel' : 'Add Route'}
            </button>
          </div>
          {isAddingRoute && (
            <form onSubmit={handleAddRoute} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-900 p-6 rounded-3xl border border-white/5">
              <input placeholder="Route Name" className="bg-black p-3 rounded-xl border border-white/10" value={newRoute.name} onChange={e => setNewRoute({...newRoute, name: e.target.value})} required />
              <input placeholder="Pickup" className="bg-black p-3 rounded-xl border border-white/10" value={newRoute.pickup} onChange={e => setNewRoute({...newRoute, pickup: e.target.value})} required />
              <input placeholder="Destination" className="bg-black p-3 rounded-xl border border-white/10" value={newRoute.destination} onChange={e => setNewRoute({...newRoute, destination: e.target.value})} required />
              <input type="number" placeholder="Base Distance (km)" className="bg-black p-3 rounded-xl border border-white/10" value={newRoute.baseDistance} onChange={e => setNewRoute({...newRoute, baseDistance: Number(e.target.value)})} required />
              <button type="submit" className="bg-green-500 text-black font-bold rounded-xl py-3 col-span-full">Save Route</button>
            </form>
          )}
          <div className="grid grid-cols-1 gap-4">
            {routes.map(r => (
              <div key={r.id} className="bg-zinc-900 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <MapIcon className="text-green-500" />
                  <div>
                    <p className="font-bold">{r.name}</p>
                    <p className="text-xs text-zinc-500">{r.pickup} to {r.destination} ({r.baseDistance}km)</p>
                  </div>
                </div>
                <button onClick={() => handleDelete('routes', r.id)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'promos' && (
        <div className="space-y-12">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Discounts & Coupons</h2>
              <button onClick={() => setIsAddingDiscount(!isAddingDiscount)} className="bg-green-500 text-black font-bold py-2 px-4 rounded-xl text-sm">
                {isAddingDiscount ? 'Cancel' : 'Add Discount'}
              </button>
            </div>
            {isAddingDiscount && (
              <form onSubmit={handleAddDiscount} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-900 p-6 rounded-3xl border border-white/5">
                <input placeholder="Promo Code" className="bg-black p-3 rounded-xl border border-white/10" value={newDiscount.code} onChange={e => setNewDiscount({...newDiscount, code: e.target.value.toUpperCase()})} required />
                <input type="number" placeholder="Percentage (%)" className="bg-black p-3 rounded-xl border border-white/10" value={newDiscount.percentage} onChange={e => setNewDiscount({...newDiscount, percentage: Number(e.target.value)})} required />
                <button type="submit" className="bg-green-500 text-black font-bold rounded-xl">Save</button>
              </form>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {discounts.map(d => (
                <div key={d.id} className="bg-zinc-900 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-green-500">{d.code}</p>
                    <p className="text-xs text-zinc-500">{d.percentage}% Off</p>
                  </div>
                  <button onClick={() => handleDelete('discounts', d.id)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Happy Hour Promotions</h2>
              <button onClick={() => setIsAddingHappyHour(!isAddingHappyHour)} className="bg-green-500 text-black font-bold py-2 px-4 rounded-xl text-sm">
                {isAddingHappyHour ? 'Cancel' : 'Add Happy Hour'}
              </button>
            </div>
            {isAddingHappyHour && (
              <form onSubmit={handleAddHappyHour} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-zinc-900 p-6 rounded-3xl border border-white/5">
                <input placeholder="Name (e.g. Rush Hour)" className="bg-black p-3 rounded-xl border border-white/10" value={newHappyHour.name} onChange={e => setNewHappyHour({...newHappyHour, name: e.target.value})} required />
                <input type="time" className="bg-black p-3 rounded-xl border border-white/10" value={newHappyHour.startTime} onChange={e => setNewHappyHour({...newHappyHour, startTime: e.target.value})} required />
                <input type="time" className="bg-black p-3 rounded-xl border border-white/10" value={newHappyHour.endTime} onChange={e => setNewHappyHour({...newHappyHour, endTime: e.target.value})} required />
                <input type="number" placeholder="Discount %" className="bg-black p-3 rounded-xl border border-white/10" value={newHappyHour.discountPercentage} onChange={e => setNewHappyHour({...newHappyHour, discountPercentage: Number(e.target.value)})} required />
                <button type="submit" className="bg-green-500 text-black font-bold rounded-xl py-3 col-span-full">Save Happy Hour</button>
              </form>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {happyHours.map(h => (
                <div key={h.id} className="bg-zinc-900 p-6 rounded-3xl border border-white/5 flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <Zap className="text-yellow-500" />
                    <div>
                      <p className="font-bold">{h.name}</p>
                      <p className="text-xs text-zinc-500">{h.startTime} - {h.endTime} • {h.discountPercentage}% Off</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete('happyhours', h.id)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ops' && (
        <div className="space-y-12">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Driver Leave Tracking</h2>
              <button onClick={() => setIsAddingLeave(!isAddingLeave)} className="bg-green-500 text-black font-bold py-2 px-4 rounded-xl text-sm">
                {isAddingLeave ? 'Cancel' : 'Record Leave'}
              </button>
            </div>
            {isAddingLeave && (
              <form onSubmit={handleAddLeave} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-900 p-6 rounded-3xl border border-white/5">
                <select className="bg-black p-3 rounded-xl border border-white/10" value={newLeave.driverId} onChange={e => setNewLeave({...newLeave, driverId: e.target.value})} required>
                  <option value="">Select Driver</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <input type="date" className="bg-black p-3 rounded-xl border border-white/10" value={newLeave.startDate} onChange={e => setNewLeave({...newLeave, startDate: e.target.value})} required />
                <input type="date" className="bg-black p-3 rounded-xl border border-white/10" value={newLeave.endDate} onChange={e => setNewLeave({...newLeave, endDate: e.target.value})} required />
                <input placeholder="Reason" className="bg-black p-3 rounded-xl border border-white/10" value={newLeave.reason} onChange={e => setNewLeave({...newLeave, reason: e.target.value})} required />
                <button type="submit" className="bg-green-500 text-black font-bold rounded-xl py-3 col-span-full">Record Leave</button>
              </form>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leaves.map(l => {
                const driver = drivers.find(d => d.id === l.driverId);
                return (
                  <div key={l.id} className="bg-zinc-900 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                    <div>
                      <p className="font-bold">{driver?.name || 'Unknown Driver'}</p>
                      <p className="text-xs text-zinc-500">{l.startDate} to {l.endDate}</p>
                      <p className="text-xs italic text-zinc-400 mt-1">{l.reason}</p>
                    </div>
                    <button onClick={() => handleDelete('leaves', l.id)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg"><Trash2 size={18} /></button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Work Shifts</h2>
              <button onClick={() => setIsAddingShift(!isAddingShift)} className="bg-green-500 text-black font-bold py-2 px-4 rounded-xl text-sm">
                {isAddingShift ? 'Cancel' : 'Assign Shift'}
              </button>
            </div>
            {isAddingShift && (
              <form onSubmit={handleAddShift} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-zinc-900 p-6 rounded-3xl border border-white/5">
                <select className="bg-black p-3 rounded-xl border border-white/10" value={newShift.driverId} onChange={e => setNewShift({...newShift, driverId: e.target.value})} required>
                  <option value="">Select Driver</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <select className="bg-black p-3 rounded-xl border border-white/10" value={newShift.day} onChange={e => setNewShift({...newShift, day: e.target.value})} required>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <input type="time" className="bg-black p-3 rounded-xl border border-white/10" value={newShift.startTime} onChange={e => setNewShift({...newShift, startTime: e.target.value})} required />
                <input type="time" className="bg-black p-3 rounded-xl border border-white/10" value={newShift.endTime} onChange={e => setNewShift({...newShift, endTime: e.target.value})} required />
                <button type="submit" className="bg-green-500 text-black font-bold rounded-xl py-3 col-span-full">Assign Shift</button>
              </form>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shifts.map(s => {
                const driver = drivers.find(d => d.id === s.driverId);
                return (
                  <div key={s.id} className="bg-zinc-900 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                    <div>
                      <p className="font-bold">{driver?.name || 'Unknown Driver'}</p>
                      <p className="text-xs text-zinc-500">{s.day}: {s.startTime} - {s.endTime}</p>
                    </div>
                    <button onClick={() => handleDelete('shifts', s.id)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg"><Trash2 size={18} /></button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rides' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Ride Management</h2>
          <div className="bg-zinc-900 rounded-3xl border border-white/5 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-xs uppercase text-zinc-500 font-bold">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Route</th>
                  <th className="p-4">Fare</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rides.map(r => (
                  <tr key={r.id} className="text-sm">
                    <td className="p-4">{r.userId.slice(0, 8)}...</td>
                    <td className="p-4">{r.pickup} → {r.destination}</td>
                    <td className="p-4 font-bold text-green-500">KES {r.fare}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${r.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{r.status}</span>
                    </td>
                    <td className="p-4 flex gap-2">
                      {r.status === 'Pending' && <button onClick={() => updateDoc(doc(db, 'rides', r.id), {status: 'Accepted'})} className="text-blue-500 hover:underline">Accept</button>}
                      {r.status === 'Accepted' && <button onClick={() => updateDoc(doc(db, 'rides', r.id), {status: 'Completed'})} className="text-green-500 hover:underline">Complete</button>}
                      <button onClick={() => handleDelete('rides', r.id)} className="text-red-500"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
