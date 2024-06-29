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
    trpcClient.experiences.getLineItems.useQuery({
      reservationId: props.reservationId,
    });
  const { data: pickLists, isLoading: picklistLoading } =
    trpcClient.experiences.getPickLists.useQuery(undefined, {
      staleTime: 60 * 60 * 1000,
    });
  const { data: vendorInfo, isLoading: infoLoading } =
    trpcClient.experiences.getVendorInfo.useQuery(
      {
        reservationId: props.reservationId,
      },
      {
        staleTime: 60 * 60 * 1000,
      }
    );

  if (isLoading || isFetching || picklistLoading || infoLoading) {
    return <Loader className="h-[200px]" />;
  }

  return (
    <ExperienceTableView
      data={data!}
      reservationId={props.reservationId}
      onRefresh={refetch}
      pickLists={pickLists!}
      vendorInfo={vendorInfo!}
    />
  );
};

export default ExperienceTable;
