import { z } from "zod";

import { authProcedure, router } from "@/server/trpc";

type RawAccount = {
  Name: string;
  Vendor_Type__c: string;
  ParentId?: string;
  OwnerId?: string;
  Phone?: string;
  Phone_2__c?: string;
  Phone_Note__c?: string;
  Legacy_Accnt_ID__c?: string;
  Geolocation__c: {
    latitude: number;
    longitude: number;
  } | null;
  Website?: string;
  Fax?: string;
  Online_Account__c?: string;
  Answer__c?: string;
  Permanent_Comments__c?: string;
  Email_1__c?: string;
  Email_2__c?: string;
  Email_Note__c?: string;
  Gross_Cost__c?: number;
  Total_Commission__c?: number;
  Net_Cost__c?: number;
  Sum_of_payables_paid__c?: number;
  Sum_of_payables_unpaid__c?: number;
};

export const accountsRouter = router({
  getById: authProcedure
    .input(z.string())
    .query<RawAccount>(async ({ ctx, input }) => {
      const response = await ctx.apexClient.get<RawAccount>("/getRecord", {
        searchParams: { sObjectName: "Account", recordId: input },
      });

      return response;
    }),
});
