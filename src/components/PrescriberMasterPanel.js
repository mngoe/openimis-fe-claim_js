import React from "react";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
  ControlledField,
  FormPanel,
  TextInput,
  PublishedComponent,
  NumberInput,
  ValidatedTextInput
} from "@openimis/fe-core";
import { Grid, IconButton } from "@material-ui/core";
import { AddCircle, RemoveCircle } from "@material-ui/icons";
import { prescriberCodeValidationCheck, prescriberCodeValidationClear, prescriberCodeSetValid } from "../actions";

const styles = (theme) => ({
  item: theme.paper.item,
});

class PrescriberMasterPanel extends FormPanel {
    shouldValidate = (inputValue) => {
        const { savedPrescriberCode } = this.props;
        const shouldValidate = inputValue !== savedPrescriberCode;
        return shouldValidate;
      };
  render() {
    const { classes, edited, readOnly = false, isCodeValid, isCodeValidating, codeValidationError } = this.props;
    return (
      <Grid container>
        <ControlledField
            module="claim"
            id="ClaimFilter.region"
            field={
            <Grid item xs={2} className={classes.item}>
                <PublishedComponent
                pubRef="location.RegionPicker"
                value={edited.region}
                withNull={true}
                readOnly={readOnly}
                onChange={(v) => this.updateAttribute("region",v)}
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
                value={edited.district}
                region={edited.region}
                readOnly={readOnly}
                withNull={true}
                onChange={(v) => this.updateAttribute("district",v)}
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
                    value={edited.mainHealthFacility}
                    region={edited.region}
                    required={true}
                    district={edited.district}
                    readOnly={readOnly}
                    onChange={(v) => {
                      this.updateAttribute("mainHealthFacility",v)
                      
                      setTimeout(()=>{
                        if(v != null){
                          this.updateAttribute("region",v.location.parent);
                          this.updateAttribute("district",v.location);
                        }
                      }
                        ,0)
                    }}
                />
            </Grid>
            }
        />

        <Grid item xs={4} className={classes.item}>
            <ValidatedTextInput
                action={prescriberCodeValidationCheck}
                clearAction={prescriberCodeValidationClear}
                codeTakenLabel="claim.prescriberTaken"
                isValid={isCodeValid}
                isValidating={isCodeValidating}
                itemQueryIdentifier="prescriberCode"
                label="SpecialityForm.code"
                module="claim"
                onChange={(code) => this.updateAttribute("code", code)}
                readOnly={readOnly}
                required={true}
                setValidAction={prescriberCodeSetValid}
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
        id="prescriber.lastName"
        field={
            <Grid item xs={3} className={classes.item}>
            <TextInput
                module="claim"
                label="prescriber.lastName"
                name="lastName"
                required={true}
                value={edited.lastName}
                readOnly={readOnly}
                onChange={(v) => this.updateAttribute("lastName",v) }
            />
            </Grid>
        }
        />
        <ControlledField
            module="claim"
            id="prescriber.otherNames"
            field={
                <Grid item xs={3} className={classes.item}>
                    <TextInput
                    module="claim"
                    required={true}
                    label="prescriber.otherNames"
                    name="otherNames"
                    value={edited.otherNames}
                    readOnly={readOnly}
                    onChange={(v) => this.updateAttribute("otherNames",v) }
                    />
                </Grid>
            }
        />

        <ControlledField
            module="claim"
            id="prescrber.nin"
            field={
                <Grid item xs={3} className={classes.item}>
                    <NumberInput
                    module="claim"
                    required={true}
                    label="prescriber.nin"
                    placeholder="prescriber.nin.placeholder"
                    name="nin"
                    error={
                        edited &&
                          edited.nin &&
                          (edited.nin.length !== 7 && edited.nin.length !== 9)
                          ? true
                          : false
                      }
                    value={edited.nin}
                    readOnly={readOnly}
                    onChange={(v) => this.updateAttribute("nin",v) }
                    />
                </Grid>
            }
        />
        <ControlledField
            module="claim"
            id="prescrber.phone"
            field={
                <Grid item xs={3} className={classes.item}>
                    <TextInput
                    module="claim"
                    required={true}
                    label="prescriber.phone"
                    name="phone"
                    value={edited.phone}
                    readOnly={readOnly}
                    onChange={(v) => this.updateAttribute("phone",v) }
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
                    required={true}
                    pubRef="claim.StatusPicker"
                    value={edited.status}
                    readOnly={readOnly}
                    onChange={(v) => this.updateAttribute("status",v)}
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
                    required={true}
                    pubRef="claim.SpecialityPicker"
                    value={edited.speciality}
                    readOnly={readOnly}
                    onChange={(v) => this.updateAttribute("speciality",v)}
                    />
                </Grid>
            }
        />

        <ControlledField
            module="claim"
            id="prescriber.entryDate"
            field={
                <Grid item xs={3} className={classes.item}>
                    <PublishedComponent
                        pubRef="core.DatePicker"
                        value={edited.entryDate}
                        module="claim"
                        required={true}
                        label="prescriber.entryDate"
                        readOnly={readOnly}
                        onChange={(v) => this.updateAttribute("entryDate",v) }
                    />
                </Grid>
            }
        />

        <ControlledField
            module="claim"
            id="prescriber.releaseDate"
            field={
                <Grid item xs={3} className={classes.item}>
                    <PublishedComponent
                        pubRef="core.DatePicker"
                        value={edited.releaseDate}
                        module="claim"
                        label="prescriber.releaseDate"
                        readOnly={readOnly}
                        onChange={(v) => this.updateAttribute("releaseDate",v) }
                    />
                </Grid>
            }
        />

        <ControlledField
        module="claim"
        id="prescriber.authorizedHealthFacilities"
        field={
            <Grid item xs={12} className={classes.item}>
            <h4>Authorized Health Facilities</h4>
            {edited.authorizedHealthFacilities?.map((hf, index) => (
                <Grid container spacing={1} key={index} alignItems="center">
                <Grid item xs={10}>
                    <PublishedComponent
                    pubRef="location.HealthFacilityPicker"
                    value={hf}
                    region={edited.region}
                    district={edited.district}
                    withNull={true}
                    onChange={(v) => {
                        const updated = [...(edited.authorizedHealthFacilities || [])];
                        updated[index] = v;
                        this.updateAttribute("authorizedHealthFacilities", updated);
                    }}
                    />
                </Grid>
                <Grid item xs={2}>
                    <IconButton
                    onClick={() => {
                        const updated = (edited.authorizedHealthFacilities || []).filter(
                        (_, i) => i !== index
                        );
                        this.updateAttribute("authorizedHealthFacilities", updated);
                    }}
                    >
                    <RemoveCircle color="error" />
                    </IconButton>
                </Grid>
                </Grid>
            ))}
                <IconButton
                    onClick={() => {
                    const updated = [...(edited.authorizedHealthFacilities || []), null];
                    this.updateAttribute("authorizedHealthFacilities", updated);
                    }}
                >
                <AddCircle color="primary" />
            </IconButton>
            </Grid>
        }
        />
      </Grid>      
    );
  }
}

const mapStateToProps = (state) => ({
    isCodeValid: state.claim.validationFields?.prescriberCode?.isValid,
    isCodeValidating: state.claim.validationFields?.prescriberCode?.isValidating,
    codeValidationError: state.claim.validationFields?.prescriberCode?.validationError,
    savedPrescriberCode: state.claim.prescriber?.code
  });

  export default connect(mapStateToProps)(
    withTheme(withStyles(styles)(PrescriberMasterPanel))
  );