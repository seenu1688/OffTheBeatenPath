import { z } from "zod";

import { authProcedure, router } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import { createReservationsSchema } from "./schema";
import { QueryResult } from "jsforce";

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

type Reservation = {
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
  getById: authProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const query = `SELECT Id, Name, Phone, Website, Summary_Description__c, 
    Commission__c, TaxRate__c, (select Id,name, Vendor__c from Activities__r) from Account WHERE Id='${input}'`;

    return new Promise<Reservation>(async (resolve, reject) => {
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
});
