import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

const DEFAULT_COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "United Arab Emirates",
  "Singapore",
  "Canada",
  "Australia"
];

const DEFAULT_STATES: Record<string, string[]> = {
  India: [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Puducherry"
  ]
};

const DEFAULT_DISTRICTS: Record<string, string[]> = {
  "Tamil Nadu": [
    "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri",
    "Dindigul", "Erode", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri",
    "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur",
    "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
    "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur",
    "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram",
    "Virudhunagar"
  ],
  "Maharashtra": [
    "Ahmednagar", "Akola", "Amravati", "Chhatrapati Sambhajinagar", "Beed", "Bhandara", "Buldhana",
    "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna",
    "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded",
    "Nandurbar", "Nashik", "Dharashiv", "Palghar", "Parbhani", "Pune", "Raigad",
    "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha",
    "Washim", "Yavatmal"
  ],
  "Karnataka": [
    "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban",
    "Bidar", "Chamarajanagar", "Chikkaballapura", "Chikkamagaluru", "Chitradurga",
    "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri",
    "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur",
    "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayanagara",
    "Yadgir"
  ],
  "Delhi": [
    "Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi",
    "North West Delhi", "Shahdara", "South Delhi", "South East Delhi",
    "South West Delhi", "West Delhi"
  ]
};

export function useCountries() {
  const query = useQuery({
    queryKey: ['location-countries'],
    queryFn: async (): Promise<string[]> => {
      try {
        const res = await apiClient.get<string[]>('/masters/countries');
        if (Array.isArray(res.data) && res.data.length > 0) return res.data;
      } catch {
        // Fallback to defaults if backend unavailable
      }
      return DEFAULT_COUNTRIES;
    },
    staleTime: 1000 * 60 * 60, // 1 hour caching
  });

  return { ...query, countries: query.data ?? DEFAULT_COUNTRIES };
}

export function useStates(countryName: string) {
  const query = useQuery({
    queryKey: ['location-states', countryName],
    queryFn: async (): Promise<string[]> => {
      if (!countryName) return [];
      try {
        const res = await apiClient.get<string[]>('/masters/states', {
          params: { countryName },
        });
        if (Array.isArray(res.data) && res.data.length > 0) return res.data;
      } catch {
        // Fallback to defaults if backend unavailable
      }
      return DEFAULT_STATES[countryName] || [];
    },
    enabled: !!countryName,
    staleTime: 1000 * 60 * 60,
  });

  const fallback = DEFAULT_STATES[countryName] || [];
  return { ...query, states: (query.data && query.data.length > 0) ? query.data : fallback };
}

export function useCities(countryName: string, stateName: string) {
  const query = useQuery({
    queryKey: ['location-cities', countryName, stateName],
    queryFn: async (): Promise<string[]> => {
      if (!stateName) return [];
      try {
        const res = await apiClient.get<string[]>('/masters/cities', {
          params: { countryName, stateName },
        });
        if (Array.isArray(res.data) && res.data.length > 0) return res.data;
      } catch {
        // Fallback
      }
      return DEFAULT_DISTRICTS[stateName] || [];
    },
    enabled: !!stateName,
    staleTime: 1000 * 60 * 60,
  });

  const fallback = DEFAULT_DISTRICTS[stateName] || [];
  return { ...query, cities: (query.data && query.data.length > 0) ? query.data : fallback };
}

export function useDistricts(countryName: string, stateName: string) {
  const query = useQuery({
    queryKey: ['location-districts', countryName, stateName],
    queryFn: async (): Promise<string[]> => {
      if (!stateName) return [];
      try {
        const res = await apiClient.get<string[]>('/masters/districts', {
          params: { countryName, stateName },
        });
        if (Array.isArray(res.data) && res.data.length > 0) return res.data;
      } catch {
        // Fallback
      }
      return DEFAULT_DISTRICTS[stateName] || [];
    },
    enabled: !!stateName,
    staleTime: 1000 * 60 * 60,
  });

  const fallback = DEFAULT_DISTRICTS[stateName] || [];
  return { ...query, districts: (query.data && query.data.length > 0) ? query.data : fallback };
}

