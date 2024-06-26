import { z } from "zod";

import { authProcedure, router } from "@/server/trpc";
import { TRPCError } from "@trpc/server";

import { createReservationsSchema } from "./schema";

import { ReservationExperience, ReservationResponse } from "@/common/types";
import { RawCreateReservationResponse, RawReservation } from "./types";

export const reservationsRouter = router({
  getExperiences: authProcedure
    .input(z.string())
    .query(async ({ ctx, input: destinationId }) => {
      const query = `SELECT Id, Name, Phone, Website, Summary_Description__c, 
    Commission__c, TaxRate__c, (select Id,name,Experience_Name__c, Vendor__c from Activities__r) from Account WHERE Id='${destinationId}'`;

      return new Promise<ReservationExperience>(async (resolve, reject) => {
        ctx.salesforceClient.query<RawReservation>(query, {}, (err, result) => {
          if (err) {
            console.log(err);

            reject(err);
          }

          const record = result.records[0];

          resolve({
            id: record.Id,
            name: record.Name,
            phone: record.Phone,
            website: record.Website,
            summary: record.Summary_Description__c,
            commission: record.Commission__c,
            taxRate: record.TaxRate__c,
            experiences:
              record.Activities__r?.records.map((activity) => ({
                id: activity.Id,
                name: activity.Experience_Name__c,
                vendor: activity.Vendor__c,
              })) || [],
          });
        });
      });
    }),
  getById: authProcedure
    .input(z.string())
    .query<ReservationResponse>(async ({ ctx, input }) => {
      const query = `SELECT Id, Name,Experience_Name__c, Departure__c, Vendor__c,  Start_DateTime__c, End_DateTime__c, RecordType.Name, 
      Experience__r.Name,Vendor__r.Id,Vendor__r.Name,Sum_of_payables_paid__c,Sum_of_payables_unpaid__c, Net_Cost__c, Gross_Cost__c, Total_Commission__c,
      Critical__c, Pre_Departure_Confirmation__c, Status__c FROM Reservation__c WHERE Id='${input}'`;

      return new Promise<ReservationResponse>(async (resolve, reject) => {
        ctx.salesforceClient.query<any>(query, {}, (err, result) => {
          if (err) {
            console.log(err);

            reject(err);
          }

          const record = result.records[0];

          resolve({
            id: record.Id,
            name: record.Name,
            departure: record.Departure__c,
            recordTypeName: record.RecordType.Name,
            vendor: {
              id: record.Vendor__r.Id,
              name: record.Vendor__r.Name,
            },
            startDateTime: record.Start_DateTime__c,
            endDateTime: record.End_DateTime__c,
            recordType: record.RecordType.Name,
            experience: {
              name: record.Experience_Name__c,
            },
            payables: {
              paid: record.Sum_of_payables_paid__c,
              unpaid: record.Sum_of_payables_unpaid__c,
            },
            netCost: record.Net_Cost__c,
            grossCost: record.Gross_Cost__c,
            totalCommission: record.Total_Commission__c,
            status: record.Status__c,
            critical: record.Critical__c,
            preDepartureConfirmation: record.Pre_Departure_Confirmation__c,
          });
        });
      });
    }),
  create: authProcedure
    .input(createReservationsSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { experienceIds, ...payload } = input;

        const response = await ctx.apexClient.post<
          RawCreateReservationResponse,
          Omit<z.infer<typeof createReservationsSchema>, "experienceIds">
        >("/createReservation", {
          body: payload,
        });

        try {
          if (experienceIds && experienceIds?.length > 0) {
            // create experience line items
            await ctx.apexClient.post(`/createRecords`, {
              body: {
                jsonData: JSON.stringify(
                  experienceIds.map((id) => {
                    return {
                      attributes: { type: "Experience_Line_Item__c" },
                      Experience__c: id,
                      Reservation__c: response.Id,
                    };
                  })
                ),
              },
            });
          }
        } catch (e) {
          console.log(e);
        }

        return {
          id: response.Id,
          name: response.Name,
          departure: response.Departure__c,
          critical: response.Critical__c,
          experience: response.Experience__c,
          recordTypeId: response.RecordTypeId,
          preDepartureConfirmation: response.Pre_Departure_Confirmation__c,
          startDateTime: response.Start_DateTime__c,
          endDateTime: response.End_DateTime__c,
          vendor: response.Vendor__c,
          segment: response.Segment__c,
          reservationName: response.Reservation_Name__c,
        };
      } catch (error) {
        console.log(error);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create reservation",
          cause: error,
        });
      }
    }),
  delete: authProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    const response = await ctx.apexClient.delete("/deleteRecord", {
      searchParams: { sObjectName: "Reservation__c", recordId: input },
    });

    if (Array.isArray(response) && response[0]?.errorCode === "APEX_ERROR") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: response[0].message,
      });
    }

    return response;
  }),
  update: authProcedure
    .input(
      z.object({
        startDateTime: z.string(),
        endDateTime: z.string(),
        reservationId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const response = await ctx.apexClient.put(`/updateRecords`, {
        body: {
          jsonData: JSON.stringify([
            {
              attributes: { type: "Reservation__c" },
              Id: input.reservationId,
              Start_DateTime__c: input.startDateTime,
              End_DateTime__c: input.endDateTime,
            },
          ]),
        },
      });

      return response;
    }),
});
