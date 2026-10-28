import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Property from './models/Property.js'; // ඔබගේ Property Model එකට අදාළ path එක දෙන්න

dotenv.config();

const sampleProperties = [
  {
    title: 'Azure Cliffside Sanctuary',
    tagline: 'Perched high above the azure waves with panoramic ocean views.',
    description: 'An architectural masterpiece featuring floor-to-ceiling glass, private infinity pool, and bespoke modern furnishings designed for ultimate relaxation.',
    propertyType: 'Cliffside Villa',
    pricePerNight: 125000, // LKR අගයෙන්
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 3,
    location: { city: 'Mirissa', country: 'Sri Lanka' },
    images: [{ url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200' }],
    averageRating: 4.98
  },
  {
    title: 'Skyline Obsidian Penthouse',
    tagline: 'Modern urban luxury overlooking the glittering city skyline.',
    description: 'A sophisticated top-floor residence complete with private elevator access, rooftop terrace, and cutting-edge smart home automation.',
    propertyType: 'Penthouse',
    pricePerNight: 95000,
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 2.5,
    location: { city: 'Colombo', country: 'Sri Lanka' },
    images: [{ url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200' }],
    averageRating: 4.92
  },
  {
    title: 'Emerald Shore Beachfront Villa',
    tagline: 'Step directly from your private deck onto golden tropical sands.',
    description: 'Surrounded by whispering coconut palms, this serene beachfront sanctuary offers seamless indoor-outdoor living and a private plunge pool.',
    propertyType: 'Beachfront',
    pricePerNight: 150000,
    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 4,
    location: { city: 'Bentota', country: 'Sri Lanka' },
    images: [{ url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200' }],
    averageRating: 5.00
  },
  {
    title: 'Alpine Mist Chalet',
    tagline: 'A warm wooden haven nestled in the breathtaking misty peaks.',
    description: 'Featuring a grand stone fireplace, panoramic mountain viewing deck, and a private cedar hot tub under the stars.',
    propertyType: 'Alpine Chalet',
    pricePerNight: 110000,
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 3,
    location: { city:NuwaraEliya, country: 'Sri Lanka' },
    images: [{ url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200' }],
    averageRating: 4.95
  },
  {
    title: 'Serene Tea Estate Manor',
    tagline: 'Surrounded by lush emerald tea gardens and cool mountain breezes.',
    description: 'A restored colonial-era heritage bungalow blending timeless architectural elegance with modern five-star comforts.',
    propertyType: 'Cliffside Villa',
    pricePerNight: 135000,
    maxGuests: 10,
    bedrooms: 5,
    bathrooms: 5,
    location: { city: 'Ella', country: 'Sri Lanka' },
    images: [{ url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=1200' }],
    averageRating: 4.97
  },
  {
    title: 'Velvet Horizon Sky Suite',
    tagline: 'Ultimate urban minimalist design with sweeping ocean and city views.',
    description: 'A high-rise luxury residence featuring designer Italian furniture, gourmet kitchen, and floor-to-ceiling acoustic glass windows.',
    propertyType: 'Penthouse',
    pricePerNight: 88000,
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1.5,
    location: { city: 'Colombo', country: 'Sri Lanka' },
    images: [{ url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1200' }],
    averageRating: 4.89
  },
  {
    title: 'Cinnamon Cove Beach Villa',
    tagline: 'Exclusive seclusion on a private stretch of pristine coastline.',
    description: 'An open-concept tropical villa featuring teak wood architecture, sun loungers, and private chef services available upon request.',
    propertyType: 'Beachfront',
    pricePerNight: 165000,
    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 4.5,
    location: { city: 'Tangalle', country: 'Sri Lanka' },
    images: [{ url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=1200' }],
    averageRating: 4.99
  },
  {
    title: 'Pine Valley Alpine Lodge',
    tagline: 'Rustic luxury and cozy warmth surrounded by towering pine trees.',
    description: 'An idyllic mountain escape offering heated floors, a wrap-around wooden deck, and an expansive stargazing lounge.',
    propertyType: 'Alpine Chalet',
    pricePerNight: 99000,
    maxGuests: 5,
    bedrooms: 2,
    bathrooms: 2,
    location: { city: 'Bandarawela', country: 'Sri Lanka' },
    images: [{ url: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=1200' }],
    averageRating: 4.91
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database connected for seeding...');

    await Property.deleteMany({}); // අවශ්‍ය නම් කලින් තිබූ දත්ත ඉවත් කිරීමට (Optional)
    console.log('Existing properties cleared.');

    await Property.insertMany(sampleProperties);
    console.log('Successfully seeded 8 new luxury properties!');

    mongoose.connection.close();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedDB();