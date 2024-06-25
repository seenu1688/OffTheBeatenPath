import { z } from "zod";
import { QueryResult } from "jsforce";

import { authProcedure, router } from "@/server/trpc";
import { updateExperienceSchema } from "./schema";

import { ExperienceLineItem, RawExperienceLineItem } from "./types";

export const experiencesRouter = router({
  getAllByReservationId: authProcedure
    .input(
      z.object({
        reservationId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const query = `SELECT Id, OwnerId, IsDeleted, Reservation__c, Experience__c, Experience_Name__c, Experience_Rate_Type__c,
            Travel_Brief_description__c, Guide_Book_description__c, Max_Pax__c, Requested__c, Included__c, Experience_Short_Desc__c,
            Budget_Quantity__c, Budget_Unit_Cost__c, Budget_Commission_Rate__c, Budget_Tax__c, Currency__c, Budget_Gross_Margin__c, 
            Budget_Price__c, Budget_SubTotal__c, Budget_Total__c, Actual_Commission_Rate__c, Actual_Gross_Margin__c, Actual_Price__c, 
            Actual_SubTotal__c, Actual_Total__c, Actual_Unit_Cost__c, Actual_Quantity__c, Actual_Tax__c, Status__c, Archived_Date__c 
            FROM Experience_Line_Item__c WHERE Reservation__c = '${input.reservationId}'`;

      return new Promise<ExperienceLineItem[]>((resolve, reject) => {
        ctx.salesforceClient.query(
          query,
          {},
          (err, result: QueryResult<RawExperienceLineItem>) => {
            if (err) {
              reject(err);

              return;
            }

            const records = result.records.map((record) => {
              return {
                id: record.Id,
                experience: record.Experience_Name__c,
                included: record.Included__c,
                daysNights: 0, // FIXME: query and fix this
                budget: {
                  qty: record.Budget_Quantity__c,
                  unitCost: record.Budget_Unit_Cost__c,
                  commissionRate: record.Budget_Commission_Rate__c,
                  tax: record.Budget_Tax__c,
                  currency: record.Currency__c,
                  grossMarginTarget: record.Budget_Gross_Margin__c,
                  price: record.Budget_Price__c,
                  subTotal: record.Budget_SubTotal__c,
                  total: record.Budget_Total__c,
                },
                actual: {
                  commissionRate: record.Actual_Commission_Rate__c,
                  grossMarginTarget: record.Actual_Gross_Margin__c,
                  price: record.Actual_Price__c,
                  subTotal: record.Actual_SubTotal__c,
                  total: record.Actual_Total__c,
                  unitCost: record.Actual_Unit_Cost__c,
                  qty: record.Actual_Quantity__c,
                  tax: record.Actual_Tax__c,
                  currency: record.Currency__c,
                },
                status: record.Status__c,
                archivedDate: record.Archived_Date__c,
                group: {
                  recordType: record.Experience_Rate_Type__c,
                  shortDescription: record.Experience_Short_Desc__c,
                  travelBrief: record.Travel_Brief_description__c,
                  guideBookDescription: record.Guide_Book_description__c,
                  maxPax: record.Max_Pax__c,
                  requested: record.Requested__c,
                  rateType: record.Experience_Rate_Type__c,
                  currency: record.Currency__c,
                },
                variance: {
                  percent: 0,
                  amount: 0,
                },
              };
            });

            resolve(records);
          }
        );
      });
    }),
  update: authProcedure
    .input(updateExperienceSchema)
    .mutation(async ({ ctx, input }) => {
      const { data } = input;

      const response = await ctx.apexClient.put(`/updateRecords`, {
        body: {
          jsonData: JSON.stringify(
            data.map((item) => {
              return {
                attributes: { type: "Experience_Line_Item__c" },
                ...item,
              };
            })
          ),
        },
      });

      return response;
    }),
});
