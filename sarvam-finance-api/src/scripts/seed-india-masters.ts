import dotenv from 'dotenv';
dotenv.config();

import crypto from 'node:crypto';
import { getPrismaClient } from '../lib/db';

interface StateData {
  code: string;
  name: string;
  type: 'State' | 'UT';
  cities: string[];
}

const INDIA_DATA: StateData[] = [
  // ─── 28 STATES ───────────────────────────────────────────────
  {
    code: 'AP',
    name: 'Andhra Pradesh',
    type: 'State',
    cities: [
      'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Kakinada',
      'Rajahmundry', 'Tirupati', 'Kadapa', 'Anantapur', 'Vizianagaram', 'Eluru',
      'Ongole', 'Nandyal', 'Machilipatnam', 'Adoni', 'Tenali', 'Proddatur',
      'Chittoor', 'Hindupur', 'Bhimavaram', 'Madanapalle', 'Guntakal', 'Dharmavaram',
      'Gudivada', 'Srikakulam', 'Narasaraopet', 'Tadepalligudem', 'Amaravati'
    ],
  },
  {
    code: 'AR',
    name: 'Arunachal Pradesh',
    type: 'State',
    cities: [
      'Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro', 'Bomdila',
      'Tezu', 'Aalo', 'Changlang', 'Roing', 'Daporijo', 'Khonsa', 'Seppa'
    ],
  },
  {
    code: 'AS',
    name: 'Assam',
    type: 'State',
    cities: [
      'Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia',
      'Tezpur', 'Bongaigaon', 'Dhubri', 'Diphu', 'North Lakhimpur', 'Karimganj',
      'Sivasagar', 'Goalpara', 'Barpeta', 'Haflong', 'Hailakandi', 'Lumding'
    ],
  },
  {
    code: 'BR',
    name: 'Bihar',
    type: 'State',
    cities: [
      'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga',
      'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar', 'Munger', 'Chhapra',
      'Danapur', 'Bettiah', 'Saharsa', 'Sasaram', 'Hajipur', 'Dehri', 'Siwan',
      'Motihari', 'Nawada', 'Bagaha', 'Buxar', 'Kishanganj', 'Sitamarhi'
    ],
  },
  {
    code: 'CG',
    name: 'Chhattisgarh',
    type: 'State',
    cities: [
      'Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Rajnandgaon', 'Raigarh',
      'Jagdalpur', 'Ambikapur', 'Dhamtari', 'Chirmiri', 'Bhatapara', 'Durg',
      'Mahasamund', 'Kanker', 'Kawardha', 'Janjgir'
    ],
  },
  {
    code: 'GA',
    name: 'Goa',
    type: 'State',
    cities: [
      'Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Bicholim',
      'Curchorem', 'Cuncolim', 'Valpoi', 'Pernem', 'Sanguem', 'Canacona'
    ],
  },
  {
    code: 'GJ',
    name: 'Gujarat',
    type: 'State',
    cities: [
      'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar',
      'Junagadh', 'Gandhinagar', 'Anand', 'Navsari', 'Morbi', 'Nadiad',
      'Bharuch', 'Porbandar', 'Mehsana', 'Bhuj', 'Veraval', 'Patan', 'Vapi',
      'Godhra', 'Palanpur', 'Valsad', 'Gondal', 'Amreli', 'Dahod', 'Botad'
    ],
  },
  {
    code: 'HR',
    name: 'Haryana',
    type: 'State',
    cities: [
      'Faridabad', 'Gurugram', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak',
      'Hisar', 'Karnal', 'Sonipat', 'Panchkula', 'Bhiwani', 'Sirsa', 'Bahadurgarh',
      'Jind', 'Thanesar', 'Kaithal', 'Rewari', 'Palwal', 'Hansi', 'Narnaul'
    ],
  },
  {
    code: 'HP',
    name: 'Himachal Pradesh',
    type: 'State',
    cities: [
      'Shimla', 'Dharamshala', 'Mandi', 'Solan', 'Baddi', 'Nahan', 'Paonta Sahib',
      'Sundarnagar', 'Chamba', 'Una', 'Kullu', 'Hamirpur', 'Bilaspur', 'Palampur'
    ],
  },
  {
    code: 'JH',
    name: 'Jharkhand',
    type: 'State',
    cities: [
      'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro Steel City', 'Deoghar', 'Hazaribagh',
      'Giridih', 'Ramgarh', 'Phusro', 'Medininagar', 'Chas', 'Sahibganj', 'Chaibasa',
      'Gumla', 'Dumka', 'Gudri', 'Koderma'
    ],
  },
  {
    code: 'KA',
    name: 'Karnataka',
    type: 'State',
    cities: [
      'Bengaluru', 'Mysuru', 'Hubballi-Dharwad', 'Mangaluru', 'Belagavi', 'Davanagere',
      'Ballari', 'Vijayapura', 'Shivamogga', 'Tumakuru', 'Kalaburagi', 'Raichur',
      'Bidar', 'Hospet', 'Hassan', 'Gadag-Betageri', 'Udupi', 'Robertsonpet',
      'Bhadravati', 'Chitradurga', 'Kolar', 'Mandya', 'Chikmagalur', 'Gangavati'
    ],
  },
  {
    code: 'KL',
    name: 'Kerala',
    type: 'State',
    cities: [
      'Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad',
      'Alappuzha', 'Kannur', 'Kottayam', 'Kasaragod', 'Malappuram', 'Thalassery',
      'Ponnani', 'Vatakara', 'Kanhangad', 'Payyanur', 'Koyilandy', 'Neyyattinkara'
    ],
  },
  {
    code: 'MP',
    name: 'Madhya Pradesh',
    type: 'State',
    cities: [
      'Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas',
      'Satna', 'Ratlam', 'Rewa', 'Katni', 'Singrauli', 'Burhanpur', 'Khandwa',
      'Bhind', 'Chhindwara', 'Guna', 'Shivpuri', 'Vidisha', 'Chhatarpur', 'Damoh'
    ],
  },
  {
    code: 'MH',
    name: 'Maharashtra',
    type: 'State',
    cities: [
      'Mumbai', 'Pune', 'Nagpur', 'Thane', 'Pimpri-Chinchwad', 'Nashik',
      'Kalyan-Dombivli', 'Vasai-Virar', 'Aurangabad', 'Solapur', 'Bhiwandi',
      'Amravati', 'Nanded', 'Kolhapur', 'Ulhasnagar', 'Sangli', 'Malegaon',
      'Jalgaon', 'Akola', 'Latur', 'Dhule', 'Ahmednagar', 'Chandrapur', 'Parbhani',
      'Ichalkaranji', 'Jalna', 'Ambarnath', 'Bhusawal', 'Panvel', 'Satara', 'Beed'
    ],
  },
  {
    code: 'MN',
    name: 'Manipur',
    type: 'State',
    cities: [
      'Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Ukhrul', 'Senapati',
      'Tamenglong', 'Jiribam', 'Kakching', 'Moreh'
    ],
  },
  {
    code: 'ML',
    name: 'Meghalaya',
    type: 'State',
    cities: [
      'Shillong', 'Tura', 'Nongstoin', 'Jowai', 'Baghmara', 'Williamnagar',
      'Resubelpara', 'Nongpoh', 'Mairang'
    ],
  },
  {
    code: 'MZ',
    name: 'Mizoram',
    type: 'State',
    cities: [
      'Aizawl', 'Lunglei', 'Saiha', 'Champhai', 'Kolasib', 'Serchhip',
      'Lawngtlai', 'Mamit', 'Khawzawl'
    ],
  },
  {
    code: 'NL',
    name: 'Nagaland',
    type: 'State',
    cities: [
      'Dimapur', 'Kohima', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto',
      'Mon', 'Phek', 'Kiphire', 'Longleng', 'Peren'
    ],
  },
  {
    code: 'OD',
    name: 'Odisha',
    type: 'State',
    cities: [
      'Bhubaneswar', 'Cuttack', 'Rourkela', 'Brahmapur', 'Sambalpur', 'Puri',
      'Balasore', 'Bhadrak', 'Baripada', 'Jharsuguda', 'Jeypore', 'Bargarh',
      'Rayagada', 'Bolangir', 'Kendrapara', 'Bhawanipatna', 'Dhenkanal'
    ],
  },
  {
    code: 'PB',
    name: 'Punjab',
    type: 'State',
    cities: [
      'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Hoshiarpur',
      'Mohali', 'Batala', 'Pathankot', 'Moga', 'Abohar', 'Malerkotla', 'Khanna',
      'Phagwara', 'Muktsar', 'Barnala', 'Rajpura', 'Firozpur', 'Kapurthala'
    ],
  },
  {
    code: 'RJ',
    name: 'Rajasthan',
    type: 'State',
    cities: [
      'Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara',
      'Alwar', 'Bharatpur', 'Sikar', 'Pali', 'Sri Ganganagar', 'Jhunjhunu',
      'Banswara', 'Chittorgarh', 'Churu', 'Beawar', 'Tonk', 'Hanumangarh', 'Barmer'
    ],
  },
  {
    code: 'SK',
    name: 'Sikkim',
    type: 'State',
    cities: [
      'Gangtok', 'Namchi', 'Geyzing', 'Mangan', 'Rangpo', 'Jorethang', 'Singtam'
    ],
  },
  {
    code: 'TN',
    name: 'Tamil Nadu',
    type: 'State',
    cities: [
      'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tiruppur',
      'Erode', 'Vellore', 'Tirunelveli', 'Thanjavur', 'Tuticorin', 'Dindigul',
      'Nagercoil', 'Kanchipuram', 'Kumarapalayam', 'Karaikudi', 'Neyveli', 'Cuddalore',
      'Kumbakonam', 'Tiruvannamalai', 'Pollachi', 'Rajapalayam', 'Gudiyatham', 'Hosur',
      'Ambur', 'Nagapattinam', 'Pudukkottai', 'Vaniyambadi', 'Udhagamandalam'
    ],
  },
  {
    code: 'TS',
    name: 'Telangana',
    type: 'State',
    cities: [
      'Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam',
      'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet', 'Miryalaguda', 'Siddipet',
      'Nirmal', 'Mancherial', 'Kamareddy', 'Kothagudem', 'Jagtial'
    ],
  },
  {
    code: 'TR',
    name: 'Tripura',
    type: 'State',
    cities: [
      'Agartala', 'Dharmanagar', 'Udaipur', 'Kailasahar', 'Belonia', 'Khowai',
      'Ambassa', 'Teliamura', 'Bishramganj'
    ],
  },
  {
    code: 'UP',
    name: 'Uttar Pradesh',
    type: 'State',
    cities: [
      'Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Prayagraj',
      'Bareilly', 'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Noida',
      'Firozabad', 'Jhansi', 'Muzaffarnagar', 'Mathura', 'Badaun', 'Rampur',
      'Shahjahanpur', 'Farrukhabad', 'Maunath Bhanjan', 'Hapur', 'Ayodhya', 'Mirzapur'
    ],
  },
  {
    code: 'UK',
    name: 'Uttarakhand',
    type: 'State',
    cities: [
      'Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur',
      'Rishikesh', 'Pithoragarh', 'Ramnagar', 'Manglaur', 'Jaspur', 'Nainital'
    ],
  },
  {
    code: 'WB',
    name: 'West Bengal',
    type: 'State',
    cities: [
      'Kolkata', 'Howrah', 'Asansol', 'Siliguri', 'Durgapur', 'Bardhaman',
      'English Bazar', 'Baharampur', 'Habra', 'Kharagpur', 'Shantipur', 'Dankuni',
      'Dhulian', 'Ranaghat', 'Haldia', 'Raiganj', 'Krishnanagar', 'Nabadwip', 'Medinipur'
    ],
  },

  // ─── 8 UNION TERRITORIES ─────────────────────────────────────
  {
    code: 'AN',
    name: 'Andaman and Nicobar Islands',
    type: 'UT',
    cities: ['Port Blair', 'Garacharma', 'Bambooflat', 'Diglipur', 'Mayabunder'],
  },
  {
    code: 'CH',
    name: 'Chandigarh',
    type: 'UT',
    cities: ['Chandigarh'],
  },
  {
    code: 'DH',
    name: 'Dadra and Nagar Haveli and Daman and Diu',
    type: 'UT',
    cities: ['Daman', 'Diu', 'Silvassa', 'Naroli'],
  },
  {
    code: 'DL',
    name: 'Delhi',
    type: 'UT',
    cities: [
      'New Delhi', 'Central Delhi', 'North Delhi', 'South Delhi', 'East Delhi',
      'West Delhi', 'Dwarka', 'Rohini', 'Vasant Kunj', 'Janakpuri', 'Connaught Place'
    ],
  },
  {
    code: 'JK',
    name: 'Jammu and Kashmir',
    type: 'UT',
    cities: [
      'Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Kathua', 'Udhampur',
      'Sopore', 'Patan', 'Pampaore', 'Poonch', 'Rajouri'
    ],
  },
  {
    code: 'LA',
    name: 'Ladakh',
    type: 'UT',
    cities: ['Leh', 'Kargil', 'Diskit', 'Padum'],
  },
  {
    code: 'LD',
    name: 'Lakshadweep',
    type: 'UT',
    cities: ['Kavaratti', 'Agatti', 'Amini', 'Andrott', 'Minicoy'],
  },
  {
    code: 'PY',
    name: 'Puducherry',
    type: 'UT',
    cities: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam', 'Ozhukarai'],
  },
];

async function seedIndiaMasters() {
  console.log('🚀 Starting India Location Master Import to Supabase...');
  const startTime = Date.now();

  try {
    const db = await getPrismaClient();

    // 1. Upsert Country: India
    const countryId = 'c0a80101-0000-0000-0000-000000000091';
    await db.$executeRawUnsafe(`
      INSERT INTO "CountryMaster" (id, code, name, "isActive", "createdAt")
      VALUES ('${countryId}', 'IN', 'India', true, NOW())
      ON CONFLICT (code) DO UPDATE SET name = 'India', "isActive" = true;
    `);

    // Retrieve active India Country ID
    const countryResult: any[] = await db.$queryRawUnsafe(`
      SELECT id FROM "CountryMaster" WHERE code = 'IN' LIMIT 1;
    `);
    const activeCountryId = countryResult[0]?.id || countryId;
    console.log(`✅ Country 'India' set up (ID: ${activeCountryId})`);

    let totalStatesInserted = 0;
    let totalCitiesInserted = 0;

    // 2. Loop through 28 States & 8 UTs
    for (const stateData of INDIA_DATA) {
      // Generate deterministic or random UUID for State
      const stateResult: any[] = await db.$queryRawUnsafe(`
        INSERT INTO "StateMaster" (id, code, name, "countryId", "createdAt")
        VALUES (gen_random_uuid()::text, '${stateData.code}', '${stateData.name.replace(/'/g, "''")}', '${activeCountryId}', NOW())
        ON CONFLICT ("countryId", code) 
        DO UPDATE SET name = EXCLUDED.name
        RETURNING id;
      `);

      const stateId = stateResult[0]?.id;
      totalStatesInserted++;

      if (!stateId) {
        console.warn(`Could not obtain State ID for ${stateData.name}`);
        continue;
      }

      // 3. Batch insert cities for this state (bulk insert)
      const uniqueCities = Array.from(new Set(stateData.cities));
      const BATCH_SIZE = 500;

      for (let i = 0; i < uniqueCities.length; i += BATCH_SIZE) {
        const batch = uniqueCities.slice(i, i + BATCH_SIZE);
        const valueTuples = batch
          .map((cityName) => {
            const escapedName = cityName.replace(/'/g, "''");
            return `(gen_random_uuid()::text, '${escapedName}', '${stateId}', NOW())`;
          })
          .join(',\n');

        await db.$executeRawUnsafe(`
          INSERT INTO "CityMaster" (id, name, "stateId", "createdAt")
          VALUES ${valueTuples}
          ON CONFLICT ("stateId", name) DO NOTHING;
        `);

        await db.$executeRawUnsafe(`
          INSERT INTO "DistrictMaster" (id, name, "stateId", "createdAt")
          VALUES ${valueTuples}
          ON CONFLICT ("stateId", name) DO NOTHING;
        `);

        totalCitiesInserted += batch.length;
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n🎉 SUCCESS: Imported India Master Data (States & Districts) into Supabase!`);
    console.log(`📊 Statistics:`);
    console.log(`   - Country: India (1)`);
    console.log(`   - States & UTs: ${totalStatesInserted} (28 States + 8 Union Territories)`);
    console.log(`   - Total Districts / Cities: ${totalCitiesInserted}`);
    console.log(`⏱️ Duration: ${duration} seconds`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding India Master Data:', error);
    process.exit(1);
  }
}

seedIndiaMasters();
