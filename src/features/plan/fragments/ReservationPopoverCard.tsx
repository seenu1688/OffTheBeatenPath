import { useRef } from "react";
import { Loader } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/button";

import { trpcClient } from "@/client";
import { DialogClose } from "@/components/dialog";

const ReservationPopoverCard = ({
  reservationId,
  departureId,
}: {
  reservationId: string;
  departureId: string;
}) => {
  const utils = trpcClient.useUtils();
  const closeRef = useRef<HTMLButtonElement>(null);
  const { data, isLoading } =
    trpcClient.reservations.getById.useQuery(reservationId);
  const { isPending, mutateAsync } = trpcClient.reservations.delete.useMutation(
    {
      onSuccess() {
        toast.success("Reservation deleted successfully");
        utils.departures.getSegments.invalidate(departureId);
        closeRef.current?.click();
      },
      onError(error) {
        console.log(error);

        toast.error("Error deleting reservation", {
          style: {
            backgroundColor: "#FF0000",
            color: "#FFFFFF",
          },
        });
      },
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!data) {
    return <div>Reservation not found</div>;
  }

  const handleDelete = async () => {
    await mutateAsync(data.id);
  };

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
          <Button variant="outline" disabled={isPending} onClick={handleDelete}>
            Delete
          </Button>
          <DialogClose asChild ref={closeRef}>
            <Button disabled={isPending}>Edit</Button>
          </DialogClose>
        </div>
      </div>
    </div>
  );
};

export default ReservationPopoverCard;
