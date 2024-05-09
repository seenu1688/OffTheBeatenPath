export type Geolocation = {
  lat: number;
  lng: number;
};

export type Destination = {
  id: string;
  name: string;
  geolocation: Geolocation;
  vendorType: string;
  vendorName: string;
};

// departures types
export type Departure = {
  id: string;
  name: string;
  tripName: string;
  startDate: string;
  endDate: string;
};
