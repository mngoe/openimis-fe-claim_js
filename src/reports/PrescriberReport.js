import { Grid, IconButton } from "@material-ui/core";
import { PublishedComponent, useModulesManager, useTranslations, ControlledField } from "@openimis/fe-core";
import React from "react";
import { AddCircle, RemoveCircle } from "@material-ui/icons";

const PrescriberReport = (props) => {
  const { values, setValues } = props;
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("claim", modulesManager);

  const handleAddHealthFacility = () => {
    const updated = [...(values.authorizedHealthFacilities || []), null];
    setValues({ ...values, authorizedHealthFacilities: updated });
  };

  const handleRemoveHealthFacility = (index) => {
    const updated = (values.authorizedHealthFacilities || []).filter((_, i) => i !== index);
    setValues({ ...values, authorizedHealthFacilities: updated });
  };

  const handleHealthFacilityChange = (index, value) => {
    const updated = [...(values.authorizedHealthFacilities || [])];
    updated[index] = value;
    setValues({ ...values, authorizedHealthFacilities: updated });
  };

  return (
    <Grid container direction="column" spacing={1}>
      <Grid item>
        <PublishedComponent
          pubRef="claim.PrescriberPicker"
          hf_uuid={values.hf?.uuid}
          onChange={(prescriber) => setValues({ ...values, prescriber })}
          value={values.prescriber}
          required
          label={formatMessage("PrescriberReport.prescriber")}
        />
      </Grid>      
      <Grid item>
        <PublishedComponent
          pubRef="core.DatePicker"
          value={values.dateStart}
          module="claim"
          required
          label="ClaimPercentageReferralsReport.dateStart"
          onChange={(dateStart) => setValues({ ...values, dateStart })}
        />
      </Grid>
      <Grid item>
        <PublishedComponent
          pubRef="core.DatePicker"
          value={values.dateEnd}
          module="claim"
          required
          label="ClaimPercentageReferralsReport.dateEnd"
          onChange={(dateEnd) => setValues({ ...values, dateEnd })}
        />
      </Grid>
      <ControlledField
        module="claim"
        id="prescriber.authorizedHealthFacilities"
        field={
          <Grid item xs={12}>
            <h4>Authorized Health Facilities</h4>
            {values.authorizedHealthFacilities?.map((hf, index) => (
              <Grid container spacing={1} key={index} alignItems="center">
                <Grid item xs={10}>
                  <PublishedComponent
                    pubRef="location.HealthFacilityPicker"
                    value={hf}
                    withNull={true}
                    prescriber={values.prescriber}
                    onChange={(v) => handleHealthFacilityChange(index, v)}
                  />
                </Grid>
                <Grid item xs={2}>
                  <IconButton
                    onClick={() => handleRemoveHealthFacility(index)}
                  >
                    <RemoveCircle color="error" />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <IconButton onClick={handleAddHealthFacility}>
              <AddCircle color="primary" />
            </IconButton>
          </Grid>
        }
      />

    </Grid>
  );
};

export default PrescriberReport;