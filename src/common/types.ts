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
  recordType: {
    id?: string;
    name?: string;
  };
  parentDestination: {
    id?: string;
    name?: string;
  };
  verificationStatus: "Approved" | "Not Approved";
};

export type Account = {
  id: string;
  name: string;
  geolocation: Geolocation;
  vendorType: string;
  vendorName: string;
  website?: string;
};

// departures types
export type Departure = {
  id: string;
  name: string;
  tripName: string;
  startDate: string;
  endDate: string;
  routeInfo?: string;
  arrivalInfo?: string;
  departureInfo?: string;
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
  count: number;
};

export type DeparturesResponse = {
  segments: Segment[];
  destinations: DestinationAssignment[];
  reservations: Reservation[];
  lodging: any[];
  routes: any[];
  activities: any[];
  guides: any[];
  meals: any[];
  transportation: any[];
  other: any[];
};

export type ReservationResponse = {
  id: string;
  name: string;
  departure: string;
  recordTypeName: string;
  vendor: {
    id: string;
    name: string;
  };
  startDateTime: string;
  endDateTime: string;
  recordType: string;
  experience: {
    name: string;
  };
  payables: {
    paid: number;
    unpaid: number;
  };
  netCost: number;
  totalCommission: number;
  grossCost: number;
  preDepartureConfirmation: boolean;
  status: string;
  critical: boolean;
};

export type PickList = {
  name: string;
  label: string;
  values: {
    label: string;
    value: string;
  }[];
};

export type VendorInfo = {
  commission: number;
  taxRate: number;
  grossMarginTarget: number;
};

export type ReservationExperience = {
  id: string;
  name: string;
  phone: string;
  website: string;
  summary: string | null;
  commission: number;
  taxRate: number;
  experiences: {
    id: string;
    name: string;
    vendor: string;
  }[];
};
