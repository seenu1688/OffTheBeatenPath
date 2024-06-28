import { toast } from "sonner";

import { Button } from "@/components/button";

import { trpcClient } from "@/client";
import { Segment } from "@/common/types";

type Props = {
  segment: Segment;
  departureId: string;
  onClose: () => void;
  onEdit?: () => void;
};

const SegmentPopoverCard = (props: Props) => {
  const { segment, departureId, onEdit, onClose } = props;

  const utils = trpcClient.useUtils();
  const { isPending, mutateAsync } = trpcClient.segments.delete.useMutation({
    onSuccess() {
      toast.success("Segment deleted successfully");
      utils.departures.getSegments.invalidate(departureId);
    },
    onError(error) {
      console.log(error);

      toast.error("Error deleting Segment", {
        style: {
          backgroundColor: "#FF0000",
          color: "#FFFFFF",
        },
      });
    },
  });

  const handleDelete = async () => {
    try {
      await mutateAsync(segment.id);
      onClose();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="relative max-h-[360px] p-3">
      <div>
        <div className="w-full text-ellipsis pb-2 text-lg font-semibold">
          {segment.name}
        </div>
        <div className="pb-2 text-sm">
          {`Total Reservations: ${segment.count}`}
        </div>
        {segment.narrative && (
          <div className="custom-scroll h-[200px] overflow-y-auto pb-4 text-sm text-gray-800">
            {segment.narrative}
          </div>
        )}
      </div>
      <div className=" bottom-0 flex w-full items-center justify-end gap-4 pt-2">
        <Button
          variant="destructive"
          size="sm"
          disabled={isPending}
          onClick={handleDelete}
        >
          Delete
        </Button>
        <Button disabled={isPending} onClick={onEdit} size="sm">
          Edit
        </Button>
      </div>
    </div>
  );
};

SegmentPopoverCard.displayName = "SegmentPopoverCard";

export default SegmentPopoverCard;
