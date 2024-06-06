import { useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { DialogClose, DialogTitle } from "@/components/dialog";
import ErrorBoundary from "@/components/error-boundary";
import QuillEditor from "@/components/quill-editor";
import { Button } from "@/components/button";

import { trpcClient } from "@/client";

import { Departure } from "@/common/types";

type Props = {
  departure: Departure;
  type: "arrival" | "departure";
};

const schema = z.object({
  arrivalInfo: z.string().optional(),
  departureInfo: z.string().optional(),
});

const ArrivalInfo = (props: Props) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  const utils = trpcClient.useUtils();
  const { mutateAsync, isPending } = trpcClient.departures.update.useMutation({
    onSuccess(data) {
      toast.success(`Information has been saved successfully`);
      utils.departures.getById.invalidate(props.departure.id);
      cancelRef.current?.click();
    },
    onError(error) {
      toast.error(`Error saving information: ${error.message}`);
    },
  });
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      arrivalInfo: props.departure.arrivalInfo || "",
      departureInfo: props.departure.departureInfo || "",
    },
  });
  const { control, handleSubmit } = form;

  const onSubmit: SubmitHandler<z.infer<typeof schema>> = async (data) => {
    console.log(data);

    if (
      data.arrivalInfo === props.departure.arrivalInfo &&
      data.departureInfo === props.departure.departureInfo
    ) {
      // close it when both have not changes
      cancelRef.current?.click();
      return;
    }

    let payload: {
      departureId: string;
      arrivalInfo?: string;
      departureInfo?: string;
    } = {
      departureId: props.departure.id,
    };

    if (props.type === "arrival") {
      payload = {
        ...payload,
        arrivalInfo: data.arrivalInfo,
      };
    } else {
      payload = {
        ...payload,
        departureInfo: data.departureInfo,
      };
    }

    mutateAsync(payload);
  };

  const title =
    props.type === "arrival" ? "Arrival Information" : "Departure Information";

  return (
    <FormProvider {...form}>
      <DialogTitle>{title}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} className="relative">
        <Controller
          control={control}
          name={props.type === "arrival" ? "arrivalInfo" : "departureInfo"}
          render={({ field }) => (
            <ErrorBoundary>
              <QuillEditor
                initialValue={field.value}
                onChange={field.onChange}
              />
            </ErrorBoundary>
          )}
        />
        <div className="flex w-full flex-row items-center justify-between pt-5">
          <DialogClose asChild>
            <Button variant="outline" ref={cancelRef}>
              Cancel
            </Button>
          </DialogClose>

          <Button type="submit" disabled={isPending}>
            Save
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default ArrivalInfo;
