import React from 'react';
import { Link } from 'react-router-dom';
import { Car } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-zinc-900 border-t border-white/10 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                <Car className="text-black w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">Salama<span className="text-green-500">Ride</span></span>
            </div>
            <p className="text-zinc-400 max-w-xs">
              The most reliable transport booking platform in Kenya. Safe, affordable, and always on time.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-zinc-400 text-sm">
              <li><Link to="/" className="hover:text-green-500">Home</Link></li>
              <li><Link to="/booking" className="hover:text-green-500">Book a Ride</Link></li>
              <li><Link to="/history" className="hover:text-green-500">Ride History</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-zinc-400 text-sm">
              <li>Nairobi, Kenya</li>
              <li>support@salamaride.co.ke</li>
              <li>+254 700 000 000</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/5 text-center text-zinc-500 text-xs">
          &copy; {new Date().getFullYear()} Salama Ride. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
