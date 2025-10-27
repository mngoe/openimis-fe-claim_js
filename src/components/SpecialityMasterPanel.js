import React from "react";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
  ControlledField,
  FormPanel,
  TextInput,
  ValidatedTextInput, // Add this import
} from "@openimis/fe-core";
import { Grid } from "@material-ui/core";
import { specialityCodeSetValid, specialityCodeValidationCheck, specialityCodeValidationClear } from "../actions";

const styles = (theme) => ({
  item: theme.paper.item,
});

class SpecialityMasterPanel extends FormPanel {
  shouldValidate = (inputValue) => {
    const { savedSpecialityCode } = this.props;
    const shouldValidate = inputValue !== savedSpecialityCode;
    return shouldValidate;
  };

  render() {
    const { classes, edited, readOnly = false, isCodeValid, isCodeValidating, codeValidationError } = this.props;
    
    return (
      <Grid container>
        {/* ValidatedTextInput component */}
        <Grid item xs={4} className={classes.item}>
          <ValidatedTextInput
            action={specialityCodeValidationCheck}
            clearAction={specialityCodeValidationClear}
            codeTakenLabel="claim.specialityTaken"
            isValid={isCodeValid}
            isValidating={isCodeValidating}
            itemQueryIdentifier="specialityCode"
            label="SpecialityForm.code"
            module="claim"
            onChange={(code) => this.updateAttribute("code", code)}
            readOnly={readOnly}
            required={true}
            setValidAction={specialityCodeSetValid}
            shouldValidate={this.shouldValidate}
            validationError={codeValidationError}
            value={edited?.code || ""}
            inputProps={{
              maxLength: 50,
            }}
          />
        </Grid>

        <ControlledField
          module="claim"
          id="Speciality.speciality"
          field={
            <Grid item xs={4} className={classes.item}>
              <TextInput
                module="claim"
                label="SpecialityForm.speciality"
                name="speciality"
                value={edited?.speciality || ""}
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
                value={edited?.altLanguage || ""}
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

const mapStateToProps = (state) => ({
  isCodeValid: state.claim.validationFields?.specialityCode?.isValid,
  isCodeValidating: state.claim.validationFields?.specialityCode?.isValidating,
  codeValidationError: state.claim.validationFields?.specialityCode?.validationError,
  savedSpecialityCode: state.claim.speciality?.code
});

// Connect to Redux
export default connect(mapStateToProps)(
  withTheme(withStyles(styles)(SpecialityMasterPanel))
);