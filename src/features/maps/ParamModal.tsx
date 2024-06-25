import { useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { Dialog, DialogContent } from "@/components/dialog";
import CreateReservation from "./fragments/CreateReservation";
import CreateSegment from "./fragments/CreateSegment";

import { trpcClient } from "@/client";
import ErrorBoundary from "@/components/error-boundary";
import CreateDestination from "./fragments/CreateDestination";

const ParamModal = () => {
  const searchParams = useSearchParams();
  const params = useParams<{ id: string }>();
  const { id, entity } = Array.from(searchParams.entries()).reduce(
    (acc, [key, value]) => {
      return { ...acc, [key]: value };
    },
    {
      id: undefined,
      entity: undefined,
    }
  );
  const { data } = trpcClient.departures.getById.useQuery(params.id ?? "", {
    enabled: !!params.id,
  });

  const handleClose = useCallback(() => {
    const url = new URL(window.location.href);

    Array.from(url.searchParams.entries()).forEach(([key, value]) => {
      url.searchParams.delete(key);
    });

    window.history.pushState(null, "", url.toString());
  }, []);

  if (!id || !entity || !data) return null;

  const renderContent = () => {
    if (!entity) return null;

    if (entity === "segment") {
      return <CreateSegment departure={data} destinationId={id} />;
    }

    if (entity === "destination") {
      return <CreateDestination departure={data} destinationId={id} />;
    }

    return (
      <CreateReservation
        destinationId={id}
        departure={data}
        onClose={handleClose}
      />
    );
  };

  return (
    <ErrorBoundary>
      <Dialog open={!!id} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl">{renderContent()}</DialogContent>
      </Dialog>
    </ErrorBoundary>
  );
};

export default ParamModal;
