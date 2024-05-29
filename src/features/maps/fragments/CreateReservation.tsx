import { z } from "zod";
import {
  Controller,
  FormProvider,
  useForm,
  SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import dayjs from "dayjs";
import Select from "react-select";
import { useShallow } from "zustand/react/shallow";

import { DialogClose, DialogTitle } from "@/components/dialog";
import { Button } from "@/components/button";
import Loader from "@/components/Loader";
import { Label } from "@/components/label";
import DateTimeField from "@/features/plan/fragments/fields/DateTimeField";

import { useDestinations } from "../hooks/useDestinations";

import { trpcClient } from "@/client";

import { Departure } from "@/common/types";

const schema = z.object({
  startDateTime: z.date({
    message: "Please select a Start Date Time",
  }),
  endDateTime: z.date({
    message: "Please select an End Date Time",
  }),
  segmentId: z.string(),
  experienceId: z.string(),
});

type Props = {
  departure: Departure;
  destinationId: string;
  onClose: () => void;
};

const CreateReservation = (props: Props) => {
  const { onClose } = props;
  const utils = trpcClient.useUtils();

  const destination = useDestinations(
    useShallow((state) =>
      state.destinations.find((d) => d.id === props.destinationId)
    )
  );
  const {
    data: reservation,
    isLoading,
    error,
  } = trpcClient.reservations.getExperiences.useQuery(props.destinationId, {
    enabled: !!destination,
  });
  const { data, isLoading: loading } =
    trpcClient.departures.getSegments.useQuery(props.departure.id, {
      enabled: !!props.departure,
    });

  const { isPending, mutateAsync } = trpcClient.reservations.create.useMutation(
    {
      onSuccess() {
        toast.success("Reservation Created");
        utils.departures.getSegments.invalidate(props.departure.id);
        onClose();
      },
      onError(error) {
        console.log(error);

        toast.error("Error creating reservation");
      },
    }
  );

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {},
    disabled: isPending,
  });
  const segmentOptions = useMemo(() => {
    return (
      data?.segments.map((e) => ({
        value: e.id,
        label: e.name,
      })) || []
    );
  }, [data]);
  const expereinceOptions = useMemo(() => {
    return (
      reservation?.experiences.map((e) => ({
        value: e.id,
        label: e.name,
      })) || []
    );
  }, [reservation?.experiences]);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  const departureStartDate = new Date(props.departure.startDate);
  const departureEndDate = new Date(props.departure.endDate);

  const onSubmit: SubmitHandler<z.infer<typeof schema>> = async (data) => {
    await mutateAsync({
      departureId: props.departure.id,
      segmentId: data.segmentId,
      experienceId: data.experienceId,
      vendorId: reservation!.id,
      recordName: destination!.vendorType as any,
      endDateTime: dayjs(data.endDateTime).toISOString(),
      startDateTime: dayjs(data.startDateTime).toISOString(),
    });
  };

  useEffect(() => {
    if (error || !destination) {
      onClose();
    }
  }, [error, destination, onClose]);

  if (isLoading || loading) {
    return <Loader />;
  }

  if (!reservation || !data) {
    return null;
  }

  return (
    <FormProvider {...form}>
      <DialogTitle>Create Reservation</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} className="relative">
        <div className="box-content flex h-[550px] max-h-[550px] flex-col gap-4 overflow-y-auto pb-2">
          <div>
            <Label className="font-normal text-gray-600">Name</Label>
            <div>{reservation.name}</div>
          </div>
          <div className="grid grid-cols-2">
            <div>
              <Label className="font-normal text-gray-600">Phone</Label>
              <div>{reservation.phone}</div>
            </div>
            {reservation.website && (
              <div>
                <Label className="font-normal text-gray-600">Website</Label>
                <div>
                  <a
                    title={reservation.website}
                    href={
                      reservation.website.includes("http")
                        ? reservation.website
                        : `https://${reservation.website}`
                    }
                    className="hover:underline"
                    target="_blank"
                  >
                    Visit Link
                  </a>
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2">
            <div>
              <Label className="font-normal text-gray-600">Experience</Label>
              <Controller
                name="experienceId"
                control={control}
                render={({ field }) => {
                  return (
                    <Select
                      isDisabled={field.disabled}
                      onChange={(value) => {
                        field.onChange(value?.value);
                      }}
                      components={{
                        IndicatorSeparator: () => null,
                      }}
                      options={expereinceOptions}
                      placeholder="Select Experience"
                      className="w-[70%]"
                      value={expereinceOptions.find(
                        (e) => e.value === field.value
                      )}
                    />
                  );
                }}
              />
            </div>
            <div>
              <Label className="font-normal text-gray-600">Segment</Label>
              <Controller
                name="segmentId"
                control={control}
                render={({ field }) => {
                  return (
                    <Select
                      isDisabled={field.disabled}
                      onChange={(value) => {
                        field.onChange(value?.value);
                      }}
                      components={{
                        IndicatorSeparator: () => null,
                      }}
                      options={segmentOptions}
                      placeholder="Select Segment"
                      className="w-[70%]"
                      value={segmentOptions.find(
                        (e) => e.value === field.value
                      )}
                    />
                  );
                }}
              />
            </div>
          </div>
          <div>
            <Label className="font-normal text-gray-600">Start Date Time</Label>
            <Controller
              name="startDateTime"
              control={control}
              render={({ field }) => {
                const endDateTime = form.watch("endDateTime");
                const segmentId = form.watch("segmentId");
                const segment = data.segments.find((s) => s.id === segmentId);
                return (
                  <DateTimeField
                    field={field}
                    fromDate={
                      new Date(segment?.startDate || departureStartDate)
                    }
                    error={errors.startDateTime}
                    toDate={endDateTime || departureEndDate}
                    disabled={field.disabled || !segmentId}
                  />
                );
              }}
            />
          </div>
          <div>
            <Label className="font-normal text-gray-600">End Date Time</Label>
            <Controller
              name="endDateTime"
              control={control}
              render={({ field }) => {
                const startDateTime = form.watch("startDateTime");
                return (
                  <DateTimeField
                    fromDate={startDateTime || departureStartDate}
                    field={field}
                    error={errors.endDateTime}
                    toDate={departureEndDate}
                    disabled={field.disabled || !startDateTime}
                  />
                );
              }}
            />
          </div>
          <div>
            <Label className="mb-2 block font-normal text-gray-600">
              Summary
            </Label>
            {reservation.summary ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: reservation.summary || "",
                }}
              />
            ) : (
              "No Summary"
            )}
          </div>
          <div>
            <Label className="font-normal text-gray-600">Commision</Label>
            <div>{reservation.commission}</div>
          </div>
          <div>
            <Label className="font-normal text-gray-600">Tax Rate</Label>
            <div>{reservation.taxRate}</div>
          </div>
        </div>
        <div className="flex w-full flex-row items-center justify-between pt-5">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={isPending}>
            Create
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default CreateReservation;
