import dayjs from "dayjs";
import { X } from "lucide-react";

import Loader from "@/components/Loader";
import { DialogClose } from "@/components/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/accordion";

import { trpcClient } from "@/client";

import { Departure, ReservationResponse } from "@/common/types";

type Props = {
  reservationId: string;
  departureId: string;
};

const Header = (props: {
  reservation: ReservationResponse;
  departure: Departure;
}) => {
  const { departure, reservation } = props;

  return (
    <div className="flex items-center justify-between">
      <div className="flex w-[70%] justify-between gap-10 rounded-lg border bg-white p-3">
        <div>
          <div className="text-ellipsis font-medium">
            {reservation.experience?.name}
          </div>
          <div className="text-sm">{departure.tripName}</div>
        </div>
        <div className="w-1/2">
          <div className="grid grid-cols-[100px_1fr] items-center gap-2">
            <div className="font-medium">Check-In :</div>
            <div>
              {dayjs(departure.startDate).format("MMM DD YYYY - hh:mm A")}
            </div>
          </div>
          <div className="grid grid-cols-[100px_1fr] items-center gap-2">
            <div className="font-medium">Check-Out :</div>
            <div>
              {dayjs(departure.endDate).format("MMM DD YYYY - hh:mm A")}
            </div>
          </div>
        </div>
      </div>
      <DialogClose className="rounded-sm border border-destructive p-2">
        <X className="h-4 w-4 text-destructive" size={30} />
      </DialogClose>
    </div>
  );
};

const AccountItem = ({
  label,
  value,
}: {
  label: string;
  value: string | React.ReactNode;
}) => {
  return (
    <div className="mb-2 grid w-3/4 grid-cols-2 gap-4">
      <div className="font-medium">{label}</div>
      <div>{value}</div>
    </div>
  );
};

const AccountView = (props: Props) => {
  const { data: reservation } = trpcClient.reservations.getById.useQuery(
    props.reservationId
  );
  const { data: departure } = trpcClient.departures.getById.useQuery(
    props.departureId
  );

  const { data, isLoading } = trpcClient.accounts.getById.useQuery(
    reservation?.vendor.id || "",
    {
      enabled: !!reservation?.vendor.id,
    }
  );

  if (isLoading || !data) {
    return <Loader />;
  }

  return (
    <div className="h-full bg-[#f7f7f7] p-5">
      <Header reservation={reservation!} departure={departure!} />
      <div className="mt-5 h-[400px] overflow-y-scroll rounded-md border border-gray-300 bg-white p-4">
        <Accordion
          type="multiple"
          defaultValue={["user-details", "additional-details"]}
        >
          <AccordionItem value="user-details">
            <AccordionTrigger>User Details</AccordionTrigger>
            <AccordionContent className="grid grid-cols-2 gap-4">
              <div>
                <AccountItem label="Account Name" value={data.Name ?? "NA"} />
                <AccountItem label="Account Record Type" value="Vendor" />
                <AccountItem
                  label="Vendor Type"
                  value={data.Vendor_Type__c ?? "NA"}
                />
                <AccountItem
                  label="Parent Account"
                  value={data.ParentId ?? "NA"}
                />
                <AccountItem
                  label="Account Owner"
                  value={data.OwnerId ?? "NA"}
                />
              </div>
              <div>
                <AccountItem label="Phone 1" value={data.Phone ?? "NA"} />
                <AccountItem label="Phone 2" value={data.Phone_2__c ?? "NA"} />
                <AccountItem
                  label="Phone Note"
                  value={data.Phone_Note__c ?? "NA"}
                />
                <AccountItem
                  label="Legacy Account ID"
                  value={data.Legacy_Accnt_ID__c ?? "NA"}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="additional-details">
            <AccordionTrigger>Additional Details</AccordionTrigger>
            <AccordionContent className="grid grid-cols-2 gap-4">
              <div>
                <AccountItem
                  label="Geo Location"
                  value={
                    data.Geolocation__c
                      ? `${data.Geolocation__c.latitude}, ${data.Geolocation__c.longitude}`
                      : "NA"
                  }
                />
                <AccountItem label="Website" value={data.Website ?? "NA"} />
                <AccountItem label="Fax" value={data.Fax ?? "NA"} />
                <AccountItem
                  label="Online Account"
                  value={data.Online_Account__c ?? "NA"}
                />
                <AccountItem label="Answer" value={data.Answer__c ?? "NA"} />
                <AccountItem
                  label="Online Account"
                  value={data.Online_Account__c ?? "NA"}
                />
                <AccountItem
                  label="Permanent Comments"
                  value={
                    <div
                      dangerouslySetInnerHTML={{
                        __html: data.Permanent_Comments__c ?? "NA",
                      }}
                    />
                  }
                />
              </div>
              <div>
                <AccountItem label="Email 1" value={data.Email_1__c ?? "NA"} />
                <AccountItem label="Email 2" value={data.Email_2__c ?? "NA"} />
                <AccountItem
                  label="Email Note"
                  value={data.Email_Note__c ?? "NA"}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <div className="flex items-center justify-end">
        <div className="relative right-0 mt-6 w-1/2 rounded-md border border-gray-400 bg-white p-3">
          <div>
            <div className="col-span-2 border-b pb-1 text-orange-600">
              Reservation Payment System
            </div>
            <div className="grid grid-cols-2 border-b py-1">
              <div>Gross Pay Total:</div>
              <div>{data?.Gross_Cost__c ?? "NA"}</div>
            </div>
            <div className="grid grid-cols-2 border-b py-1">
              <div>Commission Due:</div>
              <div>{data.Total_Commission__c ?? "NA"}</div>
            </div>
            <div className="grid grid-cols-2 border-b py-1">
              <div>Net Pay Total:</div>
              <div>{data.Net_Cost__c ?? "NA"}</div>
            </div>
            <div className="grid grid-cols-2 border-b py-1">
              <div>Sum of payables:</div>
              <div>{data.Sum_of_payables_paid__c ?? "NA"}</div>
            </div>
            <div className="grid grid-cols-2 py-1">
              <div>payables Due:</div>
              <div>{data.Sum_of_payables_unpaid__c ?? "NA"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountView;
