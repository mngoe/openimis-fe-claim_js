import { Grid, IconButton } from "@material-ui/core";
import { PublishedComponent, useModulesManager, useTranslations, ControlledField } from "@openimis/fe-core";
import React from "react";

const  PrescriberFosaReport = (props) => {
  const { values, setValues } = props;
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("claim", modulesManager);

  return (
    <Grid container direction="column" spacing={1}>      
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
      <Grid item>
        <PublishedComponent
          pubRef="location.HealthFacilityPicker"
          onChange={(hf) => setValues({ ...values, hf })}
          value={values.hf}
          required
          label={formatMessage("PrescriberReport.hf")}
        />
      </Grid>
      <Grid item>
        <PublishedComponent
          pubRef="claim.SpecialityPicker"
          onChange={(speciality) => setValues({ ...values, speciality })}
          value={values.speciality}
          label={formatMessage("PrescriberReport.Speciality")}
        />
      </Grid>
      <Grid item>
        <PublishedComponent
          pubRef="claim.StatusPicker"
          onChange={(status) => setValues({ ...values, status })}
          value={values.status}
          label={formatMessage("PrescriberReport.Prescriber.Status")}
        />
      </Grid>
      <Grid item>
        <PublishedComponent
          pubRef="claim.ClaimStatusPicker"
          onChange={(claimStatus) => setValues({ ...values, claimStatus })}
          value={values.claimStatus}
          required
        />
      </Grid>
      <Grid item>
        <PublishedComponent
          pubRef="claim.ClaimActTypePicker"
          onChange={(claimActType) => setValues({ ...values, claimActType })}
          value={values.claimActType}
          required
        />
      </Grid>
    </Grid>
  );
};

export default PrescriberFosaReport;