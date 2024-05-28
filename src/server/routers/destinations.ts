import { QueryResult } from "jsforce";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { authProcedure, router } from "../trpc";

import { Destination } from "@/common/types";

type RawDestination = {
  Id: string;
  Name: string;
  Geolocation__c: {
    latitude: number;
    longitude: number;
  };
};

type RawAccount = {
  Id: string;
  Name: string;
  Geolocation__Latitude__s: number;
  Geolocation__Longitude__s: number;
  Vendor_Type__c: string;
};

type RawDestinationDetail = {
  Id: string;
  Name: string;
  Geolocation__c?: {
    latitude: number;
    longitude: number;
  };
  Things_to_See_and_Do_Chapter_Header__c: string;
  Things_to_See_and_Do__c: string;
  Background__c: string;
  Background_Chapter_Header__c: string;
};

export const destinationsRouter = router({
  list: authProcedure.query<Destination[]>(({ ctx }) => {
    const { salesforceClient } = ctx;

    return new Promise((resolve, reject) => {
      salesforceClient.query(
        "SELECT Id, Name, Geolocation__c FROM Destination__c",
        {},
        (err, result: QueryResult<RawDestination>) => {
          if (err) {
            if (
              err?.name === "INVALID_AUTH_HEADER" ||
              err?.name === "INVALID_JWT_FORMAT"
            ) {
              const cookieStore = cookies();
              const list = cookieStore.getAll();
              for (let cookie of list) {
                cookieStore.delete(cookie.name);
              }

              redirect("/signin");
            }

            reject(err);
          }

          const records = result.records.map((record) => {
            return {
              id: record.Id,
              name: record.Name,
              geolocation: {
                lat: record.Geolocation__c?.latitude,
                lng: record.Geolocation__c?.longitude,
              },
              vendorType: "destinations",
              vendorName: "destinations",
            };
          });

          resolve(records);
        }
      );
    });
  }),
  getById: authProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const response = await ctx.apexClient.get<RawDestinationDetail>(
      "/getRecord",
      {
        searchParams: { sObjectName: "Destination__c", recordId: input },
      }
    );

    return {
      id: response.Id,
      name: response.Name,
      geolocation: {
        lat: response.Geolocation__c?.latitude,
        lng: response.Geolocation__c?.longitude,
      },
      vendorType: "destinations",
      vendorName: "destinations",
      background: {
        header: response.Background_Chapter_Header__c,
        content: response.Background__c,
      },
      thingsToDo: {
        header: response.Things_to_See_and_Do_Chapter_Header__c,
        content: response.Things_to_See_and_Do__c,
      },
    };
  }),
  accounts: authProcedure.query<Destination[]>(({ ctx }) => {
    const { salesforceClient, apexClient } = ctx;

    return new Promise((resolve, reject) => {
      salesforceClient.query(
        `SELECT Id, Name, Geolocation__Latitude__s, Geolocation__Longitude__s, Vendor_Type__c FROM Account WHERE RecordType.Name = 'Vendor'
         AND (Vendor_Type__c LIKE 'Activities%' OR Vendor_Type__c LIKE 'Guide Service%' OR Vendor_Type__c LIKE 'Lodging%'
         OR Vendor_Type__c LIKE 'Transportation%' OR Vendor_Type__c LIKE 'Food & Beverage%' OR Vendor_Type__c LIKE 'Other%')
        `,
        {},
        (err, result: QueryResult<RawAccount>) => {
          if (err) {
            if (
              err.name === "INVALID_AUTH_HEADER" ||
              err.name === "INVALID_JWT_FORMAT"
            ) {
              const cookieStore = cookies();
              const list = cookieStore.getAll();
              for (let cookie of list) {
                cookieStore.delete(cookie.name);
              }

              redirect("/signin");
            }

            reject(err);
          }

          const records = result.records.map((record) => {
            const [vendorType = "", vendorName = ""] =
              record.Vendor_Type__c.split("-");

            return {
              id: record.Id,
              name: record.Name,
              geolocation: {
                lat: record.Geolocation__Latitude__s,
                lng: record.Geolocation__Longitude__s,
              },
              vendorType: vendorType.trim(),
              vendorName: vendorName.trim(),
            };
          });

          resolve(records);
        }
      );
    });
  }),
});
