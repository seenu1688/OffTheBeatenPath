import { z } from "zod";

export const createSegmentSchema = z
  .object({
    name: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    departureId: z.string(),
    narrative: z.string().optional(),
  })
  .transform((input) => {
    const { departureId, endDate, name, primaryDestinationId, startDate, narrative } =
      input;
    return {
      Segment_Name__c: name,
      Departure__c: departureId,
      EndDate__c: endDate,
      StartDate__c: startDate,
      Narrative__c: narrative
    };
  });
