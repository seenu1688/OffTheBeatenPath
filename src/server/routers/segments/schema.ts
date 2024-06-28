import { z } from "zod";

export const createSegmentSchema = z
  .object({
    name: z.string(),
    departureId: z.string(),
    narrative: z.string().optional(),
    startDateTime: z.string().optional(),
    endDateTime: z.string().optional(),
    primaryDestinationId: z.string().optional(),
  })
  .transform((input) => {
    const { departureId, name, narrative, startDateTime, endDateTime } = input;
    return {
      Segment_Name__c: name,
      Departure__c: departureId,
      Narrative__c: narrative,
      start_datetime__c: startDateTime,
      end_datetime__c: endDateTime,
      PrimaryDestinationId__c: input.primaryDestinationId,
    };
  });

export const updateSegmentSchema = z
  .object({
    name: z.string(),
    departureId: z.string(),
    narrative: z.string().optional(),
    startDateTime: z.string(),
    endDateTime: z.string(),
    segmentId: z.string(),
  })
  .transform((input) => {
    const { departureId, name, narrative, startDateTime, endDateTime } = input;
    return {
      Segment_Name__c: name,
      Departure__c: departureId,
      Narrative__c: narrative,
      start_datetime__c: startDateTime,
      end_datetime__c: endDateTime,
      Id: input.segmentId,
    };
  });
