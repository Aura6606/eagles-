import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, Clock, Smartphone, ArrowRight, Star } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';

export default function Home() {
  const { profile, login } = useAuth();

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1920" 
            alt="Nairobi City" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="inline-block px-4 py-1.5 bg-green-500/10 text-green-500 rounded-full text-sm font-semibold mb-6 border border-green-500/20">
              Reliable Rides in Kenya 
            </span>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              Safe, Reliable Rides <br />
              <span className="text-green-500">Across Kenya</span>
            </h1>
            <p className="text-xl text-zinc-400 mb-8 leading-relaxed">
              Experience the best transport service in Nairobi and beyond. Whether it's a quick trip to Westlands or a long journey, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {profile ? (
                <Link 
                  to="/booking" 
                  className="bg-green-500 text-black px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center hover:bg-green-400 transition-all group"
                >
                  Book a Ride Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <button 
                  onClick={login}
                  className="bg-green-500 text-black px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center hover:bg-green-400 transition-all group"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
              <div className="flex items-center space-x-4 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-zinc-800 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="flex items-center text-yellow-500">
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                  </div>
                  <span className="text-zinc-400">10k+ Happy Riders</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Salama Ride?</h2>
          <p className="text-zinc-400">We prioritize your safety and comfort on every journey.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Shield,
              title: "Verified Drivers",
              desc: "All our drivers undergo rigorous background checks and training."
            },
            {
              icon: Clock,
              title: "Always on Time",
              desc: "Our smart routing ensures your driver arrives exactly when you need them."
            },
            {
              icon: Smartphone,
              title: "Easy M-Pesa Pay",
              desc: "Seamlessly pay for your rides using M-Pesa directly from the app."
            }
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -10 }}
              className="p-8 bg-zinc-900 rounded-3xl border border-white/5 hover:border-green-500/30 transition-all"
            >
              <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6">
                <feature.icon className="text-green-500 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
              <p className="text-zinc-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-zinc-900/50 py-20 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-4xl font-bold mb-6">Rides for Every Budget</h2>
              <p className="text-zinc-400 mb-8 text-lg">
                From affordable daily commutes to premium executive travel, we have the perfect vehicle for you.
              </p>
              <div className="space-y-6">
                {[
                  { name: "Economy", desc: "Affordable everyday rides", price: "30 KES/km" },
                  { name: "Comfort", desc: "Spacious cars for extra comfort", price: "50 KES/km" },
                  { name: "Bodaboda", desc: "Quickest way through traffic", price: "20 KES/km" }
                ].map((service, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                    <div>
                      <h4 className="font-bold">{service.name}</h4>
                      <p className="text-sm text-zinc-500">{service.desc}</p>
                    </div>
                    <span className="text-green-500 font-bold">{service.price}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="absolute -inset-4 bg-green-500/20 blur-3xl rounded-full" />
              <img 
                src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800" 
                alt="Car" 
                className="relative rounded-3xl shadow-2xl border border-white/10"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-green-500 rounded-[3rem] p-12 md:p-20 text-black text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to ride with Salama?</h2>
            <p className="text-black/70 text-xl mb-10 max-w-2xl mx-auto">
              Join thousands of Kenyans who trust Salama Ride for their daily transport needs.
            </p>
            <button 
              onClick={!profile ? login : undefined}
              className="inline-block bg-black text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-zinc-800 transition-all active:scale-95"
            >
              {profile ? <Link to="/booking">Book Your First Ride</Link> : 'Book Your First Ride'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
