import React, { Fragment } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import { bindActionCreators } from "redux";
import {
  formatMessage,
  ControlledField,
  withModulesManager,
  FormPanel,
  PublishedComponent,
  Contributions,
  AmountInput,
  TextInput,
  decodeId
} from "@openimis/fe-core";
import { Grid } from "@material-ui/core";
import _ from "lodash";
import ClaimAdminPicker from "../pickers/ClaimAdminPicker";
import { claimedAmount, approvedAmount } from "../helpers/amounts";
import { claimHealthFacilitySet, validateClaimCode } from "../actions";
import ClaimStatusPicker from "../pickers/ClaimStatusPicker";
import FeedbackStatusPicker from "../pickers/FeedbackStatusPicker";
import ReviewStatusPicker from "../pickers/ReviewStatusPicker";
import _debounce from "lodash/debounce";

const CLAIM_MASTER_PANEL_CONTRIBUTION_KEY = "claim.MasterPanel";

const styles = (theme) => ({
  paper: theme.paper.paper,
  paperHeader: theme.paper.header,
  paperHeaderAction: theme.paper.action,
  item: theme.paper.item,
});

class ClaimMasterPanel extends FormPanel {
  state = {
    claimCode: null,
    claimCodeError: null,
    dateAr: "",
    programAr: "",
    codeAr: "",
    claimLabel: null
  };

  constructor(props) {
    super(props);
    this.codeMaxLength = props.modulesManager.getConf("fe-claim", "claimForm.codeMaxLength", 6);
    this.guaranteeIdMaxLength = props.modulesManager.getConf("fe-claim", "claimForm.guaranteeIdMaxLength", 50);
    this.showAdjustmentAtEnter = props.modulesManager.getConf("fe-claim", "claimForm.showAdjustmentAtEnter", false);
    this.insureePicker = props.modulesManager.getConf(
      "fe-claim",
      "claimForm.insureePicker",
      "insuree.InsureeChfIdPicker",
    );
    this.claimPrefix = props.modulesManager.getConf(
      "fe-claim",
      "claimPrex",
      1,
    );
    this.hideSecDiagnos = props.modulesManager.getConf(
      "fe-claim",
      "hideSecDiagnos",
      1,
    );
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this._componentDidUpdate(prevProps, prevState, snapshot)) return;
    if (!prevProps.fetchingClaimCodeCount && this.props.fetchingClaimCodeCount) {
      this.setState({ claimCodeError: null });
    } else if (!prevProps.fetchedClaimCodeCount && this.props.fetchedClaimCodeCount) {
      if (!!this.props.claimCodeCount) {
        this.setState({ claimCodeError: formatMessage(this.props.intl, "claim", "edit.claimCodeExists") });
        this.updateAttribute("codeError", true);
      } else {
        this.updateAttributes({
          code: this.state.claimCode,
          codeError: null,
        });
      }
    }
  }

  formatClaimCode = () => {
    this.setState({
      dateAr: this.props.edited.dateTo ? this.props.edited.dateTo : "",
      programAr: this.props.edited.program ? this.props.edited.program.nameProgram : "",
      programCode: this.props.edited.program ? this.props.edited.program.code : ""
    })

    let label = `${this.props.edited.healthFacility ? this.props.edited.healthFacility.location.parent.name.substring(0, 2) : ""}.${this.state.dateAr ? this.state.dateAr.substring(0, 4) : ""}.${this.state.programCode ? this.state.programCode.substring(0, 3) : ""}.` + this.state.codeAr
    if (this.state.programAr == "Chèque Santé" || (this.state.programAr == "Chèque Santé" && (this.state.dateAr || this.state.programAr)) || (this.state.programAr == "" && this.state.dateAr) || (this.state.programAr && this.state.dateAr == "")) {
      if (this.state.claimCode != null) {
        this.validateClaimCode(this.state.codeAr)
      }
      console.log('afficher entre', this.state.claimCode !== null)
      this.setState({
        claimCode: this.state.claimCode
      })
    }
    else {
      this.setState({
        claimLabel: label,
        claimCode: label
      },
        (e) => { this.props.validateClaimCode(this.state.claimLabel) }
      )
    }


  }
  onChangeValue = (name, value) => {
    this.updateAttribute(name, value)
    this.debounceChangeValue()
  }
  validateClaimCode = (v) => {
    this.setState({
      codeAr: v,
    })
    let insureePolicies = this.state.data?.insuree?.insureePolicies?.edges.map((edge) => edge.node) ?? [];
    let policyNumber;
    var programName = this.props.edited?.program ? this.props.edited?.program?.nameProgram : "";

    if (programName == "Chèque Santé") {
      insureePolicies.forEach(function (policy) {
        if (policy.policy.status == 2 && policy.policy.policyNumber != null) {
          policyNumber = policy.policy.policyNumber;
        }
      })
      if (policyNumber != undefined) {
        v = policyNumber + v
      }
    }
    else if (this.props?.edited?.program !== undefined) {
      this.debounceChangeValue()
      v = this.state.claimLabel
    }



    this.setState(
      {
        claimCodeError: null,
        claimCode: v,
      },
      (e) => this.props.validateClaimCode(v),
    );
  };

  debounceUpdateCode = _debounce(
    this.validateClaimCode,
    this.props.modulesManager.getConf("fe-claim", "debounceTime", 800),
  );
  debounceChangeValue = _debounce(
    this.formatClaimCode,
    this.validateClaimCode,
    this.props.modulesManager.getConf("fe-claim", "debounceTime", 800),
  )

  render() {
    const { intl, classes, edited, reset, readOnly = false, forReview, forFeedback, hideSecDiagnos, changeProgram } = this.props;
    if (!edited) return null;
    let totalClaimed = 0;
    let totalApproved = 0;
    let policyNumber;
    let claimCode = edited.code;
    var CLAIMPROGRAM = !!edited && edited.program != undefined ? edited.program?.nameProgram : "";
    if (edited.items) {
      totalClaimed += edited.items.reduce((sum, r) => sum + claimedAmount(r), 0);
      totalApproved += edited.items.reduce((sum, r) => sum + approvedAmount(r), 0);
    }
    if (edited.services) {
      totalClaimed += edited.services.reduce((sum, r) => sum + claimedAmount(r), 0);
      totalApproved += edited.services.reduce((sum, r) => sum + approvedAmount(r), 0);
    }
    edited.claimed = _.round(totalClaimed, 2);
    edited.approved = _.round(totalApproved, 2);

    let ro = readOnly || !!forReview || !!forFeedback;

    let insureePolicies = edited?.insuree?.insureePolicies?.edges.map((edge) => edge.node) ?? [];
    insureePolicies.forEach(function (policy) {
      if (policy.policy.status == 2 && policy.policy.policyNumber != null) {
        policyNumber = policy.policy.policyNumber;
      }
    })


    if (CLAIMPROGRAM == "Chèque Santé") {

      if (edited.code && edited.code.includes('.')) {
        let elements = edited.code.split(".")
        claimCode = elements[3]
      } else
        if (edited.code && policyNumber != undefined) {
          claimCode = edited.code.replace(policyNumber, '');
        }
    }
    else {
      if (!CLAIMPROGRAM || CLAIMPROGRAM == "") {
        claimCode = edited.code
      }
      if (edited.code && this.state.claimLabel && edited.healthFacility && this.state.dateAr && this.state.dateAr) {
        claimCode = edited.code.replace(edited.healthFacility.location.parent.name.substring(0, 2), '').replace(this.state.programCode.substring(0, 3), '').replace(this.state.dateAr.substring(0, 4), '').replace('...', '')
      }
    }


    return (
      <Grid container>
        <ControlledField
          module="claim"
          id="Claim.healthFacility"
          field={
            <Grid item xs={3} className={classes.item}>
              <PublishedComponent
                pubRef="location.HealthFacilityPicker"
                value={edited.healthFacility}
                reset={reset}
                readOnly={true}
                required={true}
              />
            </Grid>
          }
        />
        <ControlledField
          module="claim"
          id="Claim.insuree"
          field={
            <Grid item xs={3} className={classes.item}>
              <PublishedComponent
                pubRef={this.insureePicker}
                value={edited.insuree}
                reset={reset}
                onChange={(v, s) => {

                  this.updateAttribute("insuree", v)

                }}
                readOnly={ro}
                required={true}
              />
            </Grid>
          }
        />
        <ControlledField
          module="claim"
          id="Claim.visitDateFrom"
          field={
            <Grid item xs={2} className={classes.item}>
              <PublishedComponent
                pubRef="core.DatePicker"
                value={edited.dateFrom}
                module="claim"
                label="visitDateFrom"
                reset={reset}
                onChange={(d) => this.updateAttribute("dateFrom", d)}
                readOnly={ro}
                required={true}
                maxDate={edited.dateTo < edited.dateClaimed ? edited.dateTo : edited.dateClaimed}
              />
            </Grid>
          }
        />
        <ControlledField
          module="claim"
          id="Claim.visitDateTo"
          field={
            <Grid item xs={2} className={classes.item}>
              <PublishedComponent
                pubRef="core.DatePicker"
                value={edited.dateTo}
                module="claim"
                label="visitDateTo"
                reset={reset}
                onChange={(d) => {
                  this.debounceChangeValue()
                  this.onChangeValue("dateTo", d)
                    ;
                }}
                readOnly={ro}
                required={true}
                minDate={edited.dateFrom}
                maxDate={edited.dateClaimed}
              />
            </Grid>
          }
        />
        <ControlledField
          module="claim"
          id="Claim.claimedDate"
          field={
            <Grid item xs={2} className={classes.item}>
              <PublishedComponent
                pubRef="core.DatePicker"
                value={edited.dateClaimed}
                module="claim"
                label="claimedDate"
                reset={reset}
                onChange={(d) => this.updateAttribute("dateClaimed", d)}
                readOnly={true}
                required={true}
                minDate={!!edited.dateTo ? edited.dateTo : edited.dateFrom}
              />
            </Grid>
          }
        />
        <ControlledField
          module="claim"
          id="Claim.visitType"
          field={
            <Grid item xs={forFeedback || forReview ? 2 : 3} className={classes.item}>
              <PublishedComponent
                pubRef="medical.VisitTypePicker"
                name="visitType"
                withNull={false}
                value={edited.visitType}
                reset={reset}
                onChange={(v, s) => this.updateAttribute("visitType", v)}
                readOnly={ro}
                required={true}
              />
            </Grid>
          }
        />
        {!forFeedback && (
          <ControlledField
            module="claim"
            id="Claim.mainDiagnosis"
            field={
              <Grid item xs={3} className={classes.item}>
                <PublishedComponent
                  pubRef="medical.DiagnosisPicker"
                  name="mainDiagnosis"
                  label={formatMessage(intl, "claim", "mainDiagnosis")}
                  value={edited.icd}
                  reset={reset}
                  onChange={(v, s) => this.updateAttribute("icd", v)}
                  readOnly={ro}
                  required
                />
              </Grid>
            }
          />
        )}
        {!!this.claimPrefix && !edited.uuid && CLAIMPROGRAM == "Chèque Santé" && (<ControlledField
          module="claim"
          id="Claim.codechfId"
          field={
            <Grid item xs={1} className={classes.item}>
              <TextInput
                module="claim"
                label="codechfId"
                required
                value={policyNumber}
                readOnly="true"
              />
            </Grid>
          }
        />
        )}
        <ControlledField
          module="claim"
          id="Claim.code"
          field={
            <Grid item xs={2} className={classes.item}>
              <TextInput
                module="claim"
                label="code"
                required
                value={claimCode}
                error={this.state.claimCodeError}
                reset={reset}
                onChange={this.debounceUpdateCode}
                readOnly={!!edited && edited[`uuid`] ? true : false}
                inputProps={{
                  "maxLength": this.codeMaxLength,
                }}
              />
            </Grid>
          }
        />

        {!!forFeedback && (
          <Fragment>
            <ControlledField
              module="claim"
              id="Claim.status"
              field={
                <Grid item xs={2} className={classes.item}>
                  <ClaimStatusPicker readOnly={true} value={edited.status} />
                </Grid>
              }
            />
            <ControlledField
              module="claim"
              id="Claim.feedbackStatus"
              field={
                <Grid item xs={2} className={classes.item}>
                  <FeedbackStatusPicker readOnly={true} value={edited.feedbackStatus} />
                </Grid>
              }
            />
            <ControlledField
              module="claim"
              id="Claim.reviewStatus"
              field={
                <Grid item xs={2} className={classes.item}>
                  <ReviewStatusPicker readOnly={true} value={edited.reviewStatus} />
                </Grid>
              }
            />
          </Fragment>
        )}
        {!forFeedback && (
          <ControlledField
            module="claim"
            id="Claim.claimed"
            field={
              <Grid item xs={forReview || edited.status >= 4 ? 1 : 2} className={classes.item}>
                <AmountInput value={edited.claimed} module="claim" label="claimed" readOnly={true} />
              </Grid>
            }
          />
        )}
        {(forReview || edited.status >= 4) && !forFeedback && (
          <Fragment>
            <ControlledField
              module="claim"
              id="Claim.approved"
              field={
                <Grid item xs={1} className={classes.item}>
                  <AmountInput value={edited.approved || null} module="claim" label="approved" readOnly={true} />
                </Grid>
              }
            />
            <ControlledField
              module="claim"
              id="Claim.valuated"
              field={
                <Grid item xs={1} className={classes.item}>
                  <AmountInput value={edited.valuated || null} module="claim" label="valuated" readOnly={true} />
                </Grid>
              }
            />
          </Fragment>
        )}
        {!this.hideSecDiagnos && !forFeedback && (
          <Fragment>
            <ControlledField
              module="claim"
              id="Claim.secDiagnosis1"
              field={
                <Grid item xs={3} className={classes.item}>
                  <PublishedComponent
                    pubRef="medical.DiagnosisPicker"
                    name="secDiagnosis1"
                    label={formatMessage(intl, "claim", "secDiagnosis1")}
                    value={edited.icd1}
                    reset={reset}
                    onChange={(v, s) => this.updateAttribute("icd1", v)}
                    readOnly={ro}
                  />
                </Grid>
              }
            />
            <ControlledField
              module="claim"
              id="Claim.secDiagnosis2"
              field={
                <Grid item xs={3} className={classes.item}>
                  <PublishedComponent
                    pubRef="medical.DiagnosisPicker"
                    name="secDiagnosis2"
                    label={formatMessage(intl, "claim", "secDiagnosis2")}
                    value={edited.icd2}
                    reset={reset}
                    onChange={(v, s) => this.updateAttribute("icd2", v)}
                    readOnly={ro}
                  />
                </Grid>
              }
            />
            <ControlledField
              module="claim"
              id="Claim.secDiagnosis3"
              field={
                <Grid item xs={3} className={classes.item}>
                  <PublishedComponent
                    pubRef="medical.DiagnosisPicker"
                    name="secDiagnosis3"
                    label={formatMessage(intl, "claim", "secDiagnosis3")}
                    value={edited.icd3}
                    reset={reset}
                    onChange={(v, s) => this.updateAttribute("icd3", v)}
                    readOnly={ro}
                  />
                </Grid>
              }
            />
            <ControlledField
              module="claim"
              id="Claim.secDiagnosis4"
              field={
                <Grid item xs={3} className={classes.item}>
                  <PublishedComponent
                    pubRef="medical.DiagnosisPicker"
                    name="secDiagnosis4"
                    label={formatMessage(intl, "claim", "secDiagnosis4")}
                    value={edited.icd4}
                    reset={reset}
                    onChange={(v, s) => this.updateAttribute("icd4", v)}
                    readOnly={ro}
                  />
                </Grid>
              }
            />
          </Fragment>
        )}
        <ControlledField
          module="claim"
          id="Claim.admin"
          field={
            <Grid item xs={4} className={classes.item}>
              <ClaimAdminPicker
                value={edited.admin}
                onChange={(v, s) => this.updateAttribute("admin", v)}
                readOnly
                required
              />
            </Grid>
          }
        />
        <ControlledField
          module="claim"
          id="Claim.program"
          field={
            <Grid item xs={4} className={classes.item}>
              <PublishedComponent
                pubRef="claim.ClaimProgramPicker"
                name="program"
                hfId={edited?.healthFacility ? decodeId(edited.healthFacility.id) : 0}
                insureeId={edited?.insuree ? decodeId(edited.insuree.id) : 0}
                visitDateFrom={edited?.dateFrom ? edited.dateFrom : ""}
                label={formatMessage(intl, "claim", "programPicker.label")}
                value={edited.program}
                reset={reset}
                readOnly={!!edited && edited[`uuid`] ? true : false}
                onChange={(v) => {
                  this.debounceChangeValue()
                  this.onChangeValue("program", v);
                  changeProgram();
                }}
                required={true}
              />
            </Grid>
          }
        />
        {policyNumber != undefined && policyNumber != null && (
          <ControlledField
            module="policy"
            id="Claim.policyNumber"
            field={
              <Grid item xs={2} className={classes.item}>
                <TextInput
                  module="policy"
                  label="policy.PolicyNumber"
                  name="policyNumber"
                  value={policyNumber}
                  readOnly={true}
                  reset={reset}
                />
              </Grid>
            }
          />
        )
        }
        {!forFeedback && (
          <Fragment>
            <ControlledField
              module="claim"
              id="Claim.explanation"
              field={
                <Grid item xs={this.showAdjustmentAtEnter ? 4 : 8} className={classes.item}>
                  <TextInput
                    module="claim"
                    label="explanation"
                    value={edited.explanation}
                    reset={reset}
                    onChange={(v) => this.updateAttribute("explanation", v)}
                    readOnly={ro}
                  />
                </Grid>
              }
            />
            {(!!forReview || this.showAdjustmentAtEnter || edited.status >= 4) && (
              <ControlledField
                module="claim"
                id="Claim.adjustment"
                field={
                  <Grid item xs={4} className={classes.item}>
                    <TextInput
                      module="claim"
                      label="adjustment"
                      value={edited.adjustment}
                      reset={reset}
                      onChange={(v) => this.updateAttribute("adjustment", v)}
                      readOnly={readOnly || edited.reviewStatus >= 8}
                    />
                  </Grid>
                }
              />
            )}
          </Fragment>
        )}
        <Contributions
          claim={edited}
          readOnly={ro}
          updateAttribute={this.updateAttribute}
          updateAttributes={this.updateAttributes}
          updateExts={this.updateExts}
          updateExt={this.updateExt}
          contributionKey={CLAIM_MASTER_PANEL_CONTRIBUTION_KEY}
        />
      </Grid>
    );
  }
}

const mapStateToProps = (state, props) => ({
  userHealthFacilityFullPath: !!state.loc ? state.loc.userHealthFacilityFullPath : null,
  fetchingClaimCodeCount: state.claim.fetchingClaimCodeCount,
  fetchedClaimCodeCount: state.claim.fetchedClaimCodeCount,
  claimCodeCount: state.claim.claimCodeCount,
  errorClaimCodeCount: state.claim.errorClaimCodeCount,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ claimHealthFacilitySet, validateClaimCode }, dispatch);
};

export default withModulesManager(
  injectIntl(connect(mapStateToProps, mapDispatchToProps)(withTheme(withStyles(styles)(ClaimMasterPanel)))),
);
