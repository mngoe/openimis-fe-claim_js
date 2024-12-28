import React, { useState } from "react";
import { useModulesManager, useTranslations, Autocomplete, useGraphqlQuery } from "@openimis/fe-core";
import _debounce from "lodash/debounce";

const ClaimProgramPicker = (props) => {
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
    visitDateFrom,
    insureeId,
    hfId
  } = props;

  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("claim", modulesManager);
  const [searchString, setSearchString] = useState("");
  const { isLoading, data, error } = useGraphqlQuery(
    `
      query ProgramPicker($hfId: Int, $visitDateFrom: Date, $insureeId: Int) {
          program(hfId: $hfId, visitDateFrom: $visitDateFrom,  insureeId: $insureeId, first: 10) {
              edges {
                  node {
                      id
                      idProgram
                      code
                      nameProgram
                      validityDateFrom
                      ${extraFragment ?? ""}
                    }
                }
            }
        }
        `,
        { hfId: hfId, visitDateFrom: visitDateFrom, insureeId: insureeId },
  );

  return (
    <Autocomplete
      multiple={multiple}
      required={required}
      placeholder={placeholder ?? formatMessage("program.programPicker.placeholder")}
      label={label ?? formatMessage("program.label")}
      error={error}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      options={insureeId? data?.program?.edges.map((edge) => edge.node) ?? []: []}
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

export default ClaimProgramPicker;
