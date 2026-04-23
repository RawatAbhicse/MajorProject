// server/seed.js
import mongoose from 'mongoose';
import Trek from './models/Trek.js';
import Guide from './models/Guide.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log('Connected to MongoDB');

    const treks = [
      // === HIGHLY POPULAR CLASSICS ===
      {
        name: 'Valley of Flowers',
        location: 'Chamoli, Uttarakhand',
        lat: 30.7281,
        lon: 79.6052,
        duration: 6,
        difficulty: 'moderate',
        price: 18500,
        rating: 4.8,
        reviewCount: 234,
        maxGroupSize: 15,
        description: 'UNESCO World Heritage Site famous for its spectacular alpine meadows and endemic wildflowers. The valley is a riot of colors during monsoon with over 500 species of flowers including the rare Brahmakamal.',
        isEcoFriendly: true,
        season: 'summer',
        popularity: 95,
        image: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Valley_of_flowers_uttaranchal_full_view.JPG',
      },
      {
        name: 'Kedarkantha Trek',
        location: 'Uttarkashi, Uttarakhand',
        lat: 31.0134,
        lon: 78.1719,
        duration: 5,
        difficulty: 'easy',
        price: 12500,
        rating: 4.7,
        reviewCount: 312,
        maxGroupSize: 20,
        description: 'One of the most beautiful winter treks in Garhwal Himalayas. Summit at 3810m offers 360° views of Swargarohini, Bandarpoonch, and Black Peak. Magical campsites in snow-covered forests.',
        isEcoFriendly: true,
        season: 'winter',
        popularity: 92,
        image: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Kedarkantha_Trek.jpg',
      },
      {
        name: 'Roopkund Trek',
        location: 'Chamoli, Uttarakhand',
        lat: 30.2623,
        lon: 79.7317,
        duration: 8,
        difficulty: 'hard',
        price: 25000,
        rating: 4.9,
        reviewCount: 178,
        maxGroupSize: 12,
        description: 'The mysterious Skeleton Lake at 5029m with ancient human remains. One of the most adventurous and culturally significant high-altitude treks in the Indian Himalayas.',
        isEcoFriendly: true,
        season: 'summer',
        popularity: 98,
        image: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Roopkund_Lake.jpg',
      },
      {
        name: 'Har Ki Dun',
        location: 'Uttarkashi, Uttarakhand',
        lat: 31.1646,
        lon: 78.4028,
        duration: 7,
        difficulty: 'moderate',
        price: 16000,
        rating: 4.6,
        reviewCount: 145,
        maxGroupSize: 18,
        description: 'A stunning hanging valley at 3566m surrounded by the majestic Swargarohini peaks. The trail passes through ancient villages linked to Mahabharata mythology.',
        isEcoFriendly: true,
        season: 'spring',
        popularity: 80,
        image: 'https://upload.wikimedia.org/wikipedia/commons/b/b7/Entering_Har_Ki_Dun.JPG',
      },

      // === MORE UTTARAKHAND TREKS ===
      {
        name: 'Chopta Tungnath Chandrashila',
        location: 'Rudraprayag, Uttarakhand',
        lat: 30.4794,
        lon: 79.2105,
        duration: 4,
        difficulty: 'easy',
        price: 9500,
        rating: 4.7,
        reviewCount: 267,
        maxGroupSize: 25,
        description: 'Mini Switzerland of Uttarakhand. Trek to the highest Shiva temple in the world (Tungnath at 3680m) followed by Chandrashila summit (4130m) offering panoramic views of Nanda Devi, Trishul and Kedarnath peaks.',
        isEcoFriendly: true,
        season: 'spring',
        popularity: 88,
        image: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Bugyals_enroute_Tungnath.jpg',
      },
      {
        name: 'Brahmatal Trek',
        location: 'Chamoli, Uttarakhand',
        lat: 30.3961,
        lon: 79.5284,
        duration: 6,
        difficulty: 'moderate',
        price: 14000,
        rating: 4.6,
        reviewCount: 121,
        maxGroupSize: 20,
        description: 'Beautiful winter trek to the frozen Brahmatal lake (3712m). Surrounded by snow-laden oak and rhododendron forests with magnificent views of Mt Trishul and Nanda Ghunti.',
        isEcoFriendly: true,
        season: 'winter',
        popularity: 78,
        image: 'https://upload.wikimedia.org/wikipedia/commons/2/27/Brahmatal.jpg',
      },
      {
        name: 'Kuari Pass Trek',
        location: 'Chamoli, Uttarakhand',
        lat: 30.5147,
        lon: 79.6503,
        duration: 6,
        difficulty: 'moderate',
        price: 17500,
        rating: 4.7,
        reviewCount: 163,
        maxGroupSize: 16,
        description: "Lord Curzon's famous trail offering continuous views of more than 20 Himalayan peaks including Nanda Devi, Kamet, Mana Peak, Dronagiri and Chaukhamba.",
        isEcoFriendly: true,
        season: 'autumn',
        popularity: 83,
        image: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Kuari_Pass_Bugyal_2.jpg',
      },
      {
        name: 'Dayara Bugyal',
        location: 'Uttarkashi, Uttarakhand',
        lat: 30.9312,
        lon: 78.5167,
        duration: 5,
        difficulty: 'easy',
        price: 11000,
        rating: 4.5,
        reviewCount: 198,
        maxGroupSize: 22,
        description: 'One of the most beautiful high altitude meadows in India at 3408m. Transforms into a vast snow-white paradise in winter and a carpet of flowers in summer.',
        isEcoFriendly: true,
        season: 'autumn',
        popularity: 77,
        image: 'https://upload.wikimedia.org/wikipedia/commons/5/56/Dayara_Bugyal_2.jpg',
      },
      {
        name: 'Nag Tibba Trek',
        location: 'Tehri Garhwal, Uttarakhand',
        lat: 30.6512,
        lon: 78.2598,
        duration: 2,
        difficulty: 'easy',
        price: 5500,
        rating: 4.4,
        reviewCount: 389,
        maxGroupSize: 30,
        description: 'Perfect weekend trek from Delhi and Dehradun. Highest peak in lower Garhwal Himalayas offering panoramic views of Gangotri, Kedarnath, Yamunotri and Bandarpoonch ranges.',
        isEcoFriendly: true,
        season: 'winter',
        popularity: 85,
        image: 'https://upload.wikimedia.org/wikipedia/commons/9/94/A_panoramic_view_of_Himalayan_peaks_Himachal_Pradesh_India_Nag_Tibba_summit_December_2014.jpg',
      },
      {
        name: 'Gaumukh Tapovan',
        location: 'Uttarkashi, Uttarakhand',
        lat: 30.9256,
        lon: 79.0814,
        duration: 8,
        difficulty: 'hard',
        price: 28000,
        rating: 4.9,
        reviewCount: 87,
        maxGroupSize: 8,
        description: 'The ultimate spiritual trek to the source of the holy Ganges (Gaumukh glacier at 3892m) and the beautiful meadows of Tapovan with majestic views of Shivling, Meru and Bhagirathi peaks.',
        isEcoFriendly: true,
        season: 'summer',
        popularity: 91,
        image: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Gaumukh.jpg',
      },
      {
        name: 'Pindari Glacier Trek',
        location: 'Bageshwar, Uttarakhand',
        lat: 30.3124,
        lon: 79.8125,
        duration: 7,
        difficulty: 'moderate',
        price: 13500,
        rating: 4.6,
        reviewCount: 134,
        maxGroupSize: 15,
        description: 'One of the most accessible and beautiful glacier treks in Kumaon Himalayas. The trail passes through lush forests and offers stunning views of Nanda Devi and Panchachuli peaks.',
        isEcoFriendly: true,
        season: 'summer',
        popularity: 72,
        image: 'https://upload.wikimedia.org/wikipedia/commons/7/7f/Sunderdhunga_Glacier.jpg',
      },
      {
        name: 'Phulara Ridge Trek',
        location: 'Uttarkashi, Uttarakhand',
        lat: 30.8512,
        lon: 78.4123,
        duration: 5,
        difficulty: 'moderate',
        price: 12500,
        rating: 4.5,
        reviewCount: 92,
        maxGroupSize: 18,
        description: 'A hidden gem offering one of the most spectacular ridge walks in Garhwal with continuous 270° views of major Himalayan peaks including Bandarpoonch, Gangotri Group and Swargarohini.',
        isEcoFriendly: true,
        season: 'autumn',
        popularity: 68,
        image: 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Phulara_Ridge.jpg',
      },
      {
        name: 'Ali Bugyal Bedni Bugyal',
        location: 'Chamoli, Uttarakhand',
        lat: 30.2814,
        lon: 79.7128,
        duration: 6,
        difficulty: 'moderate',
        price: 14500,
        rating: 4.7,
        reviewCount: 156,
        maxGroupSize: 20,
        description: 'The most beautiful high altitude meadows trek in Uttarakhand. Vast rolling grasslands at 3400m with incredible views of Trishul, Nanda Ghunti and Chaukhamba peaks.',
        isEcoFriendly: true,
        season: 'summer',
        popularity: 79,
        image: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Ali_Bugyal.jpg',
      },
      {
        name: 'Deoriatal Chopta Chandrashila',
        location: 'Rudraprayag, Uttarakhand',
        lat: 30.5123,
        lon: 79.2156,
        duration: 5,
        difficulty: 'easy',
        price: 10500,
        rating: 4.6,
        reviewCount: 214,
        maxGroupSize: 22,
        description: 'A perfect family and beginner trek combining the serene Deoriatal lake with the sacred Tungnath temple and Chandrashila summit. Offers magnificent views of the Greater Himalayas.',
        isEcoFriendly: true,
        season: 'spring',
        popularity: 81,
        image: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Bugyals_enroute_Tungnath.jpg',
      }
    ];

    const guides = [
      {
        name: 'Rajesh Kumar',
        image: 'https://picsum.photos/seed/rajesh/300/300',
        rating: 4.8,
        reviewCount: 127,
        experience: 8,
        location: 'Rishikesh',
        specialties: ['Valley of Flowers', 'Har Ki Dun', 'Kedarkantha'],
        languages: ['Hindi', 'English', 'Garhwali'],
        phone: '+91 9876543210',
        email: 'rajesh@ecotrek.com',
        pricePerDay: 2500,
        availability: 'Available',
        totalTrips: 250,
        certifications: ['Wilderness First Aid', 'Mountain Guide Level 2'],
      },
      {
        name: 'Priya Sharma',
        image: 'https://picsum.photos/seed/priya/300/300',
        rating: 4.9,
        reviewCount: 89,
        experience: 6,
        location: 'Uttarkashi',
        specialties: ['Roopkund', 'Pangarchulla', 'Kuari Pass'],
        languages: ['Hindi', 'English'],
        phone: '+91 9876543211',
        email: 'priya@ecotrek.com',
        pricePerDay: 2800,
        availability: 'Busy until March 15',
        totalTrips: 180,
        certifications: ['Advanced Mountaineering', 'Rescue Operations'],
      },
      {
        name: 'Deepak Negi',
        image: 'https://picsum.photos/seed/deepak/300/300',
        rating: 4.7,
        reviewCount: 203,
        experience: 12,
        location: 'Joshimath',
        specialties: ['Brahmatal', 'Chopta Tungnath', 'Dayara Bugyal'],
        languages: ['Hindi', 'English', 'Garhwali', 'Kumaoni'],
        phone: '+91 9876543212',
        email: 'deepak@ecotrek.com',
        pricePerDay: 3000,
        availability: 'Available',
        totalTrips: 410,
        certifications: ['National Mountain Guide', 'High Altitude Medicine'],
      }
    ];

    // Upsert to avoid duplicates
    const trekOps = treks.map(trek => ({
      updateOne: {
        filter: { name: trek.name },
        update: { $set: trek },
        upsert: true
      }
    }));

    const guideOps = guides.map(guide => ({
      updateOne: {
        filter: { email: guide.email },
        update: { $set: guide },
        upsert: true
      }
    }));

    const [trekResult, guideResult] = await Promise.all([
      Trek.bulkWrite(trekOps),
      Guide.bulkWrite(guideOps)
    ]);

    console.log(`✅ Seed completed successfully!`);
    console.log(`Treks → ${trekResult.upsertedCount} added | ${trekResult.modifiedCount} updated`);
    console.log(`Guides → ${guideResult.upsertedCount} added | ${guideResult.modifiedCount} updated`);

    mongoose.connection.close();
  })
  .catch((err) => {
    console.error('❌ Seed error:', err);
    mongoose.connection.close();
  });