import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { Grid, Divider } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import _ from "lodash";
import _debounce from "lodash/debounce";
import {
  withModulesManager,
  formatMessage,
  ControlledField,
  PublishedComponent,
  TextInput,
  NumberInput,
  Contributions,
} from "@openimis/fe-core";
import {
  selectHealthFacility,
  selectDistrict,
  selectRegion,
} from "../actions";

const PRESCRIBER_FILTER_CONTRIBUTION_KEY = "prescriber.Filter";

const styles = (theme) => ({
  dialogTitle: theme.dialog.title,
  dialogContent: theme.dialog.content,
  form: { padding: 0 },
  item: { padding: theme.spacing(1) },
  paperDivider: theme.paper.divider,
});

class Head extends Component {
  state = { reset: 0 };

  _filterValue = (k) => {
    const { filters } = this.props;
    return !!filters[k] ? filters[k].value : null;
  };

  _regionFilter = (v) =>
    !!v
      ? { id: "region", value: v, filter: `mainHealthFacility_Location_Parent_Uuid: "${v.uuid}"` }
      : { id: "region", value: null, filter: null };

  _districtFilter = (v) =>
    !!v
      ? { id: "district", value: v, filter: `mainHealthFacility_Location_Uuid: "${v.uuid}"` }
      : { id: "district", value: null, filter: null };

  _healthFacilityFilter = (v) =>
    !!v
      ? { id: "mainHealthFacility", value: v, filter: `mainHealthFacility_Uuid: "${v.uuid}"` }
      : { id: "mainHealthFacility", value: null, filter: null };

  _onChangeRegion = (v) => {
    this.props.onChangeFilters([
      this._regionFilter(v),
      this._districtFilter(null),
      this._healthFacilityFilter(null),
    ]);
    this.setState((s) => ({ reset: s.reset + 1 }));
    this.props.selectRegion(v);
  };

  _onChangeDistrict = (v) => {
    this.props.onChangeFilters([
      this._regionFilter(!!v ? v.parent : this._filterValue("region")),
      this._districtFilter(v),
      this._healthFacilityFilter(null),
    ]);
    this.setState((s) => ({ reset: s.reset + 1 }));
    this.props.selectDistrict(v);
  };

  _onChangeHealthFacility = (v) => {
    this.props.onChangeFilters([
      this._regionFilter(!!v ? v.location.parent : this._filterValue("region")),
      this._districtFilter(!!v ? v.location : this._filterValue("district")),
      this._healthFacilityFilter(v),
    ]);
    this.setState((s) => ({ reset: s.reset + 1 }));
    this.props.selectHealthFacility(v);
  };

  render() {
    const { classes } = this.props;
    return (
      <Grid container className={classes.form}>
        <ControlledField
          module="claim"
          id="PrescriberFilter.region"
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
          id="PrescriberFilter.district"
          field={
            <Grid item xs={2} className={classes.item}>
              <PublishedComponent
                pubRef="location.DistrictPicker"
                value={this._filterValue("district")}
                region={this._filterValue("region")}
                withNull={true}
                reset={this.state.reset}
                onChange={this._onChangeDistrict}
              />
            </Grid>
          }
        />
        <ControlledField
          module="claim"
          id="PrescriberFilter.healthFacility"
          field={
            <Grid item xs={3} className={classes.item}>
              <PublishedComponent
                pubRef="location.HealthFacilityPicker"
                value={this._filterValue("mainHealthFacility")}
                region={this._filterValue("region")}
                district={this._filterValue("district")}
                reset={this.state.reset}
                onChange={this._onChangeHealthFacility}
              />
            </Grid>
          }
        />
      </Grid>
    );
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      selectHealthFacility,
      selectDistrict,
      selectRegion,
    },
    dispatch
  );

const BoundHead = connect(null, mapDispatchToProps)(Head);

class Details extends Component {
  debouncedOnChangeFilter = _debounce(
    this.props.onChangeFilters,
    this.props.modulesManager.getConf("fe-claim", "debounceTime", 200)
  );

  _filterValue = (k) => {
    const { filters } = this.props;
    return !!filters && !!filters[k] ? filters[k].value : null;
  };

  _filterTextFieldValue = (k) => {
    const { filters } = this.props;
    return !!filters && !!filters[k] ? filters[k].value : "";
  };

  render() {
    const { classes, intl, onChangeFilters } = this.props;

    return (
      <Grid container className={classes.form}>
        <Grid item xs={3} className={classes.item}>
          <TextInput
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
            onChange={(v) =>
              this.debouncedOnChangeFilter([
                {
                  id: "otherNames",
                  value: v,
                  filter: !!v ? `otherNames_Icontains: "${v}"` : null,
                },
              ])
            }
          />
        </Grid>

        <Grid item xs={3} className={classes.item}>
          <NumberInput
            module="claim"
            label="prescriber.nin"
            name="nin"
            value={this._filterTextFieldValue("nin")}
            onChange={(v) =>
              this.debouncedOnChangeFilter([
                {
                  id: "nin",
                  value: v,
                  filter: !!v ? `nin_Istartswith: "${v}"` : null,
                },
              ])
            }
          />
        </Grid>

        <Grid item xs={3} className={classes.item}>
          <TextInput
            module="claim"
            label="prescriber.phone"
            name="phone"
            value={this._filterTextFieldValue("phone")}
            onChange={(v) =>
              this.debouncedOnChangeFilter([
                {
                  id: "phone",
                  value: v,
                  filter: !!v ? `phone_Istartswith: "${v}"` : null,
                },
              ])
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
                onChange={(v) =>
                  onChangeFilters([
                    {
                      id: "status",
                      value: v,
                      filter: !!v ? `status_Code: ${v.code}` : null,
                    },
                  ])
                }
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
                onChange={(v) =>
                  onChangeFilters([
                    {
                      id: "speciality",
                      value: v,
                      filter: !!v ? `speciality_Uuid: "${v.uuid}"` : null,
                    },
                  ])
                }
              />
            </Grid>
          }
        />

        <Grid item xs={3}>
          <Grid container>
            <Grid item xs={6} className={classes.item}>
              <PublishedComponent
                pubRef="core.DatePicker"
                value={this._filterValue("entryDateFrom")}
                module="claim"
                label="prescriber.entryDateFrom"
                onChange={(d) =>
                  onChangeFilters([
                    {
                      id: "entryDateFrom",
                      value: d,
                      filter: !!d ? `entryDate_Gte: "${d}"` : null,
                    },
                  ])
                }
              />
            </Grid>
            <Grid item xs={6} className={classes.item}>
              <PublishedComponent
                pubRef="core.DatePicker"
                value={this._filterValue("entryDateTo")}
                module="claim"
                label="prescriber.entryDateTo"
                onChange={(d) =>
                  onChangeFilters([
                    {
                      id: "entryDateTo",
                      value: d,
                      filter: !!d ? `entryDate_Lte: "${d}"` : null,
                    },
                  ])
                }
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={3}>
          <Grid container>
            <Grid item xs={6} className={classes.item}>
              <PublishedComponent
                pubRef="core.DatePicker"
                value={this._filterValue("releaseDateFrom")}
                module="claim"
                label="prescriber.releaseDateFrom"
                onChange={(d) =>
                  onChangeFilters([
                    {
                      id: "releaseDateFrom",
                      value: d,
                      filter: !!d ? `releaseDate_Gte: "${d}"` : null,
                    },
                  ])
                }
              />
            </Grid>
            <Grid item xs={6} className={classes.item}>
              <PublishedComponent
                pubRef="core.DatePicker"
                value={this._filterValue("releaseDateTo")}
                module="claim"
                label="prescriber.releaseDateTo"
                onChange={(d) =>
                  onChangeFilters([
                    {
                      id: "releaseDateTo",
                      value: d,
                      filter: !!d ? `releaseDate_Lte: "${d}"` : null,
                    },
                  ])
                }
              />
            </Grid>
          </Grid>
        </Grid>

        <Contributions
          filters={this.props.filters}
          onChangeFilters={onChangeFilters}
          contributionKey={PRESCRIBER_FILTER_CONTRIBUTION_KEY}
        />
      </Grid>
    );
  }
}

class PrescriberFilter extends Component {
  render() {
    const { classes } = this.props;
    return (
      <form className={classes.container} noValidate autoComplete="off">
        <BoundHead {...this.props} />
        <Details {...this.props} />
      </form>
    );
  }
}

export default withModulesManager(
  injectIntl(withTheme(withStyles(styles)(PrescriberFilter)))
);
