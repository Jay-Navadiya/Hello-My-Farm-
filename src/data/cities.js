// Supported Cities & Areas in Gujarat & Nearby Getaways
export const CITIES = [
  {
    id: 'surat',
    name: 'Surat',
    state: 'Gujarat',
    popular: true,
    tagline: 'Diamond City & Dandi Coast Farmhouses',
    lat: 21.1702,
    lng: 72.8311,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    areas: [
      { id: 'dumas', name: 'Dumas Road & Beach', description: 'Sea breeze weekend retreats & swimming pool villas' },
      { id: 'new_dandi', name: 'New Dandi Road', description: 'Ultra luxury green lawns & private party farmhouses' },
      { id: 'kamrej', name: 'Kamrej & Tapi Basin', description: 'Riverfront estates with indoor games & rain dance' },
      { id: 'olpad', name: 'Olpad Highway', description: 'Spacious weekend farmhouses for 50+ guest events' },
      { id: 'ubhrat', name: 'Ubhrat Coast', description: 'Quiet coastal weekend homes with private gazebos' }
    ]
  },
  {
    id: 'vadodara',
    name: 'Vadodara',
    state: 'Gujarat',
    popular: true,
    tagline: 'Cultural Capital Getaways & River Farms',
    lat: 22.3072,
    lng: 73.1812,
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
    areas: [
      { id: 'sevasi', name: 'Sevasi & Gotri Green Belt', description: 'Modern architectural villas with infinity pools' },
      { id: 'vasna', name: 'Vasna - Bhayli Road', description: 'Premium weekend cottages with lush sports lawns' },
      { id: 'waghodia', name: 'Waghodia Road', description: 'Large event spaces & organic farm stays' }
    ]
  },
  {
    id: 'daman',
    name: 'Daman & Diu',
    state: 'Union Territory',
    popular: true,
    tagline: 'Beachfront Party Villas & Resort Estates',
    lat: 20.3974,
    lng: 72.8328,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    areas: [
      { id: 'devka', name: 'Devka Beach Front', description: 'Coastal breeze farmhouses with ocean views' },
      { id: 'jampore', name: 'Jampore Beach Side', description: 'Luxury party retreats with poolside bars' }
    ]
  },
  {
    id: 'goa',
    name: 'Goa',
    state: 'Goa',
    popular: true,
    tagline: 'Tropical Luxury Private Pool Villas',
    lat: 15.2993,
    lng: 74.1240,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    areas: [
      { id: 'baga', name: 'Baga - Calangute Belt', description: 'High-end Portuguese style luxury villas' },
      { id: 'anjuna', name: 'Anjuna & Vagator Hills', description: 'Private hillock infinity pool retreats' },
      { id: 'candolim', name: 'Candolim Greens', description: 'Peaceful garden estates near private beach access' }
    ]
  },
  {
    id: 'ahmedabad',
    name: 'Ahmedabad',
    state: 'Gujarat',
    popular: false,
    tagline: 'Sanand & Rancharda Weekend Farms',
    lat: 23.0225,
    lng: 72.5714,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    areas: [
      { id: 'sanand', name: 'Sanand Highway Farms', description: 'Sprawling 2-acre party plots & swimming pool villas' },
      { id: 'rancharda', name: 'Rancharda Eco Farms', description: 'Serene nature farmhouses with sports courts' }
    ]
  }
];

// Calculate distance between two lat/lng points using Haversine formula
export function getNearestCity(lat, lng) {
  let minDistance = Infinity;
  let nearest = CITIES[0];

  CITIES.forEach(city => {
    const R = 6371; // Earth radius in km
    const dLat = (city.lat - lat) * Math.PI / 180;
    const dLng = (city.lng - lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat * Math.PI / 180) * Math.cos(city.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    if (distance < minDistance) {
      minDistance = distance;
      nearest = city;
    }
  });

  return { city: nearest, distanceKm: Math.round(minDistance) };
}
