import { trpcClient } from "@/client";
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

  console.log(data);

  return (
    <div>
      <div className="mb-3">{data.experience?.name}</div>
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
      </div>
    </div>
  );
};

export default ReservationPopoverCard;
