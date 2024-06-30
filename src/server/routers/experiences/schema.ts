import { z } from "zod";

const reservationData = z
  .object({
    id: z.string(),
    experience: z.string().optional(),
    requested: z.string().optional().nullable(),
    budget: z.object({
      qty: z.number().optional().nullable(),
      grossMarginTarget: z.number().optional().nullable(),
    }),
    actual: z.object({
      qty: z.number().optional().nullable(),
      unitCost: z.number().optional().nullable(),
      commissionRate: z.number().optional().nullable(),
      tax: z.number().optional().nullable(),
      currency: z.string().optional().nullable(),
      grossMarginTarget: z.number().optional().nullable(),
      price: z.number().optional().nullable(),
    }),
    daysNights: z.number().optional().nullable(),
  })
  .transform((data) => {
    return {
      Id: data.id,
      Experience_Name__c: data.experience,
      Budget_Quantity__c: data.budget.qty,
      Budget_Gross_Margin__c: data.budget.grossMarginTarget,
      Actual_Commission_Rate__c: data.actual.commissionRate,
      Actual_Gross_Margin__c: data.actual.grossMarginTarget,
      Actual_Price__c: data.actual.price,
      Actual_Unit_Cost__c: data.actual.unitCost,
      Actual_Quantity__c: data.actual.qty,
      Actual_Tax__c: data.actual.tax,
      Requested__c: data.requested,
      Number_of_Days_Nights__c: data.daysNights,
    };
  });

export const updateExperienceSchema = z.object({
  reservationId: z.string(),
  data: z.array(reservationData),
});
