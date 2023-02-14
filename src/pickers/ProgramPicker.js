import React, { useState } from "react";
import { useModulesManager, useTranslations, Autocomplete, useGraphqlQuery } from "@openimis/fe-core";
import _debounce from "lodash/debounce";

const ProgramPicker = (props) => {
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
    extraFragment,
    hfFilter,
  } = props;

  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("claim", modulesManager);
  const [searchString, setSearchString] = useState("");
  const { isLoading, data, error } = useGraphqlQuery(
    `
      query ProgramPicker {
          program(first: 10) {
              edges {
                  node {
                      idProgram
                      nameProgram
                      validityDate
                      ${extraFragment ?? ""}
                    }
                }
            }
        }
        `,
  );

  return (
    <Autocomplete
      multiple={multiple}
      required={required}
      placeholder={placeholder ?? formatMessage("ProgramPicker.placeholder")}
      label={label ?? formatMessage("ProgramPicker.label")}
      error={error}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      options={data?.program?.edges.map((edge) => edge.node) ?? []}
      isLoading={isLoading}
      value={value}
      getOptionLabel={(option) => `${option.nameProgram}`}
      onChange={(option) => onChange(option, option ? `${option.nameProgram}` : null)}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={setSearchString}
    />
  );
};

export default ProgramPicker;
