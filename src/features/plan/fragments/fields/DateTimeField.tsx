import { useMemo } from "react";
import NativeSelect from "react-select";
import dayjs from "dayjs";
import {
  ControllerRenderProps,
  FieldError,
  FieldValues,
  Path,
} from "react-hook-form";
import { ChevronDown } from "lucide-react";

import { DateTimePicker } from "@/components/calendar";
import { FormMessage } from "@/components/form";

import { formatTimeString, timesList } from "@/lib/utils";

type Props<O extends FieldValues, S extends Path<O>> = {
  field: ControllerRenderProps<O, S>;
  title?: string;
  error?: FieldError;
  fromDate?: Date;
  toDate?: Date;
  disabled?: boolean;
};

const DateTimeField = <T extends FieldValues, S extends Path<T>>(
  props: Props<T, S>
) => {
  const { field, fromDate, error, toDate } = props;

  const fieldTime = field.value
    ? {
        hours: field.value.getHours(),
        minutes: field.value.getMinutes(),
      }
    : null;

  const time =
    field.value && fieldTime
      ? {
          label: formatTimeString(fieldTime.hours, fieldTime.minutes),
          value: (fieldTime.hours * 60 + fieldTime.minutes).toString(),
        }
      : undefined;

  const memoisedTimesList = useMemo(() => {
    if ((!fromDate && !toDate) || !field.value) return timesList;

    if (fromDate && dayjs(fromDate).isSame(dayjs(field.value), "day")) {
      const value = fromDate.getHours() * 60 + fromDate.getMinutes();

      return timesList.filter((time) => {
        const timeValue = parseInt(time.value);

        return timeValue >= value;
      });
    }

    if (toDate && dayjs(toDate).isSame(dayjs(field.value), "day")) {
      const value = toDate.getHours() * 60 + toDate.getMinutes();

      return timesList.filter((time) => {
        const timeValue = parseInt(time.value);

        return timeValue <= value;
      });
    }

    return timesList;
  }, [fromDate, toDate, field.value]);

  return (
    <div>
      <div className="flex items-center gap-5">
        <div className="flex flex-col gap-1">
          <DateTimePicker
            mode="single"
            fromDate={fromDate}
            toDate={props.toDate}
            defaultMonth={props.field.value}
            selected={field.value}
            onSelect={(date) => {
              if (date) {
                const newDate = new Date(date);

                newDate.setHours(0, parseInt(time?.value || "0"), 0, 0);

                field.onChange(newDate);
              }
            }}
            disabled={(date) => date < new Date("1900-01-01")}
            disableCalender={props.field.disabled || props.disabled}
          >
            {props.field.value ? (
              dayjs(props.field.value).format("DD MMM YYYY")
            ) : (
              <span>Pick a date</span>
            )}
          </DateTimePicker>
        </div>
        <div className="flex flex-col gap-1">
          <NativeSelect
            className="w-[240px] max-w-sm outline-none"
            options={memoisedTimesList as any[]}
            value={time}
            onChange={(option) => {
              const minutes = parseInt(option?.value || "");

              if (!Number.isNaN(minutes)) {
                const date = new Date(field.value || new Date());
                date.setHours(0, minutes, 0, 0);

                field.onChange(date);
              }
            }}
            isDisabled={props.field.disabled || props.disabled || !time?.value}
            components={{
              DropdownIndicator: () => (
                <ChevronDown size={30} className="pr-2 text-gray-400" />
              ),
              IndicatorSeparator: () => null,
            }}
            getOptionValue={(option) => option.value}
            placeholder="Select Time"
            styles={{
              container(base) {
                return {
                  ...base,
                  outline: "none",
                  border: 0,
                };
              },
              menuList(base, props) {
                return {
                  ...base,
                  height: 220,
                };
              },
              option(base, props) {
                return {
                  ...base,
                  background: props.isSelected
                    ? "hsl(var(--primary))"
                    : props.isFocused
                      ? "hsl(var(--primary))"
                      : "transparent",
                  color: props.isSelected ? "white" : "hsl(var(--text-muted))",
                };
              },
              placeholder(base, props) {
                return {
                  ...base,
                  fontSize: "0.875rem",
                  color: props.isDisabled ? "gray" : "hsl(var(--text-muted))",
                };
              },
            }}
          />
        </div>
      </div>
      <FormMessage className="col-start-2 mt-2" error={error} />
    </div>
  );
};

export default DateTimeField;
