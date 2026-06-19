export const cityOptions = [
  "Coimbatore, Tamil Nadu",
  "Chennai, Tamil Nadu",
  "Madurai, Tamil Nadu",
  "Salem, Tamil Nadu",
  "Erode, Tamil Nadu",
  "Tiruppur, Tamil Nadu",
  "Trichy, Tamil Nadu",
  "Bengaluru, Karnataka",
  "Kochi, Kerala",
  "Hyderabad, Telangana",
  "Mumbai, Maharashtra",
  "Delhi",
  "Goa",
  "Pondicherry",
  "Ooty, Tamil Nadu",
  "Kodaikanal, Tamil Nadu",
];

export const transportModes = [
  "Metro",
  "Bus",
  "Train",
  "Taxi",
  "Auto",
  "Bike Taxi",
  "Walking",
];

export const dashboardStats = [
  { title: "AI Route Score", value: "94%", note: "Optimised route accuracy" },
  { title: "Live Services", value: "24", note: "Vehicles currently tracked" },
  { title: "Average Saving", value: "18 min", note: "Per planned journey" },
];

export const defaultRoutes = [
  {
    label: "Fastest",
    title: "Metro + Bus",
    duration: "1 hr 15 min",
    distance: "34 km",
    price: 95,
    modes: ["Metro", "Bus"],
  },
  {
    label: "Lowest Cost",
    title: "Public Bus",
    duration: "1 hr 40 min",
    distance: "36 km",
    price: 55,
    modes: ["Bus", "Walking"],
  },
  {
    label: "Comfort",
    title: "Train + Taxi",
    duration: "1 hr 25 min",
    distance: "39 km",
    price: 180,
    modes: ["Train", "Taxi"],
  },
  {
    label: "Door to Door",
    title: "Direct Taxi",
    duration: "58 min",
    distance: "32 km",
    price: 420,
    modes: ["Taxi"],
  },
];

export const monthlyStats = [
  { month: "Jan", value: 5 },
  { month: "Feb", value: 8 },
  { month: "Mar", value: 6 },
  { month: "Apr", value: 11 },
  { month: "May", value: 9 },
  { month: "Jun", value: 14 },
];
