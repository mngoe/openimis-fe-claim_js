import React, { useState } from "react";
import { useModulesManager, useTranslations, Autocomplete, useGraphqlQuery } from "@openimis/fe-core";
import _debounce from "lodash/debounce";

const PrescriberPicker = (props) => {
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
    query PrescriberPicker ($str: String) {
        prescribers: prescribers(first: 20, str: $str) {
        edges {
          node {
            uuid
            code
            nin
            lastName
            otherNames
          }
        }
      }
    }
  `,
    { str: searchString },
    { skip: true },
  );

  const prescriberLabel= (option)=>{
    return option.code+" "+option.lastName+" "+option.otherNames;
  }

  return (
    <Autocomplete
      multiple={multiple}
      required={required}
      placeholder={placeholder ?? formatMessage("PrescriberPicker.placeholder")}
      label={label ?? formatMessage("PrescriberPicker.label")}
      error={error}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      options={data?.prescribers?.edges.map((edge) => edge.node) ?? []}
      isLoading={isLoading}
      value={value}
      getOptionLabel={prescriberLabel}
      onChange={(option) => onChange(option, prescriberLabel(option))}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={setSearchString}
    />
  );
};

export default PrescriberPicker;