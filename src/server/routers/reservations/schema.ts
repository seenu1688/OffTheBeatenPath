import { z } from "zod";

export const createReservationsSchema = z
  .object({
    departureId: z.string(),
    segmentId: z.string(),
    vendorId: z.string(),
    reservationName: z.string(),
    startDateTime: z.string(),
    endDateTime: z.string(),
    recordName: z.string(),
    experienceIds: z.array(z.string()).optional(),
  })
  .transform((data) => {
    return {
      pNewRes: {
        Pre_Departure_Confirmation__c: false,
        Critical__c: false,
        Vendor__c: data.vendorId,
        Segment__c: data.segmentId,
        Departure__c: data.departureId,
        Start_DateTime__c: data.startDateTime,
        End_DateTime__c: data.endDateTime,
        Reservation_Name__c: data.reservationName,
      },
      pRecordName: data.recordName,
      experienceIds: data.experienceIds,
    };
  });
