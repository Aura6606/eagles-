import React from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '1.5rem'
};

const center = {
  lat: -1.2921,
  lng: 36.8219
};

interface MapProps {
  pickup?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
  directions?: google.maps.DirectionsResult | null;
}

export default function MapComponent({ pickup, destination, directions }: MapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const onLoad = React.useCallback(function callback(m: google.maps.Map) {
    const bounds = new window.google.maps.LatLngBounds(center);
    m.fitBounds(bounds);
  }, []);

  const onUnmount = React.useCallback(function callback() {
  }, []);

  if (!isLoaded) return <div className="w-full h-full bg-zinc-900 animate-pulse rounded-3xl" />;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        styles: [
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#38414e" }],
          },
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#212a37" }],
          },
          {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9ca5b3" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#17263c" }],
          },
        ],
        disableDefaultUI: true,
      }}
    >
      {pickup && <Marker position={pickup} label="P" />}
      {destination && <Marker position={destination} label="D" />}
      {directions && <DirectionsRenderer directions={directions} />}
    </GoogleMap>
  );
}
