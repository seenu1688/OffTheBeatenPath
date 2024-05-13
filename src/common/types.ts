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

//

export type Reservation = {
  id: string;
  segmentId: string;
  name: string;
  vendorName: string;
  startDate: string;
  endDate: string;
};

export type DestinationAssignment = {
  id: string;
  segmentId: string;
  destinationId: string;
  name: string;
  startDate: string;
  endDate: string;
};

export type Segment = {
  id: string;
  name: string;
  narrative: string | null;
  startDate: string;
  endDate: string;
  primaryDestinationId: string;
};

export type DeparturesResponse = {
  segments: Segment[];
  destinations: DestinationAssignment[];
  reservations: Reservation[];
  routes: any[];
  activities: any[];
  guides: any[];
  meals: any[];
  transportation: any[];
  other: any[];
};
