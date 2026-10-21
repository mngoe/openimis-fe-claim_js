import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import _debounce from "lodash/debounce";
import { injectIntl } from "react-intl";

import {
  Button,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  Switch,
  Tooltip,
  Typography,
} from "@material-ui/core";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import FilterListIcon from "@material-ui/icons/FilterList";
import { withTheme, withStyles } from "@material-ui/core/styles";

import {
  AmountInput,
  Contributions,
  ControlledField,
  PublishedComponent,
  TextInput,
  formatMessage,
  withModulesManager,
} from "@openimis/fe-core";
import { selectClaimAdmin, selectHealthFacility, selectDistrict, selectRegion } from "../actions";

const CLAIM_FILTER_CONTRIBUTION_KEY = "claim.Filter";

const styles = (theme) => ({
  form: {
    width: "100%",
    boxSizing: "border-box",
    padding: theme.spacing(1, 2, 2),
  },
  section: {
    marginTop: theme.spacing(2),
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: ".08em",
    textTransform: "uppercase",
    color: theme.palette.primary.main,
    whiteSpace: "nowrap",
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(0, 74, 124, .18)",
  },
  advancedToggleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
    paddingTop: theme.spacing(1.5),
    borderTop: "1px solid rgba(0, 74, 124, .14)",
  },
  advancedButton: {
    textTransform: "none",
    border: "1px dashed rgba(0, 74, 124, .35)",
    borderRadius: 4,
    padding: theme.spacing(0.5, 1),
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
  advancedBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0, 74, 124, .10)",
    fontSize: 11,
    fontWeight: 700,
    marginLeft: theme.spacing(0.75),
    padding: "0 6px",
  },
  chips: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  chip: {
    backgroundColor: "rgba(55, 212, 204, .22)",
    color: theme.palette.primary.main,
    fontWeight: 500,
    height: 26,
    fontSize: 12,
  },
  chipLabel: {
    fontWeight: 700,
  },
  clearAll: {
    textTransform: "none",
    fontSize: 12,
    color: theme.palette.primary.main,
    textDecoration: "underline",
    minWidth: "auto",
    padding: theme.spacing(0, 0.5),
  },
  advancedPanel: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(1.5, 2, 2),
    backgroundColor: "rgba(255, 255, 255, .42)",
    borderTop: "1px solid rgba(0, 74, 124, .14)",
  },
  advancedHint: {
    fontSize: 12,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
  },
});

class ClaimFilter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      reset: 0,
      advancedOpen: false,
    };
    this.debouncedOnChangeFilters = _debounce(
      props.onChangeFilters,
      props.modulesManager.getConf("fe-claim", "debounceTime", 200),
    );
    this.showPreAuthorization = props.modulesManager.getConf("fe-claim", "showPreAuthorization", false);
  }

  _filterValue = (key) => {
    const { filters } = this.props;
    return !!filters && !!filters[key] ? filters[key].value : null;
  };

  _filterTextValue = (key) => {
    const { filters } = this.props;
    return !!filters && !!filters[key] ? filters[key].value : "";
  };

  _regionFilter = (v) => ({
    id: "region",
    value: v,
    filter: !!v ? `healthFacility_Location_Parent_Uuid: "${v.uuid}"` : null,
  });

  _districtFilter = (v) => ({
    id: "district",
    value: v,
    filter: !!v ? `healthFacility_Location_Uuid: "${v.uuid}"` : null,
  });

  _healthFacilityFilter = (v) => ({
    id: "healthFacility",
    value: v,
    filter: !!v ? `healthFacility_Uuid: "${v.uuid}"` : null,
  });

  _claimAdminFilter = (v) => ({
    id: "admin",
    value: v,
    filter: !!v ? `admin_Uuid: "${v.uuid}"` : null,
  });

  _prescriberFilter = (v) => ({
    id: "prescriber",
    value: v,
    filter: !!v ? `prescriber_Uuid: "${v.uuid}"` : null,
  });

  _claimBatchRunFilter = (v) => ({
    id: "batchRun",
    value: v,
    filter: !!v ? `batchRun_Id: "${v.id}"` : null,
  });

  _onChangeRegion = (v) => {
    this.props.onChangeFilters([
      this._regionFilter(v),
      this._districtFilter(null),
      this._healthFacilityFilter(null),
      this._claimAdminFilter(null),
      this._claimBatchRunFilter(null),
    ]);
    this.props.selectRegion(v);
    this.setState((state) => ({ reset: state.reset + 1 }));
  };

  _onChangeDistrict = (v) => {
    this.props.onChangeFilters([
      this._regionFilter(!!v ? v.parent : this._filterValue("region")),
      this._districtFilter(v),
      this._healthFacilityFilter(null),
      this._claimAdminFilter(null),
      this._claimBatchRunFilter(null),
    ]);
    this.props.selectDistrict(v);
    this.setState((state) => ({ reset: state.reset + 1 }));
  };

  _onChangeHealthFacility = (v) => {
    this.props.onChangeFilters([
      this._regionFilter(!!v ? v.location.parent : this._filterValue("region")),
      this._districtFilter(!!v ? v.location : this._filterValue("district")),
      this._healthFacilityFilter(v),
      this._claimAdminFilter(null),
      this._claimBatchRunFilter(null),
    ]);
    this.props.selectHealthFacility(v);
    this.setState((state) => ({ reset: state.reset + 1 }));
  };

  _onChangeClaimAdmin = (v) => {
    this.props.onChangeFilters([
      this._regionFilter(!!v ? v.healthFacility.location.parent : this._filterValue("region")),
      this._districtFilter(!!v ? v.healthFacility.location : this._filterValue("district")),
      this._healthFacilityFilter(!!v ? v.healthFacility : this._filterValue("healthFacility")),
      this._claimAdminFilter(v),
    ]);
    this.props.selectClaimAdmin(v);
    this.setState((state) => ({ reset: state.reset + 1 }));
  };

  _onChangePrescriber = (v) => {
    this.props.onChangeFilters([this._prescriberFilter(v)]);
    this.setState((state) => ({ reset: state.reset + 1 }));
  };

  _onChangeBatchRun = (v) => {
    this.props.onChangeFilters([this._claimBatchRunFilter(v)]);
    this.setState((state) => ({ reset: state.reset + 1 }));
  };

  _onChangeClaimStatus = (v) => {
    this.props.onChangeFilters([
      { id: "claimStatus", value: v, filter: !!v ? `status: ${v}` : null },
    ]);
  };

  _onChangeFeedbackStatus = (v) => {
    this.props.onChangeFilters([
      { id: "feedbackStatus", value: v, filter: !!v ? `feedbackStatus: ${v}` : null },
    ]);
  };

  _onChangeReviewStatus = (v) => {
    this.props.onChangeFilters([
      { id: "reviewStatus", value: v, filter: !!v ? `reviewStatus: ${v}` : null },
    ]);
  };

  _onChangeClaimNo = (v) => {
    this.debouncedOnChangeFilters([
      { id: "claimNo", value: v, filter: !!v ? `code_Icontains: "${v}"` : null },
    ]);
  };

  _onChangePreAuthNo = (v) => {
    this.debouncedOnChangeFilters([
      { id: "preAuthNo", value: v, filter: !!v ? `codePreAuthorization_Icontains: "${v}"` : null },
    ]);
  };

  _onChangeChfId = (v) => {
    this.debouncedOnChangeFilters([
      { id: "chfId", value: v, filter: !!v ? `insuree_ChfId: "${v}"` : null },
    ]);
  };

  _onChangeClaimedAbove = (v) => {
    this.debouncedOnChangeFilters([
      { id: "claimedAbove", value: !v ? null : v, filter: !!v ? `claimed_Gte: "${parseFloat(v)}"` : null },
    ]);
  };

  _onChangeClaimedUnder = (v) => {
    this.debouncedOnChangeFilters([
      { id: "claimedUnder", value: !v ? null : v, filter: !!v ? `claimed_Lte: "${parseFloat(v)}"` : null },
    ]);
  };

  _onChangeVisitDateFrom = (d) => {
    this.props.onChangeFilters([
      { id: "visitDateFrom", value: d, filter: !!d ? `dateFrom_Gte: "${d}"` : null },
    ]);
  };

  _onChangeVisitDateTo = (d) => {
    this.props.onChangeFilters([
      { id: "visitDateTo", value: d, filter: !!d ? `dateTo_Lte: "${d}"` : null },
    ]);
  };

  _onChangeClaimDateFrom = (d) => {
    this.props.onChangeFilters([
      { id: "claimDateFrom", value: d, filter: !!d ? `dateClaimed_Gte: "${d}"` : null },
    ]);
  };

  _onChangeClaimDateTo = (d) => {
    this.props.onChangeFilters([
      { id: "claimDateTo", value: d, filter: !!d ? `dateClaimed_Lte: "${d}"` : null },
    ]);
  };

  _onChangeProcessedDateFrom = (d) => {
    this.props.onChangeFilters([
      { id: "processedDateFrom", value: d, filter: !!d ? `dateProcessed_Gte: "${d}"` : null },
    ]);
  };

  _onChangeProcessedDateTo = (d) => {
    this.props.onChangeFilters([
      { id: "processedDateTo", value: d, filter: !!d ? `dateProcessed_Lte: "${d}"` : null },
    ]);
  };

  _onChangeService = (v) => {
    this.props.onChangeFilters([
      { id: "medicalService", value: v, filter: !!v ? `services: ["${v.code}"]` : null },
    ]);
  };

  _onChangeItem = (v) => {
    this.props.onChangeFilters([
      { id: "medicalItem", value: v, filter: !!v ? `items: ["${v.code}"]` : null },
    ]);
  };

  _onChangeDiagnosis = (v) => {
    this.props.onChangeFilters([
      { id: "mainDiagnosis", value: v, filter: !!v ? `icd_Id: "${v.id}"` : null },
    ]);
  };

  _onChangeVisitType = (v) => {
    this.props.onChangeFilters([
      { id: "visitType", value: v, filter: !!v ? `visitType: "${v}"` : null },
    ]);
  };

  _onChangeCareType = (v) => {
    this.props.onChangeFilters([
      { id: "careType", value: v, filter: !!v ? `careType: "${v}"` : null },
    ]);
  };

  _onChangeAttachmentStatus = (v) => {
    this.props.onChangeFilters([
      { id: "attachmentStatus", value: v, filter: !!v ? `attachmentStatus: ${v}` : null },
    ]);
  };

  _onChangePreAuthorization = (v) => {
    this.props.onChangeFilters([
      {
        id: "preAuthorization",
        value: v,
        filter: v === null || v === "" ? null : `preAuthorization: ${v}`,
      },
    ]);
  };

  _onChangeShowRestored = (checked) => {
    this.props.onChangeFilters([
      { id: "showRestored", value: checked || null, filter: !!checked ? `showRestored: ${checked}` : null },
    ]);
  };

  _clearFilter = (id) => {
    const clearPair = (a, b) =>
      this.props.onChangeFilters([
        { id: a, value: null, filter: null },
        { id: b, value: null, filter: null },
      ]);
    if (id === "claimDateRange") {
      clearPair("claimDateFrom", "claimDateTo");
    } else if (id === "visitDateRange") {
      clearPair("visitDateFrom", "visitDateTo");
    } else if (id === "processedDateRange") {
      clearPair("processedDateFrom", "processedDateTo");
    } else if (id === "amountRange") {
      clearPair("claimedAbove", "claimedUnder");
    } else if (id === "region") {
      this._onChangeRegion(null);
      return;
    } else if (id === "district") {
      this._onChangeDistrict(null);
      return;
    } else if (id === "healthFacility") {
      this.props.onChangeFilters([this._healthFacilityFilter(null), this._claimAdminFilter(null)]);
    } else if (id === "admin") {
      this.props.onChangeFilters([this._claimAdminFilter(null)]);
    } else if (id === "prescriber") {
      this.props.onChangeFilters([this._prescriberFilter(null)]);
    } else if (id === "batchRun") {
      this.props.onChangeFilters([this._claimBatchRunFilter(null)]);
    } else {
      this.props.onChangeFilters([{ id, value: null, filter: null }]);
    }
    this.setState((state) => ({ reset: state.reset + 1 }));
  };

  _clearAll = () => {
    const ids = [
      "region", "district", "healthFacility", "admin", "prescriber", "batchRun",
      "claimStatus", "feedbackStatus", "reviewStatus", "claimNo", "preAuthNo", "chfId",
      "claimedAbove", "claimedUnder", "visitDateFrom", "visitDateTo",
      "claimDateFrom", "claimDateTo", "processedDateFrom", "processedDateTo",
      "medicalService", "medicalItem", "mainDiagnosis", "visitType", "careType",
      "attachmentStatus", "preAuthorization", "showRestored",
    ];
    this.props.onChangeFilters(ids.map((id) => ({ id, value: null, filter: null })));
    this.setState((state) => ({ reset: state.reset + 1 }));
  };

  _toggleAdvanced = () => {
    this.setState((state) => ({ advancedOpen: !state.advancedOpen }));
  };

  _displayName = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    return (
      value.name ||
      [value.lastName, value.otherNames].filter(Boolean).join(" ") ||
      value.code ||
      value.id
    );
  };

  _statusLabel = (group, value) => {
    if (group === "visitType") {
      return formatMessage(this.props.intl, "medical", `visitType.${value}`);
    }
    if (group === "feedbackStatus" && value === 1) {
      return formatMessage(this.props.intl, "claim", "feedbackStatus.toDo");
    }
    if (group === "reviewStatus" && value === 1) {
      return formatMessage(this.props.intl, "claim", "reviewStatus.toCheck");
    }
    return formatMessage(this.props.intl, "claim", `${group}.${value}`);
  };

  _renderSection = (titleKey, children) => {
    const { classes, intl } = this.props;
    return (
      <div className={classes.section}>
        <div className={classes.sectionHeader}>
          <Typography className={classes.sectionTitle}>{formatMessage(intl, "claim", titleKey)}</Typography>
          <span className={classes.sectionLine} />
        </div>
        <Grid container spacing={2}>
          {children}
        </Grid>
      </div>
    );
  };

  _renderChips = () => {
    const { intl, classes } = this.props;
    const chips = [];
    const addChip = (id, label, value) => {
      if (value === null || value === undefined || value === "") return;
      chips.push({ id, label, value });
    };

    const claimStatus = this._filterValue("claimStatus");
    if (claimStatus) {
      addChip("claimStatus", formatMessage(intl, "claim", "ClaimFilter.claimStatusChip"), this._statusLabel("claimStatus", claimStatus));
    }
    addChip("claimNo", formatMessage(intl, "claim", "ClaimFilter.claimNo"), this._filterTextValue("claimNo"));
    addChip("chfId", formatMessage(intl, "claim", "ClaimFilter.insureeCHFID"), this._filterTextValue("chfId"));
    addChip("healthFacility", formatMessage(intl, "claim", "ClaimFilter.healthFacility"), this._displayName(this._filterValue("healthFacility")));

    const claimFrom = this._filterValue("claimDateFrom");
    const claimTo = this._filterValue("claimDateTo");
    if (claimFrom || claimTo) {
      addChip("claimDateRange", formatMessage(intl, "claim", "ClaimFilter.claimDateChip"), `${claimFrom || "…"} → ${claimTo || "…"}`);
    }
    const amountFrom = this._filterValue("claimedAbove");
    const amountTo = this._filterValue("claimedUnder");
    if (amountFrom || amountTo) {
      addChip("amountRange", formatMessage(intl, "claim", "ClaimFilter.amountChip"), `${amountFrom || "0"} → ${amountTo || "…"}`);
    }

    addChip("region", formatMessage(intl, "claim", "ClaimFilter.region"), this._displayName(this._filterValue("region")));
    addChip("district", formatMessage(intl, "claim", "ClaimFilter.district"), this._displayName(this._filterValue("district")));
    addChip("admin", formatMessage(intl, "claim", "ClaimFilter.claimAdmin"), this._displayName(this._filterValue("admin")));
    addChip("prescriber", formatMessage(intl, "claim", "ClaimFilter.prescriber"), this._displayName(this._filterValue("prescriber")));
    addChip("batchRun", formatMessage(intl, "claim", "ClaimFilter.batchRun"), this._displayName(this._filterValue("batchRun")));
    addChip("preAuthNo", formatMessage(intl, "claim", "ClaimFilter.preAuthNo"), this._filterTextValue("preAuthNo"));
    addChip("medicalService", formatMessage(intl, "claim", "ClaimFilter.medicalService"), this._displayName(this._filterValue("medicalService")));
    addChip("medicalItem", formatMessage(intl, "claim", "ClaimFilter.medicalItem"), this._displayName(this._filterValue("medicalItem")));
    addChip("mainDiagnosis", formatMessage(intl, "claim", "ClaimFilter.mainDiagnosis"), this._displayName(this._filterValue("mainDiagnosis")));

    const visitType = this._filterValue("visitType");
    if (visitType) addChip("visitType", formatMessage(intl, "claim", "ClaimFilter.visitType"), this._statusLabel("visitType", visitType));
    const careType = this._filterValue("careType");
    if (careType) addChip("careType", formatMessage(intl, "claim", "ClaimFilter.careTypeChip"), this._statusLabel("careType", careType));
    const feedbackStatus = this._filterValue("feedbackStatus");
    if (feedbackStatus) addChip("feedbackStatus", formatMessage(intl, "claim", "ClaimFilter.feedbackStatusChip"), this._statusLabel("feedbackStatus", feedbackStatus));
    const reviewStatus = this._filterValue("reviewStatus");
    if (reviewStatus) addChip("reviewStatus", formatMessage(intl, "claim", "ClaimFilter.reviewStatusChip"), this._statusLabel("reviewStatus", reviewStatus));
    const attachmentStatus = this._filterValue("attachmentStatus");
    if (attachmentStatus) addChip("attachmentStatus", formatMessage(intl, "claim", "ClaimFilter.attachmentStatus"), this._statusLabel("attachmentStatus", attachmentStatus));
    const preAuthorization = this._filterValue("preAuthorization");
    if (preAuthorization !== null) addChip("preAuthorization", formatMessage(intl, "claim", "ClaimFilter.preAuthorizationChip"), preAuthorization ? formatMessage(intl, "claim", "ClaimFilter.yes") : formatMessage(intl, "claim", "ClaimFilter.no"));
    if (this._filterValue("showRestored")) addChip("showRestored", formatMessage(intl, "claim", "ClaimFilter.showRestoredChip"), formatMessage(intl, "claim", "ClaimFilter.yes"));

    return (
      <Fragment>
        {chips.map((chip) => (
          <Tooltip key={chip.id} title={formatMessage(intl, "claim", "ClaimFilter.removeFilter")}>
            <Chip
              size="small"
              className={classes.chip}
              onDelete={() => this._clearFilter(chip.id)}
              label={<span><span className={classes.chipLabel}>{chip.label}</span> : {chip.value}</span>}
            />
          </Tooltip>
        ))}
        {chips.length > 0 && (
          <Button className={classes.clearAll} onClick={this._clearAll}>
            {formatMessage(intl, "claim", "ClaimFilter.clearAll")}
          </Button>
        )}
      </Fragment>
    );
  };

  render() {
    const { classes, intl, filters, onChangeFilters, filterPaneContributionsKey, FilterExt, userHealthFacilityId } = this.props;
    const { advancedOpen } = this.state;
    const advancedCount = 18 + (userHealthFacilityId ? 0 : 1) + (this.showPreAuthorization ? 1 : 0);

    return (
      <form className={classes.form} noValidate autoComplete="off">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <PublishedComponent
              pubRef="claim.ClaimStatusPicker"
              name="claimStatus"
              value={this._filterValue("claimStatus")}
              onChange={this._onChangeClaimStatus}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextInput module="claim" label="ClaimFilter.claimNo" name="claimNo" value={this._filterTextValue("claimNo")} onChange={this._onChangeClaimNo} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextInput module="claim" label="ClaimFilter.insureeCHFID" name="chfId" value={this._filterTextValue("chfId")} onChange={this._onChangeChfId} />
          </Grid>
          <ControlledField
            module="claim"
            id="ClaimFilter.healthFacility"
            field={
              <Grid item xs={12} sm={6} md={4}>
                <PublishedComponent
                  pubRef="location.HealthFacilityPicker"
                  value={this._filterValue("healthFacility")}
                  region={this._filterValue("region")}
                  district={this._filterValue("district")}
                  reset={this.state.reset}
                  onChange={this._onChangeHealthFacility}
                />
              </Grid>
            }
          />
          <Grid item xs={12} sm={6} md={4}>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <PublishedComponent pubRef="core.DatePicker" module="claim" label="ClaimFilter.claimedDateFrom" value={this._filterValue("claimDateFrom")} onChange={this._onChangeClaimDateFrom} />
              </Grid>
              <Grid item xs={6}>
                <PublishedComponent pubRef="core.DatePicker" module="claim" label="ClaimFilter.claimedDateTo" value={this._filterValue("claimDateTo")} onChange={this._onChangeClaimDateTo} />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <AmountInput module="claim" label="ClaimFilter.claimedAbove" name="claimedAbove" value={this._filterValue("claimedAbove")} onChange={this._onChangeClaimedAbove} />
              </Grid>
              <Grid item xs={6}>
                <AmountInput module="claim" label="ClaimFilter.claimedUnder" name="claimedUnder" value={this._filterValue("claimedUnder")} onChange={this._onChangeClaimedUnder} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <div className={classes.advancedToggleRow}>
          <Button
            className={classes.advancedButton}
            onClick={this._toggleAdvanced}
            startIcon={<FilterListIcon />}
            endIcon={advancedOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            {formatMessage(intl, "claim", advancedOpen ? "ClaimFilter.hideAdvanced" : "ClaimFilter.showAdvanced")}
            <span className={classes.advancedBadge}>{advancedCount}</span>
          </Button>
          <div className={classes.chips}>{this._renderChips()}</div>
        </div>

        {advancedOpen && (
          <div className={classes.advancedPanel}>
            <Typography className={classes.advancedHint}>
              {formatMessage(intl, "claim", "ClaimFilter.advancedHint")}
            </Typography>

            {this._renderSection("ClaimFilter.identification", (
              <Fragment>
                <ControlledField module="claim" id="ClaimFilter.claimAdmin" field={
                  <Grid item xs={12} sm={6} md={userHealthFacilityId ? 4 : 3}>
                    <PublishedComponent pubRef="claim.ClaimAdminPicker" value={this._filterValue("admin")} withNull={true} hfFilter={this._filterValue("healthFacility")} reset={this.state.reset} onChange={this._onChangeClaimAdmin} region={this._filterValue("region")} district={this._filterValue("district")} required={true} />
                  </Grid>
                } />
                <ControlledField module="claim" id="ClaimFilter.PrescriberPicker" field={
                  <Grid item xs={12} sm={6} md={userHealthFacilityId ? 4 : 3}>
                    <PublishedComponent pubRef="claim.PrescriberPicker" value={this._filterValue("prescriber")} withNull={true} reset={this.state.reset} onChange={this._onChangePrescriber} />
                  </Grid>
                } />
                {!userHealthFacilityId && (
                  <ControlledField module="claim" id="ClaimFilter.batchRun" field={
                    <Grid item xs={12} sm={6} md={3}>
                      <PublishedComponent pubRef="claim_batch.BatchRunPicker" value={this._filterValue("batchRun")} withNull={true} scopeRegion={this._filterValue("region")} scopeDistrict={this._filterValue("district")} reset={this.state.reset} onChange={this._onChangeBatchRun} />
                    </Grid>
                  } />
                )}
                <Grid item xs={12} sm={6} md={userHealthFacilityId ? 4 : 3}>
                  <TextInput module="claim" label="ClaimFilter.preAuthNo" name="preAuthNo" value={this._filterTextValue("preAuthNo")} onChange={this._onChangePreAuthNo} />
                </Grid>
              </Fragment>
            ))}

            {this._renderSection("ClaimFilter.location", (
              <Fragment>
                <ControlledField module="claim" id="ClaimFilter.region" field={
                  <Grid item xs={12} sm={6}>
                    <PublishedComponent pubRef="location.RegionPicker" value={this._filterValue("region")} withNull={true} onChange={this._onChangeRegion} />
                  </Grid>
                } />
                <ControlledField module="claim" id="ClaimFilter.district" field={
                  <Grid item xs={12} sm={6}>
                    <PublishedComponent pubRef="location.DistrictPicker" value={this._filterValue("district")} region={this._filterValue("region")} withNull={true} reset={this.state.reset} onChange={this._onChangeDistrict} />
                  </Grid>
                } />
              </Fragment>
            ))}

            {this._renderSection("ClaimFilter.prestation", (
              <Fragment>
                <Grid item xs={12} sm={6} md={3}>
                  <PublishedComponent pubRef="medical.ServicePicker" value={this._filterValue("medicalService")} name="medicalService" label={formatMessage(intl, "claim", "medicalService")} onChange={this._onChangeService} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <PublishedComponent pubRef="medical.ItemPicker" value={this._filterValue("medicalItem")} name="medicalItem" label={formatMessage(intl, "claim", "medicalItem")} onChange={this._onChangeItem} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <PublishedComponent pubRef="medical.DiagnosisPicker" name="mainDiagnosis" label={formatMessage(intl, "claim", "mainDiagnosis")} value={this._filterValue("mainDiagnosis")} onChange={this._onChangeDiagnosis} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <PublishedComponent pubRef="medical.VisitTypePicker" name="visitType" value={this._filterValue("visitType")} onChange={this._onChangeVisitType} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <PublishedComponent pubRef="claim.CareTypePicker" name="careType" label="ClaimFilter.careTypeChip" value={this._filterValue("careType")} onChange={this._onChangeCareType} />
                </Grid>
              </Fragment>
            ))}

            {this._renderSection("ClaimFilter.dates", (
              <Fragment>
                <Grid item xs={12} sm={6}>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <PublishedComponent pubRef="core.DatePicker" module="claim" label="visitDateFrom" value={this._filterValue("visitDateFrom")} onChange={this._onChangeVisitDateFrom} />
                    </Grid>
                    <Grid item xs={6}>
                      <PublishedComponent pubRef="core.DatePicker" module="claim" label="visitDateTo" value={this._filterValue("visitDateTo")} onChange={this._onChangeVisitDateTo} />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <PublishedComponent pubRef="core.DatePicker" module="claim" label="ClaimFilter.processedDateFrom" value={this._filterValue("processedDateFrom")} onChange={this._onChangeProcessedDateFrom} />
                    </Grid>
                    <Grid item xs={6}>
                      <PublishedComponent pubRef="core.DatePicker" module="claim" label="ClaimFilter.processedDateTo" value={this._filterValue("processedDateTo")} onChange={this._onChangeProcessedDateTo} />
                    </Grid>
                  </Grid>
                </Grid>
              </Fragment>
            ))}

            {this._renderSection("ClaimFilter.options", (
              <Fragment>
                <Grid item xs={12} sm={6} md={3}>
                  <PublishedComponent pubRef="claim.FeedbackStatusPicker" name="feedbackStatus" label="ClaimFilter.feedbackStatusChip" value={this._filterValue("feedbackStatus")} onChange={this._onChangeFeedbackStatus} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <PublishedComponent pubRef="claim.ReviewStatusPicker" name="reviewStatus" label="ClaimFilter.reviewStatusChip" value={this._filterValue("reviewStatus")} onChange={this._onChangeReviewStatus} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <PublishedComponent pubRef="claim.AttachmentStatusPicker" name="attachmentStatus" label="ClaimFilter.attachmentStatus" value={this._filterValue("attachmentStatus")} onChange={this._onChangeAttachmentStatus} />
                </Grid>
                {this.showPreAuthorization && (
                  <Grid item xs={12} sm={6} md={3}>
                    <PublishedComponent pubRef="claim.YesNoPicker" name="preAuthorization" label="ClaimFilter.preAuthorizationChip" value={this._filterValue("preAuthorization")} onChange={this._onChangePreAuthorization} />
                  </Grid>
                )}
                <Grid item xs={12} sm={6} md={6}>
                  <ControlledField
                    module="claim"
                    id="ClaimFilter.showRestored"
                    field={
                      <FormControlLabel
                        control={<Switch color="primary" checked={!!this._filterValue("showRestored")} onChange={(e) => this._onChangeShowRestored(e.target.checked)} />}
                        label={formatMessage(intl, "claim", "showRestored")}
                      />
                    }
                  />
                </Grid>
              </Fragment>
            ))}

            <Grid container spacing={2}>
              <Contributions filters={filters} onChangeFilters={onChangeFilters} contributionKey={CLAIM_FILTER_CONTRIBUTION_KEY} />
              {!!filterPaneContributionsKey && (
                <Contributions filters={filters} onChangeFilters={onChangeFilters} contributionKey={filterPaneContributionsKey} />
              )}
            </Grid>
            {!!FilterExt && (
              <Fragment>
                <Divider />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FilterExt onChangeFilters={onChangeFilters} filters={filters} />
                  </Grid>
                </Grid>
              </Fragment>
            )}
          </div>
        )}
      </form>
    );
  }
}

const mapStateToProps = (state) => ({
  userHealthFacilityId: state.core.user.i_user.health_facility_id,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ selectClaimAdmin, selectHealthFacility, selectDistrict, selectRegion }, dispatch);

export default withModulesManager(
  injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(ClaimFilter)))),
);
