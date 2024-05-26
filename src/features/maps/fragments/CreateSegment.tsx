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

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/dialog";
import { Button } from "@/components/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/accordion";
import Loader from "@/components/Loader";
import { Label } from "@/components/label";
import FormInput from "@/features/plan/fragments/fields/FormInput";
import DateTimeField from "@/features/plan/fragments/fields/DateTimeField";

import { trpcClient } from "@/client";

import { Destination } from "@/common/types";

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
  departureId: string;
  destination: Destination;
};

const CreateSegment = (props: Props) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  const utils = trpcClient.useUtils();
  const { data, isLoading } = trpcClient.destinations.getById.useQuery(
    props.destination.id
  );
  const { mutateAsync, isPending } = trpcClient.segments.create.useMutation({
    onSuccess(data) {
      toast.success(`Segment ${data.name} has been created successfully`);
      utils.departures.getSegments.invalidate(props.departureId);
      utils.departures.getById.invalidate(props.departureId);
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
    },
    disabled: isPending,
  });
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  const onSubmit: SubmitHandler<z.infer<typeof schema>> = async (data) => {
    await mutateAsync({
      departureId: props.departureId,
      name: data.segmentName,
      startDate: dayjs(data.startDateTime).format("YYYY-MM-DD"),
      endDate: dayjs(data.endDateTime).format("YYYY-MM-DD"),
      startDateTime: dayjs(data.startDateTime).format(
        "YYYY-MM-DDTHH:mm:ss.SSSZ"
      ),
      endDateTime: dayjs(data.endDateTime).format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
      primaryDestinationId: props.destination.id,
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
          <Controller
            name="segmentName"
            control={control}
            render={({ field }) => (
              <FormInput field={field} error={errors.segmentName} />
            )}
          />
        </div>
        <div>
          <Label>Start Date Time</Label>
          <Controller
            name="startDateTime"
            control={control}
            render={({ field }) => (
              <DateTimeField field={field} error={errors.startDateTime} />
            )}
          />
        </div>
        <div>
          <Label>End Date Time</Label>
          <Controller
            name="endDateTime"
            control={control}
            render={({ field }) => (
              <DateTimeField field={field} error={errors.endDateTime} />
            )}
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

const CreateSegmentButton = (props: Props) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="text-[#f97415]">
          + Add Segment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <CreateSegment {...props} />
      </DialogContent>
    </Dialog>
  );
};

export { CreateSegmentButton };
