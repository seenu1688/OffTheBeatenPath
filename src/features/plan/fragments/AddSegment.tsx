import React, { useRef } from "react";
import {
  useForm,
  SubmitHandler,
  Controller,
  FormProvider,
  FieldValues,
  Path,
  ControllerProps,
  Control,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import dayjs from "dayjs";

import { DialogClose, DialogTitle } from "@/components/dialog";
import { Button } from "@/components/button";
import { Label } from "@/components/label";
import DateTimeField from "./fields/DateTimeField";
import FormInput from "./fields/FormInput";
import QuillEditor from "@/components/quill-editor";
import ErrorBoundary from "../../../components/error-boundary";

import { trpcClient } from "@/client";

import { cn } from "@/lib/utils";

import { Departure } from "@/common/types";

const schema = z.object({
  segmentName: z.string().min(3, {
    message: "Segment Name must be at least 3 characters",
  }),
  startDateTime: z.date({
    message: "Please select a Start Date Time",
  }),
  endDateTime: z.date({
    message: "Please select an End Date Time",
  }),
  narrative: z.string().optional(),
});

const FieldRow = <O extends FieldValues, S extends Path<O>>(props: {
  name: S;
  label: string;
  control: Control<O>;
  render: ControllerProps<O, S>["render"];
}) => {
  const { name, label, control, render } = props;

  return (
    <div className={cn("grid grid-cols-[200px_1fr] gap-2")}>
      <Label>{label}</Label>
      <Controller control={control} name={name} render={render} />
    </div>
  );
};

type Props = {
  departure: Departure;
};

const AddSegment = (props: Props) => {
  const utils = trpcClient.useUtils();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const { mutateAsync, isPending } = trpcClient.segments.create.useMutation({
    onSuccess(data) {
      toast.success(`Segment ${data.name} has been created successfully`);
      utils.departures.getSegments.invalidate(props.departure.id);
      cancelRef.current?.click();
    },
    onError(error) {
      toast.error(`Failed to create segment: ${error.message}`);
    },
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      segmentName: "",
      narrative: "",
    },
    disabled: isPending,
  });
  const {
    handleSubmit,
    formState: { errors },
    control,
  } = form;
  const departureStartDate = new Date(props.departure.startDate);
  const departureEndDate = new Date(props.departure.endDate);

  const onSubmit: SubmitHandler<z.infer<typeof schema>> = async (data) => {
    if (data.startDateTime > data.endDateTime) {
      toast.error("Start Date Time should be before End Date Time", {
        style: {
          backgroundColor: "red",
          color: "white",
        },
        id: "start-end-time-error",
      });
      return;
    }

    await mutateAsync({
      departureId: props.departure.id,
      name: data.segmentName,
      startDate: dayjs(data.startDateTime).format("YYYY-MM-DD"),
      endDate: dayjs(data.endDateTime).format("YYYY-MM-DD"),
      startDateTime: dayjs(data.startDateTime).format(
        "YYYY-MM-DDTHH:mm:ss.SSSZ"
      ),
      endDateTime: dayjs(data.endDateTime).format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
      narrative: data.narrative,
    });
  };

  return (
    <FormProvider {...form}>
      <DialogTitle>Add New Segment</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} className="relative">
        <div className="max-h-[550px] min-h-[550px] overflow-y-auto pb-2">
          <section>
            <h4 className="rounded-sm bg-gray-100 px-4 py-1">Information</h4>
            <div className="flex flex-col gap-5 p-5">
              <FieldRow
                name="segmentName"
                label="Segment Name"
                control={control}
                render={({ field }) => (
                  <FormInput field={field} error={errors.segmentName} />
                )}
              />
            </div>
          </section>
          <section>
            <h4 className="rounded-sm bg-gray-100 px-4 py-1">
              Segment Statistics
            </h4>
            <div className="flex flex-col gap-5 p-5">
              <FieldRow
                name="startDateTime"
                label="Start Date Time"
                control={control}
                render={({ field }) => {
                  const endDateTime = form.watch("endDateTime");
                  return (
                    <DateTimeField
                      field={field}
                      fromDate={departureStartDate}
                      error={errors.startDateTime}
                      toDate={endDateTime || departureEndDate}
                    />
                  );
                }}
              />
              <FieldRow
                control={control}
                name="endDateTime"
                label="End Date Time"
                render={({ field }) => {
                  const startDateTime = form.watch("startDateTime");
                  return (
                    <DateTimeField
                      fromDate={startDateTime || departureStartDate}
                      field={field}
                      error={errors.endDateTime}
                      disabled={!startDateTime}
                      toDate={departureEndDate}
                    />
                  );
                }}
              />
            </div>
          </section>
          <section>
            <h4 className="rounded-sm bg-gray-100 px-4 py-1">
              Segment Statistics
            </h4>
            <div className="flex flex-col gap-5 p-5">
              <FieldRow
                control={control}
                name="narrative"
                label="Narrative"
                render={({ field }) => (
                  <ErrorBoundary>
                    <QuillEditor
                      initialValue={field.value}
                      onChange={(value) => field.onChange(value)}
                    />
                  </ErrorBoundary>
                )}
              />
            </div>
          </section>
        </div>
        <div className="flex w-full flex-row items-center justify-between pt-5">
          <DialogClose asChild>
            <Button variant="outline" ref={cancelRef}>
              Close
            </Button>
          </DialogClose>

          <Button type="submit" disabled={isPending}>
            Submit
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default AddSegment;
