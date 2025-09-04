import React, { Component } from "react";
import { injectIntl } from "react-intl";
import _ from "lodash";
import _debounce from "lodash/debounce";

import { Grid } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";

import { withModulesManager, formatMessage, TextInput } from "@openimis/fe-core";

const styles = (theme) => ({
  form: {
    padding: 0,
  },
  item: {
    padding: theme.spacing(1),
  },
});

class SpecialityFilter extends Component {
  debouncedOnChangeFilter = _debounce(
    this.props.onChangeFilters,
    this.props.modulesManager.getConf("fe-medical", "debounceTime", 200),
  );

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
            module="medical"
            label="speciality.code"
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
            module="medical"
            label="speciality.speciality"
            name="speciality"
            value={this._filterTextFieldValue("speciality")}
            onChange={(v) =>
              this.debouncedOnChangeFilter([
                {
                  id: "speciality",
                  value: v,
                  filter: !!v ? `speciality_Icontains: "${v}"` : null,
                },
              ])
            }
          />
        </Grid>
      </Grid>
    );
  }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(SpecialityFilter))));