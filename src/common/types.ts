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
