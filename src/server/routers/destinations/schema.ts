import { z } from "zod";

export const createDestinationSchema = z
  .object({
    name: z.string(),
    departureId: z.string(),
    segmentId: z.string(),
    narrative: z.string().optional(),
    startDateTime: z.string().optional(),
    endDateTime: z.string().optional(),
  })
  .transform((input) => {
    const { departureId, name, narrative, startDateTime, endDateTime } = input;
    return {
      Segment_Name__c: name,
      Departure__c: departureId,
      Narrative__c: narrative,
      start_datetime__c: startDateTime,
      end_datetime__c: endDateTime,
    };
  });
