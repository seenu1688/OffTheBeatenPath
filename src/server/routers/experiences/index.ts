import { z } from "zod";
import { Connection, QueryResult } from "jsforce";
import dayjs from "dayjs";

import { authProcedure, router } from "@/server/trpc";
import { updateExperienceSchema } from "./schema";

import { ExperienceLineItem, RawExperienceLineItem } from "./types";
import { PickList, VendorInfo } from "@/common/types";

const getExperienceLineItems = async (
  salesforceClient: Connection,
  reservationId: string
) => {
  const query = `SELECT Id, OwnerId, IsDeleted, Reservation__c, Experience__c, Experience_Name__c, Experience_Rate_Type__c,
  Travel_Brief_description__c, Guide_Book_description__c, Max_Pax__c, Requested__c, Included__c, Experience_Short_Desc__c,
  Budget_Quantity__c, Budget_Unit_Cost__c, Budget_Commission_Rate__c, Budget_Tax__c, Currency__c, Budget_Gross_Margin__c, 
  Budget_Price__c, Budget_SubTotal__c, Budget_Total__c, Actual_Commission_Rate__c, Actual_Gross_Margin__c, Actual_Price__c, 
  Actual_SubTotal__c, Actual_Total__c, Actual_Unit_Cost__c, Number_of_Days_Nights__c, Actual_Quantity__c, Actual_Tax__c, Status__c, Archived_Date__c 
  FROM Experience_Line_Item__c WHERE Reservation__c = '${reservationId}'`;

  return new Promise<RawExperienceLineItem[]>((resolve, reject) => {
    salesforceClient.query(
      query,
      {},
      (err, result: QueryResult<RawExperienceLineItem>) => {
        if (err) {
          reject(err);

          return;
        }

        resolve(result.records);
      }
    );
  });
};

export const experiencesRouter = router({
  getLineItems: authProcedure
    .input(
      z.object({
        reservationId: z.string(),
      })
    )
    .query<ExperienceLineItem[]>(async ({ ctx, input }) => {
      const response = await getExperienceLineItems(
        ctx.salesforceClient,
        input.reservationId
      );

      const records = response.map((record) => {
        return {
          id: record.Id,
          experience: record.Experience_Name__c,
          daysNights: record.Number_of_Days_Nights__c, // FIXME: query and fix this
          requested: record.Requested__c,
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
            rateType: record.Experience_Rate_Type__c,
            currency: record.Currency__c,
            included: record.Included__c,
          },
          variance: {
            percent: 0,
            amount: 0,
          },
        };
      });

      return records;
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
  getVendorInfo: authProcedure
    .input(
      z.object({
        reservationId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const query = `SELECT Vendor__r.Commission__c,Vendor__r.TaxRate__c, TargetGrossMargin__c
      FROM Reservation__c WHERE Id = '${input.reservationId}'`;

      return new Promise<VendorInfo>((resolve, reject) => {
        ctx.salesforceClient.query(
          query,
          {},
          (
            err,
            result: QueryResult<{
              Vendor__r: {
                Commission__c: number;
                TaxRate__c: number;
              };
              TargetGrossMargin__c: number;
            }>
          ) => {
            if (err) {
              reject(err);

              return;
            }

            resolve(
              result.records.map((record) => {
                return {
                  commission: record.Vendor__r.Commission__c,
                  taxRate: record.Vendor__r.TaxRate__c,
                  grossMarginTarget: record.TargetGrossMargin__c,
                };
              })[0]
            );
          }
        );
      });
    }),
  getPickLists: authProcedure.query<PickList[]>(async ({ ctx }) => {
    const response = await ctx.apexClient.get<{
      fields: {
        picklistValues: {
          active: boolean;
          defaultValue: boolean;
          label: string;
          validFor: null;
          value: string;
        }[];
        name: string;
        label: string;
      }[];
    }>("/services/data/v58.0/sobjects/Experience_Line_Item__c/describe", {
      replaceUrl: true,
    });
    const fields = response.fields.filter(
      (field) => field.name === "Requested__c"
    );

    return fields.map((field) => {
      return {
        name: field.name,
        label: field.label,
        values: field.picklistValues.map((value) => {
          return {
            label: value.label,
            value: value.value,
          };
        }),
      };
    });
  }),
  archive: authProcedure
    .input(
      z.object({
        reservationId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const rawData = await getExperienceLineItems(
          ctx.salesforceClient,
          input.reservationId
        );

        const data = rawData.filter((item) => item.Status__c === "Active");

        if (rawData.length === 0) {
          return false;
        }

        // duplicate the records
        await ctx.apexClient.post(`/createRecords`, {
          body: {
            jsonData: JSON.stringify(
              data.map(({ Id: _id, ...item }) => {
                return {
                  attributes: { type: "Experience_Line_Item__c" },
                  ...item,
                };
              })
            ),
          },
        });

        // update the status to archived
        const archiveDate = dayjs(new Date()).format(
          "YYYY-MM-DDTHH:mm:ss.SSSZ"
        );

        await ctx.apexClient.put(`/updateRecords`, {
          body: {
            jsonData: JSON.stringify(
              data.map((item) => {
                return {
                  attributes: { type: "Experience_Line_Item__c" },
                  Id: item.Id,
                  Archived_Date__c: archiveDate,
                  Status__c: "Archived",
                };
              })
            ),
          },
        });

        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    }),
});
