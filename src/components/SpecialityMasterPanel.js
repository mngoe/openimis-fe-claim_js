import React from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
  ControlledField,
  FormPanel,
  TextInput,
} from "@openimis/fe-core";
import { Grid } from "@material-ui/core";
import { connect } from "react-redux";

const styles = (theme) => ({
  item: theme.paper.item,
});

class SpecialityMasterPanel extends FormPanel {
  render() {
    const { classes, edited, readOnly = false } = this.props;
    return (
      <Grid container>
        <ControlledField
          module="claim"
          id="Speciality.code"
          field={
            <Grid item xs={4} className={classes.item}>
              <TextInput
                module="claim"
                label="SpecialityForm.code"
                name="code"
                value={edited.code}
                readOnly={readOnly}
                required={true}
                onChange={(v, s) => this.updateAttribute("code", v)}
                inputProps={{
                  maxLength: 50,
                }}
              />
            </Grid>
          }
        />
        <ControlledField
          module="claim"
          id="Speciality.speciality"
          field={
            <Grid item xs={4} className={classes.item}>
              <TextInput
                module="claim"
                label="SpecialityForm.speciality"
                name="speciality"
                value={edited.speciality}
                readOnly={readOnly}
                required={true}
                onChange={(v, s) => this.updateAttribute("speciality", v)}
                inputProps={{
                  maxLength: 150,
                }}
              />
            </Grid>
          }
        />
        <ControlledField
          module="claim"
          id="Speciality.altLanguage"
          field={
            <Grid item xs={4} className={classes.item}>
              <TextInput
                module="claim"
                label="SpecialityForm.altLanguage"
                name="altLanguage"
                value={edited.altLanguage}
                readOnly={readOnly}
                onChange={(v, s) => this.updateAttribute("altLanguage", v)}
                inputProps={{
                  maxLength: 150,
                }}
              />
            </Grid>
          }
        />
      </Grid>
    );
  }
}

export default withTheme(withStyles(styles)(SpecialityMasterPanel));