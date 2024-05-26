import { useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  SubmitHandler,
  Controller,
  FormProvider,
} from "react-hook-form";
import { z } from "zod";
import dayjs from "dayjs";
import { toast } from "sonner";

import { Label } from "@/components/label";
import { Button } from "@/components/button";
import { DialogClose, DialogTitle } from "@/components/dialog";
import DateTimeField from "../fragments/fields/DateTimeField";

import { trpcClient } from "@/client";

import { Departure } from "@/common/types";

const schema = z.object({
  startDateTime: z.date({
    message: "Please select a Start Date Time",
  }),
  endDateTime: z.date({
    message: "Please select an End Date Time",
  }),
});

type Props = {
  departure: Departure;
};

const DepartureDatesForm = (props: Props) => {
  const utils = trpcClient.useUtils();
  const closeRef = useRef<HTMLButtonElement>(null);

  const { mutateAsync, isPending } =
    trpcClient.departures.updateDepartureDates.useMutation({
      onSuccess() {
        toast.success("Departure dates updated successfully");
        utils.departures.getSegments.invalidate(props.departure.id);
        utils.departures.getById.invalidate(props.departure.id);
        closeRef.current?.click();
      },
      onError(error) {
        toast.error("Failed to update departure dates");
      },
    });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      startDateTime: new Date(props.departure.startDate),
      endDateTime: new Date(props.departure.endDate),
    },
    disabled: isPending,
  });

  const onSubmit: SubmitHandler<z.infer<typeof schema>> = async (data) => {
    await mutateAsync({
      departureId: props.departure.id,
      startDate: dayjs(data.startDateTime).format("YYYY-MM-DD"),
      endDate: dayjs(data.endDateTime).format("YYYY-MM-DD"),
    });
  };

  return (
    <FormProvider {...form}>
      <DialogTitle>Modify Departure Dates</DialogTitle>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-4">
          <Label>Start Date Time</Label>
          <Controller
            control={form.control}
            name="startDateTime"
            render={({ field }) => {
              const endDate = form.watch("endDateTime");

              return <DateTimeField toDate={endDate} field={field} />;
            }}
          />
        </div>
        <div className="flex flex-col gap-4">
          <Label>End Date Time</Label>
          <Controller
            control={form.control}
            name="endDateTime"
            render={({ field }) => {
              const startDate = form.watch("startDateTime");

              return <DateTimeField fromDate={startDate} field={field} />;
            }}
          />
        </div>

        <div className="flex w-full flex-row items-center justify-between pt-5">
          <DialogClose asChild>
            <Button variant="outline" ref={closeRef}>
              Close
            </Button>
          </DialogClose>

          <Button type="submit" disabled={isPending}>
            Update
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default DepartureDatesForm;
