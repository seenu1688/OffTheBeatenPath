import { Loader } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/button";

import { trpcClient } from "@/client";

const LabelItem = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => {
  return (
    <div className="grid grid-cols-2 items-center gap-3 text-sm">
      <div className="text-xs text-gray-700">{label}</div>
      <div>{value}</div>
    </div>
  );
};

const Divider = () => {
  return <div className="my-2 w-full border-b border-[#C7A08D] "></div>;
};

type Props = {
  reservationId: string;
  departureId: string;
  onEdit?: () => void;
  onClose: () => void;
};

const ReservationPopoverCard = ({
  reservationId,
  departureId,
  onEdit,
  onClose,
}: Props) => {
  const utils = trpcClient.useUtils();
  const { data, isLoading } =
    trpcClient.reservations.getById.useQuery(reservationId);
  const { isPending, mutateAsync } = trpcClient.reservations.delete.useMutation(
    {
      onSuccess() {
        toast.success("Reservation deleted successfully");
        utils.departures.getSegments.invalidate(departureId);
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
      <div className="flex animate-spin items-center justify-center p-3">
        <Loader />
      </div>
    );
  }

  if (!data) {
    return <div>Reservation not found</div>;
  }

  const handleDelete = async () => {
    await mutateAsync(data.id);
    onClose();
  };

  return (
    <div className="p-3">
      <div>
        <div className="text-sm">{data.recordType}</div>
        <div className="text-base">{data.experience?.name}</div>
      </div>
      <Divider />

      <div className="flex flex-col gap-1">
        <LabelItem label="Reservation Number" value={data.name} />
        <LabelItem label="Record Type" value={data.recordTypeName} />
        <LabelItem label="Vendor" value={data.vendor.name} />
        <LabelItem label="Experience Name" value={data.experience.name} />
        <Divider />
        <LabelItem label="Net Pay total" value={data.netCost} />
        <LabelItem label="Sum of payables" value={data.payables.paid ?? "NA"} />
        <LabelItem label="Payables due" value={data.payables.unpaid ?? "NA"} />
        <Divider />

        <div className="flex items-center justify-end gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={handleDelete}
          >
            Delete
          </Button>
          <Button size="sm" disabled={isPending} onClick={onEdit}>
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReservationPopoverCard;
