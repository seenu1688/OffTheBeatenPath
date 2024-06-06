import z from "zod";

import { authProcedure, router } from "@/server/trpc";

import { fetchDepartureById, fetchSegmentsByDepartureId } from "./apis";

const departureUpdateSchema = z
  .object({
    departureId: z.string(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    arrivalInfo: z.string().optional(),
    departureInfo: z.string().optional(),
  })
  .transform((data) => {
    const input = {
      Start_DateTime__c: data.startDate,
      End_DateTime__c: data.endDate,
      Id: data.departureId,
      Arrival_Information__c: data.arrivalInfo,
      Departure_Information__c: data.departureInfo,
    };

    for (const key in input) {
      if ((input as any)[key] === undefined) {
        delete (input as any)[key];
      }
    }

    return input;
  });

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
  update: authProcedure
    .input(departureUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { apexClient } = ctx;

      try {
        const response = await apexClient.put("/updateRecords", {
          body: {
            jsonData: JSON.stringify([
              {
                attributes: { type: "Departure__c" },
                ...input,
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
