import { Grid } from "@material-ui/core";
import { PublishedComponent, useModulesManager, useTranslations } from "@openimis/fe-core";
import React from "react";

const PrescriberReport = (props) => {
  const { values, setValues } = props;
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("claim", modulesManager);

  return (
    <Grid container direction="column" spacing={1}>
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
          label="ClaimPercentageReferralsReport.dateStart"
          onChange={(dateEnd) => setValues({ ...values, dateEnd })}
        />
      </Grid>
    </Grid>
  );
};

export default PrescriberReport;
