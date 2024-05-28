import jsforce, { QueryResult } from "jsforce";

import { TRPCError } from "@trpc/server";

import {
  Departure,
  DeparturesResponse,
  DestinationAssignment,
  Reservation,
  Segment,
} from "@/common/types";
import { RawDeparture, RawSegment } from "./types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const fetchDepartureById = ({
  client,
  departureId,
}: {
  departureId: string;
  client: jsforce.Connection;
}) => {
  const query = `SELECT Id, Name, Trip__r.Name, Start_DateTime__c, End_DateTime__c FROM Departure__c WHERE Id='${departureId}'`;

  return new Promise<Departure>((resolve, reject) => {
    client.query(query, {}, (err, result: QueryResult<RawDeparture>) => {
      if (err) {
        if (
          err?.name === "INVALID_SESSION_ID" ||
          err?.name === "INVALID_AUTH_HEADER" ||
          err?.name === "INVALID_JWT_FORMAT"
        ) {
          const cookieStore = cookies();
          const list = cookieStore.getAll();

          for (let cookie of list) {
            cookieStore.delete(cookie.name);
          }

          reject(
            new TRPCError({
              message: "Session expired",
              code: "UNAUTHORIZED",
            })
          );
        }

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
          startDate: record.Start_DateTime__c,
          endDate: record.End_DateTime__c,
          tripName: record.Trip__r.Name,
        };
      });

      resolve(records[0]);
    });
  });
};

export const fetchSegmentsByDepartureId = ({
  client,
  departureId,
}: {
  departureId: string;
  client: jsforce.Connection;
}) => {
  const query = `SELECT Id, Segment_Name__c, Narrative__c,StartDate__c,EndDate__c, Start_DateTime__c, End_DateTime__c, PrimaryDestinationId__c, 
  (SELECT Id, Experience_Name__c, Vendor__r.Name, Vendor__r.Vendor_Type__c, StartDate__c,Start_DateTime__c,End_DateTime__c, EndDate__c FROM Reservations__r), (
    SELECT Id, Day__r.Date__c, Destination__c, Destination__r.Name FROM Destination_Assignments__r)
     FROM Segment__c WHERE Departure__c = '${departureId}'`;

  return new Promise<DeparturesResponse>((resolve, reject) => {
    client.query(query, {}, (err, result: QueryResult<RawSegment>) => {
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

        reject(
          new TRPCError({
            message: err.message,
            code: "INTERNAL_SERVER_ERROR",
            cause: err.cause,
          })
        );
      }

      const response = {
        segments: [] as Segment[],
        destinations: [] as DestinationAssignment[],
        reservations: [] as Reservation[],
        activities: [],
        guides: [],
        meals: [],
        transportation: [],
        other: [],
        routes: [],
        lodging: [],
      };

      if (result.totalSize === 0) {
        resolve(response);
      }

      result.records.forEach((record) => {
        response.segments.push({
          id: record.Id,
          name: record.Segment_Name__c,
          narrative: record.Narrative__c,
          startDate: record.Start_DateTime__c ?? record.StartDate__c,
          endDate: record.End_DateTime__c ?? record.EndDate__c,
          primaryDestinationId: record.PrimaryDestinationId__c,
        });

        try {
          if (record.Reservations__r) {
            record.Reservations__r?.records.forEach((reservation) => {
              if (reservation.Experience_Name__c) {
                const [vendorType, vendorName] =
                  reservation.Vendor__r.Vendor_Type__c.split("-");

                // disable eslint
                // eslint-disable-next-line
                (response as any)[`${vendorType.trim().toLowerCase()}`] = [
                  ...((response as any)[`${vendorType.trim().toLowerCase()}`] ||
                    []),
                  {
                    id: reservation.Id,
                    name: reservation.Experience_Name__c,
                    vendorName,
                    startDate:
                      reservation.Start_DateTime__c ?? reservation.StartDate__c,
                    endDate:
                      reservation.End_DateTime__c ?? reservation.EndDate__c,
                    segmentId: record.Id,
                  },
                ];
              }
            });
          }
        } catch (e) {
          console.log(e);
        }

        if (record.Destination_Assignments__r) {
          const destinations =
            record.Destination_Assignments__r?.records.reduce(
              (acc, assignment) => {
                if (
                  assignment.Destination__c !== record.PrimaryDestinationId__c
                ) {
                  const { startDate, endDate } =
                    acc[assignment.Destination__c] || {};

                  acc[assignment.Destination__c] = {
                    ...(acc[assignment.Destination__c] || {}),
                    id: assignment.Id,
                    startDate: startDate
                      ? new Date(
                          Math.min(
                            new Date(startDate).getTime(),
                            new Date(assignment.Day__r.Date__c).getTime()
                          )
                        ).toJSON()
                      : assignment.Day__r.Date__c,
                    destinationId: assignment.Destination__c,
                    name: assignment.Destination__r.Name,
                    segmentId: record.Id,
                    endDate: endDate
                      ? new Date(
                          Math.max(
                            new Date(endDate).getTime(),
                            new Date(assignment.Day__r.Date__c).getTime()
                          )
                        ).toJSON()
                      : assignment.Day__r.Date__c,
                  };
                }

                return acc;
              },
              {} as { [key: string]: DestinationAssignment }
            );

          response.destinations = response.destinations.concat(
            Object.values(destinations)
          );
        }
      });

      resolve(response);
    });
  });
};
