import AsyncSelect from "react-select/async";

type Props = {
  onSelectionChange: (value: string) => void;
  onInputChange: (value: string) => void;
  defaultValue: string;
  items: {
    value: string;
    label: string;
  }[];
  loadOptions: (inputValue: string) => Promise<void>;
};

function Combobox(props: Props) {
  const { items } = props;

  return (
    <AsyncSelect
      options={items}
      loadOptions={(inputValue: string) => {
        console.log(inputValue);
      }}
      onChange={(selectedOption) => {}}
      styles={{
        control: (provided) => ({
          ...provided,
          border: "1px solid #e2e8f0",
        }),
        option(base, props) {
          return {
            ...base,
            backgroundColor: props.isSelected ? "#EA580B" : "white",
            color: props.isSelected ? "#fff" : "black",
          };
        },
      }}
    />
  );
}

export default Combobox;
