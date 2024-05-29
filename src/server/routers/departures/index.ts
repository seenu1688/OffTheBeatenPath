import z from "zod";

import { authProcedure, router } from "@/server/trpc";

import { fetchDepartureById, fetchSegmentsByDepartureId } from "./apis";

export const departuresRouter = router({
  getById: authProcedure.input(z.string()).query(({ ctx, input }) => {
    const { salesforceClient } = ctx;

    try {
      return fetchDepartureById({
        client: salesforceClient,
        departureId: input,
      });
    } catch (err) {
      throw err;
    }
  }),
  getSegments: authProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return fetchSegmentsByDepartureId({
      client: ctx.salesforceClient,
      departureId: input,
    });
  }),
  updateDepartureDates: authProcedure
    .input(
      z.object({
        departureId: z.string(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { apexClient } = ctx;

      try {
        const response = await apexClient.put("/updateRecords", {
          body: {
            jsonData: JSON.stringify([
              {
                attributes: { type: "Departure__c" },
                Start_DateTime__c: input.startDate,
                End_DateTime__c: input.endDate,
                Id: input.departureId,
              },
            ]),
          },
        });

        return response;
      } catch (err) {
        console.log(err);

        throw err;
      }
    }),
  saveRouteInfo: authProcedure
    .input(z.object({ departureId: z.string(), routeInfo: z.string() }))
    .mutation(async ({ ctx, input }) => {
      console.log(
        JSON.stringify({
          jsonData: [
            {
              attributes: { type: "Departure__c" },
              Id: input.departureId,
              Route_Information__c: input.routeInfo,
            },
          ],
        })
      );

      try {
        const response = await ctx.apexClient.put("/updateRecords", {
          body: {
            jsonData: JSON.stringify([
              {
                attributes: { type: "Departure__c" },
                Id: input.departureId,
                Route_Information__c: input.routeInfo,
              },
            ]),
          },
        });

        return response;
      } catch (err) {
        console.log("error");

        console.log(err);

        throw err;
      }
    }),
});
