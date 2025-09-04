import React, { useState } from "react";
import { useModulesManager, useTranslations, Autocomplete, useGraphqlQuery } from "@openimis/fe-core";
import _debounce from "lodash/debounce";

const SpecialityPicker = (props) => {
  const {
    onChange,
    readOnly,
    required,
    withLabel = true,
    withPlaceholder,
    value,
    label,
    filterOptions,
    filterSelectedOptions,
    placeholder,
    multiple,
  } = props;

  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("claim", modulesManager);
  const [searchString, setSearchString] = useState("");
  const { data, isLoading, error } = useGraphqlQuery(
    `
    query SpecialityPicker ($str: String) {
      specialities: specialities(first: 20, str: $str) {
        edges {
          node {
            uuid
            code
            speciality
          }
        }
      }
    }
  `,
    { str: searchString },
    { skip: true },
  );

  const specialityLabel= (option)=>{
    return option.code+" "+option.speciality;
  }

  return (
    <Autocomplete
      multiple={multiple}
      required={required}
      placeholder={placeholder ?? formatMessage("specialityPicker.placeholder")}
      label={label ?? formatMessage("specialityPicker.label")}
      error={error}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      options={data?.specialities?.edges.map((edge) => edge.node) ?? []}
      isLoading={isLoading}
      value={value}
      getOptionLabel={specialityLabel}
      onChange={(option) => onChange(option, specialityLabel(option))}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={setSearchString}
    />
  );
};

export default SpecialityPicker;