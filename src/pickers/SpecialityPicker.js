import React, { useState } from "react";
import { useModulesManager, useTranslations, Autocomplete, useGraphqlQuery } from "@openimis/fe-core";

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
  const { formatMessage } = useTranslations("location", modulesManager);
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

  const specialityLabel = (option) => {
    if (!option) return "";
    return `${option?.code} - ${option?.speciality}`;
  };

  return (
    <Autocomplete
      multiple={multiple}
      required={required}
      label={label ?? formatMessage("specialityPicker.label")}
      error={error}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      options={data?.specialities?.edges.map((edge) => edge.node) ?? []}
      isLoading={isLoading}
      value={value ?? (multiple ? [] : null)}  
      getOptionLabel={specialityLabel}
      onChange={(option) => onChange(option, specialityLabel(option))}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={setSearchString}
    />
  );
};

export default SpecialityPicker;
