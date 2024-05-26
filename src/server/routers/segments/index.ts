import { TRPCError } from "@trpc/server";

import { authProcedure, router } from "@/server/trpc";

import { createSegmentSchema } from "./schema";

type CreateSegmentPayload = {
  pNewSegment: {
    Segment_Name__c: string;
    StartDate__c: string;
    EndDate__c: string;
    Departure__c: string;
    Narrative__c?: string;
    start_datetime__c?: string;
    end_datetime__c?: string;
    primaryDestinationId?: string;
  };
};

type SegmentResponse = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  primaryDestinationId: string;
  narrative?: string;
  startDateTime?: string;
  endDateTime?: string;
}

export const segmentsRouter = router({
  create: authProcedure
    .input(createSegmentSchema)
    .mutation<SegmentResponse>(async ({ ctx, input }) => {
      try {
        const payload = {
          pNewSegment: input,
        };
        const response = await ctx.apexClient.post<
          {
            Departure__c: string;
            EndDate__c: string;
            Id: string;
            Narrative__c?: string;
            Segment_Name__c: string;
            StartDate__c: string;
            PrimaryDestinationId__c?: string;
          },
          CreateSegmentPayload
        >("/createSegment", {
          body: payload,
        });


        return {
          id: response.Id,
          name: response.Segment_Name__c,
          endDate: response.EndDate__c,
          narrative: response.Narrative__c,
          startDate: response.StartDate__c,
          primaryDestinationId: response.PrimaryDestinationId__c || "",
        };
      } catch (e: any) {
        console.log(e);
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: e.message,
        });
      }
    }),
});
