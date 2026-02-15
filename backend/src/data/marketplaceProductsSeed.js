const buildProductImage = (name, category, id) => {
  const tags = `${name} ${category} agriculture farm`
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2)
    .slice(0, 6)
    .join(',');

  const query = tags || `${String(category).toLowerCase()},agriculture`;
  return `https://loremflickr.com/900/650/${query}?lock=${encodeURIComponent(id)}`;
};

const baseMarketplaceProducts = [
  {
    productCode: 'seed-001',
    name: 'Hybrid Paddy Seeds (IR-64)',
    category: 'Seeds',
    brand: 'AgriPrime',
    price: 1450,
    unit: '10 kg',
    stock: 180,
    rating: 4.8,
    description: 'High-yield paddy seed variety suitable for irrigated conditions.',
    image: 'https://5.imimg.com/data5/SELLER/Default/2024/5/419825843/ZG/JP/HJ/7691762/real-super-manju-seed-500x500.jpg'
  },
  {
    productCode: 'seed-002',
    name: 'Wheat HD-2967 Seeds',
    category: 'Seeds',
    brand: 'FarmGen',
    price: 1250,
    unit: '10 kg',
    stock: 140,
    rating: 4.7,
    description: 'Popular wheat variety with stable grain quality.',
    image: 'https://5.imimg.com/data5/IOS/Default/2025/7/526171468/FW/KL/GO/129705750/product-jpeg.jpeg'
  },
  {
    productCode: 'seed-003',
    name: 'Maize Gold F1 Seeds',
    category: 'Seeds',
    brand: 'CropNova',
    price: 1680,
    unit: '8 kg',
    stock: 110,
    rating: 4.6,
    description: 'Fast-growing maize hybrid for high productivity.'
  },
  {
    productCode: 'seed-004',
    name: 'Cotton BT Hybrid Seeds',
    category: 'Seeds',
    brand: 'GrowMax',
    price: 1890,
    unit: '6 kg',
    stock: 95,
    rating: 4.5,
    description: 'Pest-resistant cotton hybrid for improved lint quality.'
  },
  {
    productCode: 'fert-001',
    name: 'Urea 46% N',
    category: 'Fertilizers',
    brand: 'IFFCO',
    price: 340,
    unit: '45 kg bag',
    stock: 320,
    rating: 4.8,
    description: 'Nitrogen fertilizer for vegetative crop growth.'
  },
  {
    productCode: 'fert-002',
    name: 'DAP 18-46-0',
    category: 'Fertilizers',
    brand: 'Coromandel',
    price: 1475,
    unit: '50 kg bag',
    stock: 250,
    rating: 4.7,
    description: 'Phosphorus-rich fertilizer for root development.'
  },
  {
    productCode: 'fert-003',
    name: 'NPK 19-19-19 Water Soluble',
    category: 'Fertilizers',
    brand: 'GreenLeaf',
    price: 1180,
    unit: '25 kg',
    stock: 170,
    rating: 4.6,
    description: 'Balanced NPK for foliar and fertigation application.'
  },
  {
    productCode: 'fert-004',
    name: 'MOP Potash',
    category: 'Fertilizers',
    brand: 'Nutrisoil',
    price: 980,
    unit: '50 kg bag',
    stock: 210,
    rating: 4.5,
    description: 'Potassium supplement for stress tolerance and quality.'
  },
  {
    productCode: 'fert-005',
    name: 'Organic Vermicompost',
    category: 'Fertilizers',
    brand: 'EcoFarm',
    price: 540,
    unit: '40 kg bag',
    stock: 190,
    rating: 4.7,
    description: 'Organic soil conditioner with beneficial microbes.'
  },
  {
    productCode: 'pest-001',
    name: 'Neem Oil Bio-Pesticide',
    category: 'Pesticides',
    brand: 'BioShield',
    price: 390,
    unit: '1 L',
    stock: 260,
    rating: 4.6,
    description: 'Broad-spectrum natural pest deterrent for crops.'
  },
  {
    productCode: 'pest-002',
    name: 'Fungal Shield Fungicide',
    category: 'Pesticides',
    brand: 'CropCare',
    price: 670,
    unit: '500 ml',
    stock: 130,
    rating: 4.5,
    description: 'Controls leaf spot, blight, and fungal infections.'
  },
  {
    productCode: 'pest-003',
    name: 'Insect Control EC',
    category: 'Pesticides',
    brand: 'AgroSafe',
    price: 820,
    unit: '1 L',
    stock: 120,
    rating: 4.4,
    description: 'Systemic insecticide for sucking and chewing pests.'
  },
  {
    productCode: 'pest-004',
    name: 'Sticky Trap Pack',
    category: 'Pesticides',
    brand: 'FieldGuard',
    price: 260,
    unit: '20 traps',
    stock: 230,
    rating: 4.3,
    description: 'Non-chemical pest monitoring and control traps.'
  },
  {
    productCode: 'tool-001',
    name: 'Hand Weeder',
    category: 'Tools',
    brand: 'KisanPro',
    price: 850,
    unit: 'piece',
    stock: 160,
    rating: 4.6,
    description: 'Ergonomic tool for quick weed removal.'
  },
  {
    productCode: 'tool-002',
    name: 'Pruning Shear Heavy Duty',
    category: 'Tools',
    brand: 'FarmEdge',
    price: 620,
    unit: 'piece',
    stock: 140,
    rating: 4.7,
    description: 'Stainless steel shears for pruning stems and branches.'
  },
  {
    productCode: 'tool-003',
    name: 'Soil pH Meter',
    category: 'Tools',
    brand: 'AgriSense',
    price: 1290,
    unit: 'piece',
    stock: 90,
    rating: 4.5,
    description: 'Portable meter for pH and moisture checks.'
  },
  {
    productCode: 'tool-004',
    name: 'Battery Sprayer 16L',
    category: 'Tools',
    brand: 'SprayTech',
    price: 3890,
    unit: 'piece',
    stock: 70,
    rating: 4.6,
    description: 'Rechargeable sprayer for pesticide and foliar use.'
  },
  {
    productCode: 'irri-001',
    name: 'Drip Irrigation Kit (1 Acre)',
    category: 'Irrigation',
    brand: 'AquaRoot',
    price: 15400,
    unit: 'set',
    stock: 45,
    rating: 4.8,
    description: 'Water-saving drip system with filters and fittings.'
  },
  {
    productCode: 'irri-002',
    name: 'Rain Gun Sprinkler',
    category: 'Irrigation',
    brand: 'HydroJet',
    price: 4350,
    unit: 'piece',
    stock: 85,
    rating: 4.6,
    description: 'High-coverage sprinkler for medium/large plots.'
  },
  {
    productCode: 'irri-003',
    name: 'PVC Lateral Pipe',
    category: 'Irrigation',
    brand: 'FlowLine',
    price: 980,
    unit: '100 m roll',
    stock: 200,
    rating: 4.4,
    description: 'Durable lateral pipe for drip and sprinkler setups.'
  },
  {
    productCode: 'mach-001',
    name: 'Power Tiller 7HP',
    category: 'Machinery',
    brand: 'FieldMaster',
    price: 96500,
    unit: 'unit',
    stock: 18,
    rating: 4.7,
    description: 'Compact tiller for ploughing and land preparation.'
  },
  {
    productCode: 'mach-002',
    name: 'Mini Rice Transplanter',
    category: 'Machinery',
    brand: 'AgriMech',
    price: 185000,
    unit: 'unit',
    stock: 8,
    rating: 4.5,
    description: 'Mechanized transplanting for paddy fields.'
  },
  {
    productCode: 'mach-003',
    name: 'Multi-crop Thresher',
    category: 'Machinery',
    brand: 'HarvX',
    price: 73500,
    unit: 'unit',
    stock: 12,
    rating: 4.6,
    description: 'Efficient threshing machine for multiple grains.'
  },
  {
    productCode: 'iot-001',
    name: 'Soil Moisture IoT Sensor',
    category: 'Smart Devices',
    brand: 'AgriIoT',
    price: 2490,
    unit: 'device',
    stock: 95,
    rating: 4.5,
    description: 'Real-time soil moisture monitoring with app alerts.'
  },
  {
    productCode: 'iot-002',
    name: 'Farm Weather Station',
    category: 'Smart Devices',
    brand: 'ClimateField',
    price: 18400,
    unit: 'device',
    stock: 40,
    rating: 4.7,
    description: 'Tracks rainfall, humidity, wind, and temperature on-field.'
  },
  {
    productCode: 'iot-003',
    name: 'Auto Irrigation Controller',
    category: 'Smart Devices',
    brand: 'IrriSmart',
    price: 9700,
    unit: 'device',
    stock: 60,
    rating: 4.6,
    description: 'Automates irrigation scheduling based on sensor data.'
  },
  {
    productCode: 'feed-001',
    name: 'Cattle Feed Premium Mix',
    category: 'Livestock',
    brand: 'DairyPlus',
    price: 1250,
    unit: '50 kg bag',
    stock: 180,
    rating: 4.6,
    description: 'Balanced feed mix for dairy cattle productivity.'
  },
  {
    productCode: 'feed-002',
    name: 'Mineral Mixture for Cattle',
    category: 'Livestock',
    brand: 'VetFarm',
    price: 390,
    unit: '1 kg',
    stock: 210,
    rating: 4.5,
    description: 'Supports bone health and milk yield in livestock.'
  }
];

const marketplaceProductsSeed = baseMarketplaceProducts.map((item) => ({
  ...item,
  image: item.image || buildProductImage(item.name, item.category, item.productCode)
}));

module.exports = { marketplaceProductsSeed };

