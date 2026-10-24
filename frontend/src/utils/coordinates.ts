/**
 * Real Pune Metro Station and Major IT Feeder Hub Coordinates (Latitude, Longitude)
 */
export const PUNE_COORDINATES: Record<string, [number, number]> = {
  // Aqua Line (Line 2)
  "Vanaz": [18.5074, 73.8077],
  "Anand Nagar": [18.5090, 73.8150],
  "Ideal Colony": [18.5095, 73.8210],
  "Nal Stop": [18.5108, 73.8290],
  "Garware College": [18.5173, 73.8398],
  "Deccan Gymkhana": [18.5204, 73.8449],
  "Chhatrapati Sambhaji Udyan": [18.5240, 73.8491],
  "PMC": [18.5259, 73.8540],
  "Civil Court": [18.5284, 73.8549],
  "Mangalwar Peth": [18.5270, 73.8633],
  "Pune Railway Station": [18.5289, 73.8744],
  "Ruby Hall Clinic": [18.5332, 73.8789],
  "Bund Garden": [18.5398, 73.8864],
  "Kalyani Nagar": [18.5477, 73.9038],
  "Ramwadi": [18.5529, 73.9167],

  // Purple Line (Line 1)
  "PCMC": [18.6277, 73.8055],
  "Sant Tukaram Nagar": [18.6190, 73.8115],
  "Bhosari": [18.6080, 73.8190],
  "Kasarwadi": [18.5980, 73.8240],
  "Phugewadi": [18.5870, 73.8280],
  "Dapodi": [18.5770, 73.8320],
  "Bopodi": [18.5660, 73.8380],
  "Shivaji Nagar": [18.5320, 73.8500],
  "Budhwar Peth": [18.5190, 73.8560],
  "Mandai": [18.5130, 73.8570],
  "Swargate": [18.5018, 73.8584],

  // Common Feeder Destinations
  "EON IT Park Kharadi": [18.5516, 73.9515],
  "Hinjawadi Phase 1": [18.5913, 73.7389],
  "Hinjawadi Phase 2": [18.5950, 73.7160],
  "Hinjawadi Phase 3": [18.5890, 73.6890],
  "Magarpatta City": [18.5158, 73.9272],
  "Viman Nagar Symbiosis": [18.5670, 73.9140],
  "Aundh ITI Road": [18.5610, 73.8080],
  "Baner Balewadi High Street": [18.5685, 73.7745],
  "Senapati Bapat Road": [18.5320, 73.8310],
  "Yerawada Commerzone": [18.5580, 73.8890],
  "Kalyani Nagar Cerebrum": [18.5480, 73.9060],
  "Hadapsar SP Infocity": [18.4970, 73.9450],
};

export const getCoordinates = (name: string): [number, number] => {
  const clean = name.replace(" Metro Station", "").replace(" Metro", "").trim();
  for (const [key, coords] of Object.entries(PUNE_COORDINATES)) {
    if (clean.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(clean.toLowerCase())) {
      return coords;
    }
  }
  // Default to Pune Civil Court center
  return [18.5284, 73.8549];
};
