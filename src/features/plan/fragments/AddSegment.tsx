import React from "react";
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
  const { mutateAsync, isPending } = trpcClient.segments.create.useMutation({
    onSuccess(data) {
      toast.success(`Segment ${data.name} has been created successfully`);
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

  const onSubmit: SubmitHandler<z.infer<typeof schema>> = async (data) => {
    await mutateAsync({
      departureId: props.departure.id,
      name: data.segmentName,
      startDate: dayjs(data.startDateTime).format("YYYY-MM-DD"),
      endDate: dayjs(data.endDateTime).format("YYYY-MM-DD"),
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
                render={({ field }) => (
                  <DateTimeField
                    field={field}
                    fromDate={new Date(props.departure.startDate)}
                    error={errors.startDateTime}
                    toDate={form.getValues().endDateTime}
                  />
                )}
              />
              <FieldRow
                control={control}
                name="endDateTime"
                label="End Date Time"
                render={({ field }) => {
                  return (
                    <DateTimeField
                      fromDate={
                        form.getValues().startDateTime ||
                        new Date(props.departure.startDate)
                      }
                      field={field}
                      error={errors.endDateTime}
                      disabled={!form.getValues().startDateTime}
                      toDate={new Date(props.departure.endDate)}
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
            <Button variant="outline">Close</Button>
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
