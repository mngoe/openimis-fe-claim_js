import React, { Component } from "react";
import { injectIntl } from "react-intl";
import _ from "lodash";
import _debounce from "lodash/debounce";

import { Grid } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { withModulesManager, formatMessage, TextInput, NumberInput, ControlledField, PublishedComponent } from "@openimis/fe-core";

const styles = (theme) => ({
  form: {
    padding: 0,
  },
  item: {
    padding: theme.spacing(1),
  },
});

class PrescriberFilter extends Component {
  _regionFilter = (v) => {
    if (!!v) {
      return {
        id: "region",
        value: v,
        filter: `mainHealthFacility_Location_Parent_Uuid: "${v.uuid}"`,
      };
    } else {
      return { id: "region", value: null, filter: null };
    }
  };

  _districtFilter = (v) => {
    if (!!v) {
      return {
        id: "district",
        value: v,
        filter: `mainHealthFacility_Location_Uuid: "${v.uuid}"`,
      };
    } else {
      return { id: "district", value: null, filter: null };
    }
  };
  
  _healthFacilityFilter = (v) => {
    if (!!v) {
      return {
        id: "mainHealthFacility",
        value: v,
        filter: `mainHealthFacility_Uuid: "${v.uuid}"`,
      };
    } else {
      return { id: "mainhealthFacility", value: null, filter: null };
    }
  };

  _statusFilter = (v) => {
    if (!!v) {
      return {
        id: "status",
        value: v,
        filter: `status_Code: ${v}`,
      };
    } else {
      return { id: "status", value: null, filter: null };
    }
  };

  _specialityFilter = (v) => {
    if (!!v) {
      return {
        id: "speciality",
        value: v,
        filter: `speciality_Uuid: "${v.uuid}"`,
      };
    } else {
      return { id: "speciality", value: null, filter: null };
    }
  };

  debouncedOnChangeFilter = _debounce(
    this.props.onChangeFilters,
    this.props.modulesManager.getConf("fe-claim", "debounceTime", 200),
  );

  _onChangeRegion = (v, s) => {
      this.props.onChangeFilters([
        this._regionFilter(v),
        this._districtFilter(null),
        this._healthFacilityFilter(null),
      ]);
    };
  
    _onChangeDistrict = (v, s) => {
      this.props.onChangeFilters([
        this._regionFilter(!!v ? v.parent : this._filterValue("region")),
        this._districtFilter(v),
        this._healthFacilityFilter(null),
      ]);
    };
  
    _onChangeHealthFacility = (v, s) => {
      this.props.onChangeFilters([
        this._healthFacilityFilter(v),
      ]);
    };

  _onChangeHealthFacility = (v, s) => {
    this.props.onChangeFilters([
      this._regionFilter(!!v ? v.location.parent : this._filterValue("region")),
      this._districtFilter(!!v ? v.location : this._filterValue("district")),
      this._healthFacilityFilter(v)
    ]);
  };

  _onChangeStatus = (v, s) => {
    this.props.onChangeFilters([
      this._statusFilter(v)
    ]);
  };

  _onChangeSpeciality = (v, s) => {
    this.props.onChangeFilters([
      this._specialityFilter(v)
    ]);
  };

  _filterValue = (k) => {
    const { filters } = this.props;
    return !!filters && !!filters[k] ? filters[k].value : null;
  };

  _filterTextFieldValue = (key) => {
    const { filters } = this.props;
    return !!filters && !!filters[key] ? filters[key].value : "";
  };

  _onChangeCheckbox = (key, value) => {
    let filters = [
      {
        id: key,
        value: value,
        filter: `${key}: ${value}`,
      },
    ];
    this.props.onChangeFilters(filters);
  };

  _onChange = (k, v, s) => {
    let filters = [
      {
        id: k,
        value: v,
        filter: `${k}: "${v}"`,
      },
    ];
    this.props.onChangeFilters(filters);
  };

  render() {
    const { intl, classes } = this.props;

    return (
      <Grid container className={classes.form}>
        <ControlledField
          module="claim"
          id="ClaimFilter.region"
          field={
            <Grid item xs={2} className={classes.item}>
              <PublishedComponent
                pubRef="location.RegionPicker"
                value={this._filterValue("region")}
                withNull={true}
                onChange={this._onChangeRegion}
              />
            </Grid>
          }
        />
        <ControlledField
          module="claim"
          id="ClaimFilter.district"
          field={
            <Grid item xs={2} className={classes.item}>
              <PublishedComponent
                pubRef="location.DistrictPicker"
                value={this._filterValue("district")}
                region={this._filterValue("region")}
                withNull={true}
                onChange={this._onChangeDistrict}
              />
            </Grid>
          }
        />
        <ControlledField
          module="claim"
          id="ClaimFilter.healthFacility"
          field={
            <Grid item xs={3} className={classes.item}>
              <PublishedComponent
                pubRef="location.HealthFacilityPicker"
                value={this._filterValue("healthFacility")}
                region={this._filterValue("region")}
                district={this._filterValue("district")}
                onChange={this._onChangeHealthFacility}
              />
            </Grid>
          }
        />
        <Grid item xs={3} className={classes.item}>
          <NumberInput
            module="claim"
            label="prescriber.code"
            name="code"
            value={this._filterTextFieldValue("code")}
            onChange={(v) =>
              this.debouncedOnChangeFilter([
                {
                  id: "code",
                  value: v,
                  filter: !!v ? `code_Icontains: "${v}"` : null,
                },
              ])
            }
          />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <TextInput
            module="claim"
            label="prescriber.lastName"
            name="lastName"
            value={this._filterTextFieldValue("lastName")}
            onChange={(v) =>
              this.debouncedOnChangeFilter([
                {
                  id: "lastName",
                  value: v,
                  filter: !!v ? `lastName_Icontains: "${v}"` : null,
                },
              ])
            }
          />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <TextInput
            module="claim"
            label="prescriber.otherNames"
            name="otherNames"
            value={this._filterTextFieldValue("otherNames")}
            onChange={(v) => {
                this.debouncedOnChangeFilter([
                  {
                    id: "otherNames",
                    value: v,
                    filter: !!v ? `otherNames_Icontains: "${v}"` : null,
                  },
                ]);
              }
            }
          />
        </Grid>

        <Grid item xs={3} className={classes.item}>
          <NumberInput
            module="claim"
            label="prescriber.nin"
            name="nin"
            value={this._filterTextFieldValue("nin")}
            onChange={(v) => {
                this.debouncedOnChangeFilter([
                  {
                    id: "nin",
                    value: v,
                    filter: !!v ? `nin_Istartswith: "${v}"` : null,
                  },
                ]);
              }
            }
          />
        </Grid>
        <ControlledField
          module="claim"
          id="prescriber.status"
          field={
            <Grid item xs={3} className={classes.item}>
              <PublishedComponent
                pubRef="claim.StatusPicker"
                value={this._filterValue("status")}
                onChange={this._onChangeStatus}
              />
            </Grid>
          }
        />
        <ControlledField
          module="claim"
          id="prescriber.speciality"
          field={
            <Grid item xs={3} className={classes.item}>
              <PublishedComponent
                pubRef="claim.SpecialityPicker"
                value={this._filterValue("speciality")}
                onChange={this._onChangeSpeciality}
              />
            </Grid>
          }
        />
        <ControlledField
              module=""
              id="prescriber.entryDate"
              field={
                  <Grid item xs={3}>
                      <Grid container>
                          <Grid item xs={6} className={classes.item}>
                              <PublishedComponent
                                  pubRef="core.DatePicker"
                                  value={this._filterValue("entryDateFrom")}
                                  module="claim"
                                  label="prescriber.entryDateFrom"
                                  onChange={(d) => {
                                      this.props.onChangeFilters([
                                          {
                                              id: "entryDateFrom",
                                              value: d,
                                              filter: `entryDate_Gte: "${d}"`,
                                          },
                                      ]);
                                    }
                                  }
                              />
                          </Grid>
                          <Grid item xs={6} className={classes.item}>
                              <PublishedComponent
                                  pubRef="core.DatePicker"
                                  value={this._filterValue("entryDateTo")}
                                  module="claim"
                                  label="prescriber.entryDateTo"
                                  onChange={(d) => {
                                      this.props.onChangeFilters([
                                          {
                                              id: "entryDateTo",
                                              value: d,
                                              filter: `entryDate_Lte: "${d}"`,
                                          },
                                      ])
                                    }
                                  }
                              />
                          </Grid>
                      </Grid>
                  </Grid>
              }
          />

          <ControlledField
              module=""
              id="prescriber.releaseDate"
              field={
                  <Grid item xs={3}>
                      <Grid container>
                          <Grid item xs={6} className={classes.item}>
                              <PublishedComponent
                                  pubRef="core.DatePicker"
                                  value={this._filterValue("releaseDateFrom")}
                                  module="claim"
                                  label="prescriber.releaseDateFrom"
                                  onChange={(d) => {
                                      this.props.onChangeFilters([
                                          {
                                              id: "releaseDateFrom",
                                              value: d,
                                              filter: `releaseDate_Gte: "${d}"`,
                                          },
                                      ]);
                                    }
                                  }
                              />
                          </Grid>
                          <Grid item xs={6} className={classes.item}>
                              <PublishedComponent
                                  pubRef="core.DatePicker"
                                  value={this._filterValue("releaseDateTo")}
                                  module="claim"
                                  label="prescriber.releaseDateTo"
                                  onChange={(d) => {
                                      this.props.onChangeFilters([
                                          {
                                              id: "releaseDateTo",
                                              value: d,
                                              filter: `releaseDate_Lte: "${d}"`,
                                          },
                                      ]);
                                    }
                                  }
                              />
                          </Grid>
                      </Grid>
                  </Grid>
              }
          />
      </Grid>
    );
  }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(PrescriberFilter))));