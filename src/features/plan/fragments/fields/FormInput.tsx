import {
  ControllerRenderProps,
  FieldValues,
  Path,
  FieldError,
} from "react-hook-form";

import { FormMessage } from "@/components/form";
import { Input } from "@/components/input";

type Props<O extends FieldValues, S extends Path<O>> = {
  field: ControllerRenderProps<O, S>;
  label?: string;
  placeholder?: string;
  error?: FieldError;
};

const FormInput = <O extends FieldValues, S extends Path<O>>(
  props: Props<O, S>
) => {
  const { field, placeholder, error } = props;

  return (
    <div>
      <Input {...field} placeholder={placeholder} className="max-w-sm" />
      <FormMessage className="col-start-2 mt-2" error={error} />
    </div>
  );
};

export default FormInput;
