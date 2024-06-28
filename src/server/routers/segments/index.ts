import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { authProcedure, router } from "@/server/trpc";

import { createSegmentSchema, updateSegmentSchema } from "./schema";
import { RawSegment } from "../departures/types";

type CreateSegmentPayload = {
  pNewSegment: {
    Segment_Name__c: string;
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
};

type RawResponse = {
  Departure__c: string;
  EndDate__c: string;
  Id: string;
  Narrative__c?: string;
  Segment_Name__c: string;
  StartDate__c: string;
  PrimaryDestinationId__c?: string;
};

export const segmentsRouter = router({
  create: authProcedure
    .input(createSegmentSchema)
    .mutation<SegmentResponse>(async ({ ctx, input }) => {
      try {
        const payload = {
          pNewSegment: input,
        };
        const response = await ctx.apexClient.post<
          RawResponse,
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
  delete: authProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    try {
      const response = await ctx.apexClient.delete(`/deleteRecord`, {
        searchParams: {
          recordId: input,
          sObjectName: "Segment__c",
        },
      });

      if (Array.isArray(response) && response[0]?.errorCode === "APEX_ERROR") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: response[0].message,
        });
      }

      return response;
    } catch (e: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: e.message,
      });
    }
  }),
  update: authProcedure
    .input(updateSegmentSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const response = await ctx.apexClient.put<RawSegment, any>(
          `/updateRecords`,
          {
            body: {
              jsonData: JSON.stringify([
                {
                  attributes: { type: "Segment__c" },
                  ...input,
                },
              ]),
            },
          }
        );

        return response;
      } catch (e: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: e.message,
        });
      }
    }),
});
