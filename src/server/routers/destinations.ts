import { QueryResult } from "jsforce";

import { authProcedure, router } from "../trpc";

import { Destination, Geolocation } from "@/common/types";

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

export const destinationsRouter = router({
  list: authProcedure.query<Destination[]>(({ ctx }) => {
    const { salesforceClient } = ctx;

    return new Promise((resolve, reject) => {
      salesforceClient.query(
        "SELECT Id, Name, Geolocation__c FROM Destination__c",
        {},
        (err, result: QueryResult<RawDestination>) => {
          if (err) {
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
  accounts: authProcedure.query<Destination[]>(({ ctx }) => {
    const { salesforceClient } = ctx;

    return new Promise((resolve, reject) => {
      salesforceClient.query(
        `SELECT Id, Name, Geolocation__Latitude__s, Geolocation__Longitude__s,Vendor_Type__c FROM Account WHERE RecordType.Name = 'Vendor'
         AND (Vendor_Type__c LIKE 'Activities%' OR Vendor_Type__c LIKE 'Guide Service%' OR Vendor_Type__c LIKE 'Lodging%'
         OR Vendor_Type__c LIKE 'Transportation%' OR Vendor_Type__c LIKE 'Food & Beverage%' OR Vendor_Type__c LIKE 'Other%')
        `,
        {},
        (err, result: QueryResult<RawAccount>) => {
          if (err) {
            console.log(err);

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
              vendorType: vendorType.trim().toLowerCase(),
              vendorName: vendorName.trim(),
            };
          });

          resolve(records);
        }
      );
    });
  }),
});
