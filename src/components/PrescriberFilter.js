import React, { Component } from "react";
import { injectIntl } from "react-intl";
import _ from "lodash";
import _debounce from "lodash/debounce";

import { Grid } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { withModulesManager, formatMessage, TextInput, ControlledField, PublishedComponent } from "@openimis/fe-core";

const styles = (theme) => ({
  form: {
    padding: 0,
  },
  item: {
    padding: theme.spacing(1),
  },
});

class PrescriberFilter extends Component {
  _healthFacilityFilter = (v) => {
    if (!!v) {
      return {
        id: "mainHealthFacility",
        value: v,
        filter: `mainHealthFacility_Uuid: "${v.uuid}"`,
      };
    } else {
      return { id: "healthFacility", value: null, filter: null };
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
      return { id: "healthFacility", value: null, filter: null };
    }
  };

  debouncedOnChangeFilter = _debounce(
    this.props.onChangeFilters,
    this.props.modulesManager.getConf("fe-claim", "debounceTime", 200),
  );

  _onChangeHealthFacility = (v, s) => {
      this.props.onChangeFilters([
        this._healthFacilityFilter(v)
      ]);
    };

  _onChangeStatus = (v, s) => {
    this.props.onChangeFilters([
      this._statusFilter(v)
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
          <TextInput
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
        <ControlledField
          module="claim"
          id="prescriber.mainHealthFacility"
          field={
            <Grid item xs={3} className={classes.item}>
              <PublishedComponent
                pubRef="location.HealthFacilityPicker"
                value={this._filterValue("mainHealthFacility")}
                onChange={this._onChangeHealthFacility}
              />
            </Grid>
          }
        />
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
      </Grid>
    );
  }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(PrescriberFilter))));