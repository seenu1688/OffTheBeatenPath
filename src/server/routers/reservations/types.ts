import { QueryResult } from "jsforce";

export type RawCreateReservationResponse = {
  Id: string;
  Name: string;
  Departure__c: string;
  Reservation_Name__c: string;
  Experience__c: string;
  Critical__c: boolean;
  RecordTypeId: string;
  Pre_Departure_Confirmation__c: boolean;
  Start_DateTime__c: string;
  End_DateTime__c: string;
  Vendor__c: string;
  Segment__c: string;
};

export type RawReservation = {
  Id: string;
  Name: string;
  Phone: string;
  Website: string;
  Summary_Description__c: null;
  Commission__c: number;
  TaxRate__c: number;
  Activities__r: QueryResult<{
    Id: string;
    Name: string;
    Vendor__c: string;
    Experience_Name__c: string;
  }> | null;
};
