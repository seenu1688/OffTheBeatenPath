import { z } from "zod";
import {
  Controller,
  FormProvider,
  useForm,
  SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef } from "react";
import { toast } from "sonner";
import dayjs from "dayjs";

import { DialogClose, DialogTitle } from "@/components/dialog";
import { Button } from "@/components/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/accordion";
import Loader from "@/components/Loader";
import { Label } from "@/components/label";
import DateTimeField from "@/features/plan/fragments/fields/DateTimeField";

import { trpcClient } from "@/client";

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
});

type Props = {
  departure: Departure;
  destinationId: string;
};

const CreateSegment = (props: Props) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  const utils = trpcClient.useUtils();
  const { data, isLoading } = trpcClient.destinations.getById.useQuery(
    props.destinationId
  );
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
      segmentName: data?.name || "",
    },
    disabled: isPending,
  });
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
      name: data.segmentName,
      startDate: dayjs(data.startDateTime).format("YYYY-MM-DD"),
      endDate: dayjs(data.endDateTime).format("YYYY-MM-DD"),
      startDateTime: dayjs(data.startDateTime).format(
        "YYYY-MM-DDTHH:mm:ss.SSSZ"
      ),
      endDateTime: dayjs(data.endDateTime).format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
      primaryDestinationId: props.destinationId,
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return <Loader />;
    }

    if (!data) return null;

    return (
      <div className="flex flex-col gap-5 px-2">
        <div>
          <Label>Segment Name</Label>
          <div>{data.name}</div>
        </div>
        <div>
          <Label>Start Date Time</Label>
          <Controller
            name="startDateTime"
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
        </div>
        <div>
          <Label>End Date Time</Label>
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
                />
              );
            }}
          />
        </div>
        <div>
          <Accordion type="single" collapsible>
            <AccordionItem value="background">
              <AccordionTrigger>Background</AccordionTrigger>
              <AccordionContent>
                <div
                  dangerouslySetInnerHTML={{ __html: data.background.content }}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Accordion type="single" collapsible>
            <AccordionItem value="thingsToDo">
              <AccordionTrigger>Things to do</AccordionTrigger>
              <AccordionContent>
                <div
                  dangerouslySetInnerHTML={{ __html: data.thingsToDo.content }}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    );
  };

  return (
    <FormProvider {...form}>
      <DialogTitle>Create Segment</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} className="relative">
        <div className="box-content h-[550px] max-h-[550px] overflow-y-auto pb-2">
          {renderContent()}
        </div>
        <div className="flex w-full flex-row items-center justify-between pt-5">
          <DialogClose asChild>
            <Button variant="outline" ref={cancelRef}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isLoading || isPending}>
            Create
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default CreateSegment;
