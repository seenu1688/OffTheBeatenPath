import Loader from "@/components/Loader";
import ExperienceTableView from "./ExperienceTableView";

import { trpcClient } from "@/client";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "./index.css";

type Props = {
  reservationId: string;
};

const ExperienceTable = (props: Props) => {
  const { data, isLoading, isFetching, refetch } =
    trpcClient.experiences.getAllByReservationId.useQuery(
      {
        reservationId: props.reservationId,
      }
      // { staleTime: 0 }
    );

  if (isLoading || isFetching) {
    return <Loader className="h-[200px]" />;
  }

  return (
    <ExperienceTableView
      data={data!}
      reservationId={props.reservationId}
      onRefresh={refetch}
    />
  );
};

export default ExperienceTable;
