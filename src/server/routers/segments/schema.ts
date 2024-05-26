import { z } from "zod";

export const createSegmentSchema = z
  .object({
    name: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    departureId: z.string(),
    narrative: z.string().optional(),
    startDateTime: z.string().optional(),
    endDateTime: z.string().optional(),
  })
  .transform((input) => {
    const { departureId, endDate, name, startDate, narrative, startDateTime, endDateTime } =
      input;
    return {
      Segment_Name__c: name,
      Departure__c: departureId,
      EndDate__c: endDate,
      StartDate__c: startDate,
      Narrative__c: narrative,
      start_datetime__c: startDateTime,
      end_datetime__c: endDateTime,
    };
  });
