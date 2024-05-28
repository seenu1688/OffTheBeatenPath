import { z } from "zod";

export const createReservationsSchema = z
  .object({
    departureId: z.string(),
    segmentId: z.string(),
    experienceId: z.string(),
    vendorId: z.string(),
    startDateTime: z.string(),
    endDateTime: z.string(),
    recordName: z.string(),
  })
  .transform((data) => {
    return {
      pNewRes: {
        Pre_Departure_Confirmation__c: false,
        Critical__c: false,
        Vendor__c: data.vendorId,
        Experience__c: data.experienceId,
        Segment__c: data.segmentId,
        Departure__c: data.departureId,
        Start_DateTime__c: data.startDateTime,
        End_DateTime__c: data.endDateTime,
      },
      pRecordName: data.recordName,
    };
  });
