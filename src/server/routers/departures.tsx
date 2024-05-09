import { QueryResult } from "jsforce";
import z from "zod";

import { authProcedure, router } from "../trpc";

import { Departure } from "@/common/types";
import { TRPCError } from "@trpc/server";

type RawDeparture = {
  Id: string;
  Name: string;
  Trip__r: {
    Name: string;
  };
  StartDate__c: string;
  EndDate__c: string;
};

export const departuresRouter = router({
  getById: authProcedure
    .input(z.string())
    .query<Departure>(({ ctx, input }) => {
      const { salesforceClient } = ctx;

      const query = `SELECT Id, Name, Trip__r.Name, StartDate__c, EndDate__c FROM Departure__c WHERE Id = '${input}'`;

      return new Promise((resolve, reject) => {
        salesforceClient.query(
          query,
          {},
          (err, result: QueryResult<RawDeparture>) => {
            if (err) {
              reject(
                new TRPCError({
                  message: err.message,
                  code: "INTERNAL_SERVER_ERROR",
                  cause: err.cause,
                })
              );
            }

            if (result.totalSize === 0) {
              reject(
                new TRPCError({
                  message: "Departure not found",
                  code: "NOT_FOUND",
                })
              );
            }

            const records = result.records.map((record) => {
              return {
                id: record.Id,
                name: record.Name,
                startDate: record.StartDate__c,
                endDate: record.EndDate__c,
                tripName: record.Trip__r.Name,
              };
            });

            resolve(records[0]);
          }
        );
      });
    }),
});
