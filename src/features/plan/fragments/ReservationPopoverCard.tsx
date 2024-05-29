import { trpcClient } from "@/client";
import { Button } from "@/components/button";
import dayjs from "dayjs";

const ReservationPopoverCard = ({
  reservationId,
}: {
  reservationId: string;
}) => {
  const { data, isLoading } =
    trpcClient.reservations.getById.useQuery(reservationId);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>Reservation not found</div>;
  }

  return (
    <div>
      <div>
        <div>{data.recordType}</div>
        <div className="text-lg">{data.experience?.name}</div>
      </div>
      <div className="my-2 w-full border-b border-[#C7A08D] "></div>
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-sm text-gray-700">Reservation Number</div>
          <div>{data.recordType}</div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-sm text-gray-700">Record Type</div>
          <div>{data.recordType}</div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-sm text-gray-700">Vendor</div>
          <div>{data.vendor.name}</div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-sm text-gray-700">Experience Name</div>
          <div>{data.vendor.name}</div>
        </div>
        <div className="my-2 w-full border-b border-[#C7A08D] "></div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-sm text-gray-700">Net Pay total</div>
          <div>{data.netCost}</div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-sm text-gray-700">Sum of payables</div>
          <div>{data.payables.paid ?? "NA"}</div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-sm text-gray-700">Payables due</div>
          <div>{data.payables.unpaid ?? "NA"}</div>
        </div>
        <div className="my-2 w-full border-b border-[#C7A08D] "></div>
        <div className="flex items-center justify-end gap-4">
          <Button variant="outline">Delete</Button>
          <Button>Edit</Button>
        </div>
      </div>
    </div>
  );
};

export default ReservationPopoverCard;
