import { toast } from "sonner";

import { Button } from "@/components/button";

import { trpcClient } from "@/client";

type Props = {
  segmentId: string;
  departureId: string;
  onClose: () => void;
  onEdit?: () => void;
};

const SegmentPopoverCard = (props: Props) => {
  const { segmentId, departureId, onEdit, onClose } = props;

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
    await mutateAsync(segmentId);
    onClose();
  };

  return (
    <div className="p-3">
      <div className="flex items-center justify-end gap-4">
        <Button
          variant="outline"
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

export default SegmentPopoverCard;
