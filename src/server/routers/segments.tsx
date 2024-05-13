import { authProcedure, router } from "../trpc";

import z from "zod";

/**
 * 
SELECT Id, Segment_Name__c, Narrative__c, StartDate__c, EndDate__c, PrimaryDestinationId__c,
            (SELECT Id, Experience_Name__c, Vendor__r.Name, StartDate__c, EndDate__c FROM Reservations__r),
            (SELECT Id, Day__r.Date__c, Destination__c, Destination__r.Name FROM Destination_Assignments__r)
        FROM Segment__c
        WHERE Departure__c='a0ANt000000PQ5lMAG'
 */

export const segmentsRouter = router({
  getById: authProcedure.input(z.string()).query(({ ctx, input }) => {}),
});
