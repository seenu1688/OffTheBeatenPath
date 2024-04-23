import AsyncSelect from "react-select/async";
import { OnChangeValue } from "react-select";

type Props = {
  items: { value: string; label: string }[];
  onSelectionChange: (value?: string) => void;
  onInputChange: (value: string) => void;
  defaultValue?: string;
  loadOptions?: (
    inputValue: string,
    callback: (options: any) => void
  ) => Promise<any> | void;
  placeholder?: string;
};

function Combobox(props: Props) {
  const { placeholder, loadOptions, defaultValue } = props;

  return (
    <AsyncSelect
      cacheOptions={true}
      loadOptions={loadOptions}
      placeholder={placeholder}
      noOptionsMessage={() => "No results found"}
      onChange={(
        selectedOption: OnChangeValue<{ value: string; label: string }, false>
      ) => {
        props.onSelectionChange(selectedOption?.value);
      }}
      options={props.items}
      styles={{
        control: (provided) => ({
          ...provided,
          border: "1px solid #e2e8f0",
        }),
      }}
      isClearable={true}
      components={{
        DropdownIndicator: () => null,
        IndicatorSeparator: () => null,
      }}
    />
  );
}

export default Combobox;
