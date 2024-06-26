export type RawDeparture = {
  Id: string;
  Name: string;
  Trip__r: {
    Name: string;
  };
  Start_DateTime__c: string;
  End_DateTime__c: string;
  Route_Information__c?: string;
  Arrival_Information__c?: string;
  Departure_Information__c?: string;
};

export type RawReservationRecord = {
  Id: string;
  Reservation_Name__c?: string;
  Experience_Name__c: string;
  Vendor__r: {
    Name: string;
    Vendor_Type__c: string;
  };
  StartDate__c: string;
  EndDate__c: string;
  Start_DateTime__c: string;
  End_DateTime__c: string;
};

export type RawDestinationAssignmentRecord = {
  Id: string;
  Day__r: {
    Date__c: string;
  };
  Destination__c: string;
  Destination__r: {
    Name: string;
  };
};

export type RawSegment = {
  Id: string;
  Segment_Name__c: string;
  Narrative__c: string;
  StartDate__c: string;
  EndDate__c: string;
  start_datetime__c: string;
  end_datetime__c: string;
  PrimaryDestinationId__c: string;
  Reservations__r: {
    totalSize: number;
    done: boolean;
    records: RawReservationRecord[];
  };
  Destination_Assignments__r: {
    totalSize: number;
    done: boolean;
    records: RawDestinationAssignmentRecord[];
  };
};
