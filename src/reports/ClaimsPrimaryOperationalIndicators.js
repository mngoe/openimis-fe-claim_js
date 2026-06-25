import { Grid } from "@material-ui/core";
import { PublishedComponent, useModulesManager, useTranslations, ConstantBasedPicker } from "@openimis/fe-core";
import React, { useEffect } from "react";
import {PRIMARY_OPERATIONAL_INDICATORS_REPORT_QUARTERS} from "../constants";
import { connect } from "react-redux";

const ClaimsPrimaryOperationalIndicators = (props) => {
  const { values, setValues, user } = props;
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("claim", modulesManager);
  const readOnly = !!user && !!user.claim_admin && !!user.claim_admin.healthFacility;

  useEffect(() => {
    if (user?.claim_admin?.healthFacility) {
      setValues((prevValues) => ({
        ...prevValues,
        region: user.claim_admin.healthFacility.location.parent,
        district: user.claim_admin.healthFacility.location,
        hf: user.claim_admin.healthFacility,
      }));
    }
  }, [user]);

  return (
    <Grid container direction="column" spacing={1}>
      <Grid item>
        <PublishedComponent
          pubRef="core.YearPicker"
          onChange={(year) =>
            setValues({
                ...values,
                year,
          })}
          min={2010}
          max={2040}
          required
          withNull={false}
          value={values.year}
          label={formatMessage("ClaimsPrimaryOperationalIndicators.year")}
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
          required
          value={values.region}
          locationLevel={0}
          label={formatMessage("ClaimsPrimaryOperationalIndicators.region")}
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
          label={formatMessage("ClaimsPrimaryOperationalIndicators.district")}
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
          label={formatMessage("ClaimsPrimaryOperationalIndicators.hf")}
          readOnly={readOnly}
        />
      </Grid>
      <Grid item>
        <PublishedComponent
          pubRef="product.ProductPicker"
          value={values.product}
          label={formatMessage("ClaimsPrimaryOperationalIndicators.product")}
          onChange={(product) => setValues({ ...values, product })}
        />
      </Grid>
      <Grid item>
        <PublishedComponent
          pubRef="core.MonthPicker"
          onChange={(month) =>
            setValues({
                ...values,
                month,
          })}
          withNull
          value={values.month}
        />
      </Grid>
      <Grid item>
        <ConstantBasedPicker
          module="claim"
          value={values.quarter}
          label="ClaimsPrimaryOperationalIndicators.quarter"
          constants={PRIMARY_OPERATIONAL_INDICATORS_REPORT_QUARTERS}
          onChange={(quarter) => setValues({ ...values, quarter })}
        />
      </Grid>
    </Grid>
  );
};

const mapStateToProps = (state) => ({
  user: state.core.user
})

export default connect(mapStateToProps)(ClaimsPrimaryOperationalIndicators);
