import { Grid } from "@material-ui/core";
import { PublishedComponent, useModulesManager, useTranslations } from "@openimis/fe-core";
import React, { useEffect } from "react";
import { connect } from "react-redux";

const ClaimHistoryReport = (props) => {
  const { values, setValues, user } = props;
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("claim", modulesManager);
  const readOnly = !!user && !!user.claim_admin && !!user.claim_admin.healthFacility;

  useEffect(() => {
      if(user?.claim_admin?.healthFacility){
        setValues({
          ...values,
          region: user.claim_admin.healthFacility.location.parent,
          district: user.claim_admin.healthFacility.location,
          hf: user.claim_admin.healthFacility
        })
      }
    }, [user]);

  return (
    <Grid container direction="column" spacing={1}>
      <Grid item>
        <PublishedComponent
          pubRef="core.DatePicker"
          value={values.dateStart}
          required
          module="claim"
          label={formatMessage("ClaimHistoryReport.dateStart")}
          onChange={(dateStart) => setValues({ ...values, dateStart })}
        />
      </Grid>
      <Grid item>
        <PublishedComponent
          pubRef="core.DatePicker"
          value={values.dateEnd}
          required
          module="claim"
          label={formatMessage("ClaimHistoryReport.dateEnd")}
          onChange={(dateEnd) => setValues({ ...values, dateEnd })}
        />
      </Grid>
      <Grid item>
        <PublishedComponent
          pubRef="insuree.InsureePicker"
          value={values.insuree}
          required
          module="claim"
          label={formatMessage("ClaimHistoryReport.insuree")}
          onChange={(insuree) => setValues({ ...values, insuree })}
        />
      </Grid>
      <Grid item>
        <PublishedComponent
          pubRef="location.LocationPicker"
          onChange={(region) =>
            setValues({
                ...values,
                region,
                district:null,
                hf:null
          })}
          value={values.region}
          locationLevel={0}
          label={formatMessage("ClaimHistoryReport.region")}
          readOnly={readOnly}
        />
      </Grid>
      <Grid item>
        <PublishedComponent
          pubRef="location.LocationPicker"
          onChange={(district) =>
            setValues({
                ...values,
                district,
                hf:null
          })}
          value={values.district}
          parentLocation={values.region}
          locationLevel={1}
          label={formatMessage("ClaimHistoryReport.district")}
          readOnly={readOnly}
        />
      </Grid>
      <Grid item>
        <PublishedComponent
          pubRef="location.HealthFacilityPicker"
          onChange={(hf) => setValues({ ...values, hf, })}
          region={values.region}
          district={values.district}
          value={values.hf}
          label={formatMessage("ClaimHistoryReport.hf")}
          readOnly={readOnly}
        />
      </Grid>
      <Grid item>
        <PublishedComponent
          pubRef="product.ProductPicker"
          value={values.product}
          label={formatMessage("ClaimHistoryReport.product")}
          onChange={(product) => setValues({ ...values, product })}
        />
      </Grid>
      <Grid item>
        <PublishedComponent
          pubRef="claim.ClaimStatusPicker"
          value={values.status}
          module="claim"
          label="claim.claimStatus"
          onChange={(status) => setValues({ ...values, status })}
        />
      </Grid>
    </Grid>
  );
};

const mapStateToProps = (state) => ({
  user: state.core.user
})

export default connect(mapStateToProps)(ClaimHistoryReport);
