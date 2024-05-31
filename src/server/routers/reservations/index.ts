import { z } from "zod";
import { QueryResult } from "jsforce";

import { authProcedure, router } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import { createReservationsSchema } from "./schema";
import { ReservationResponse } from "@/common/types";

type RawCreateReservationResponse = {
  Id: string;
  Name: string;
  Departure__c: string;
  Critical__c: boolean;
  Experience__c: string;
  RecordTypeId: string;
  Pre_Departure_Confirmation__c: boolean;
  Start_DateTime__c: string;
  End_DateTime__c: string;
  Vendor__c: string;
  Segment__c: string;
};

type RawReservation = {
  Id: string;
  Name: string;
  Phone: string;
  Website: string;
  Summary_Description__c: null;
  Commission__c: number;
  TaxRate__c: number;
  Activities__r: QueryResult<{
    Id: string;
    Name: string;
    Vendor__c: string;
  }> | null;
};

type ReservationExperience = {
  id: string;
  name: string;
  phone: string;
  website: string;
  summary: string | null;
  commission: number;
  taxRate: number;
  experiences: {
    id: string;
    name: string;
    vendor: string;
  }[];
};

export const reservationsRouter = router({
  getExperiences: authProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const query = `SELECT Id, Name, Phone, Website, Summary_Description__c, 
    Commission__c, TaxRate__c, (select Id,name, Vendor__c from Activities__r) from Account WHERE Id='${input}'`;

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
                name: activity.Name,
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
    Experience__r.Name,Vendor__r.Id,Vendor__r.Name,Sum_of_payables_paid__c,Sum_of_payables_unpaid__c, Net_Cost__c, Gross_Cost__c, Total_Commission__c
    FROM Reservation__c WHERE Id='${input}'`;

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
          });
        });
      });
    }),
  create: authProcedure
    .input(createReservationsSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        console.log(input);

        const response = await ctx.apexClient.post<
          RawCreateReservationResponse,
          z.infer<typeof createReservationsSchema>
        >("/createReservation", {
          body: input,
        });

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
});
