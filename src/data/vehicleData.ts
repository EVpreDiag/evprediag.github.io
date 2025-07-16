export interface VehicleData {
  [make: string]: string[];
}

export const vehicleData: VehicleData = {
  "Acura": ["ILX", "TLX", "RLX", "MDX", "RDX", "NSX", "Integra"],
  "Audi": ["A3", "A4", "A5", "A6", "A7", "A8", "Q3", "Q5", "Q7", "Q8", "e-tron", "e-tron GT", "RS3", "RS4", "RS5", "RS6", "RS7", "R8"],
  "BMW": ["1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "6 Series", "7 Series", "8 Series", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "Z4", "i3", "i4", "iX", "iX3"],
  "Buick": ["Encore", "Encore GX", "Envision", "Enclave", "Regal", "LaCrosse"],
  "Cadillac": ["ATS", "CTS", "CT4", "CT5", "CT6", "XT4", "XT5", "XT6", "Escalade", "Lyriq"],
  "Chevrolet": ["Spark", "Sonic", "Cruze", "Malibu", "Impala", "Camaro", "Corvette", "Trax", "Equinox", "Blazer", "Traverse", "Tahoe", "Suburban", "Colorado", "Silverado", "Bolt EV", "Bolt EUV"],
  "Chrysler": ["300", "Pacifica", "Voyager"],
  "Dodge": ["Charger", "Challenger", "Durango", "Journey", "Grand Caravan"],
  "Ford": ["Fiesta", "Focus", "Fusion", "Mustang", "EcoSport", "Escape", "Edge", "Explorer", "Expedition", "Ranger", "F-150", "F-250", "F-350", "Bronco", "Bronco Sport", "Mustang Mach-E", "F-150 Lightning"],
  "Genesis": ["G70", "G80", "G90", "GV60", "GV70", "GV80"],
  "GMC": ["Terrain", "Acadia", "Yukon", "Canyon", "Sierra", "Hummer EV"],
  "Honda": ["Fit", "Civic", "Accord", "Insight", "CR-V", "HR-V", "Pilot", "Passport", "Ridgeline", "Clarity"],
  "Hyundai": ["Accent", "Elantra", "Sonata", "Azera", "Veloster", "Venue", "Kona", "Tucson", "Santa Fe", "Palisade", "Ioniq", "Ioniq 5", "Ioniq 6"],
  "Infiniti": ["Q50", "Q60", "Q70", "QX30", "QX50", "QX60", "QX80"],
  "Jaguar": ["XE", "XF", "XJ", "F-Type", "E-Pace", "F-Pace", "I-Pace"],
  "Jeep": ["Compass", "Cherokee", "Grand Cherokee", "Wrangler", "Gladiator", "Renegade", "Wagoneer", "Grand Wagoneer"],
  "Kia": ["Rio", "Forte", "K5", "Stinger", "Soul", "Seltos", "Sportage", "Sorento", "Telluride", "Niro", "EV6"],
  "Land Rover": ["Discovery Sport", "Discovery", "Range Rover Evoque", "Range Rover Velar", "Range Rover Sport", "Range Rover", "Defender"],
  "Lexus": ["IS", "ES", "GS", "LS", "RC", "LC", "UX", "NX", "RX", "GX", "LX"],
  "Lincoln": ["MKZ", "Continental", "Corsair", "Nautilus", "Aviator", "Navigator"],
  "Mazda": ["Mazda3", "Mazda6", "MX-5 Miata", "CX-3", "CX-30", "CX-5", "CX-9", "CX-50"],
  "Mercedes-Benz": ["A-Class", "C-Class", "E-Class", "S-Class", "CLA", "CLS", "GLA", "GLB", "GLC", "GLE", "GLS", "G-Class", "SL", "AMG GT", "EQC", "EQS", "EQB"],
  "Mitsubishi": ["Mirage", "Lancer", "Eclipse Cross", "Outlander", "Outlander Sport"],
  "Nissan": ["Sentra", "Altima", "Maxima", "370Z", "GT-R", "Kicks", "Rogue", "Murano", "Pathfinder", "Armada", "Frontier", "Titan", "Leaf"],
  "Polestar": ["Polestar 1", "Polestar 2", "Polestar 3"],
  "Porsche": ["718 Boxster", "718 Cayman", "911", "Panamera", "Macan", "Cayenne", "Taycan"],
  "Ram": ["1500", "2500", "3500", "ProMaster", "ProMaster City"],
  "Subaru": ["Impreza", "Legacy", "Outback", "Forester", "Crosstrek", "Ascent", "WRX", "BRZ"],
  "Tesla": ["Model S", "Model 3", "Model X", "Model Y", "Cybertruck", "Roadster"],
  "Toyota": ["Corolla", "Camry", "Avalon", "Prius", "C-HR", "RAV4", "Highlander", "4Runner", "Sequoia", "Land Cruiser", "Tacoma", "Tundra", "Sienna", "86", "Supra", "Mirai", "bZ4X"],
  "Volkswagen": ["Jetta", "Passat", "Arteon", "Golf", "ID.4", "Taos", "Tiguan", "Atlas", "Atlas Cross Sport"],
  "Volvo": ["S60", "S90", "V60", "V90", "XC40", "XC60", "XC90", "C40 Recharge", "XC40 Recharge"]
};

export const getAllMakes = (): string[] => {
  return Object.keys(vehicleData).sort();
};

export const getModelsForMake = (make: string): string[] => {
  return vehicleData[make] || [];
};