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
  groupLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(0.5),
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
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

class PreauthorizationFilter extends Component {
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

  _onChangeStatus = (v) => {
    this.props.onChangeFilters([
      {
        id: "claimPreAuthStatus",
        value: v,
        filter: !!v ? `statusPreAuthorization: ${v}` : null,
      },
    ]);
  };

  _onChangePreAuthNo = (v) => {
    this.debouncedOnChangeFilters([
      {
        id: "claimPreAuthNo",
        value: v,
        filter: !!v ? `codePreAuthorization_Icontains: "${v}"` : null,
      },
    ]);
  };

  _onChangeChfId = (v) => {
    this.debouncedOnChangeFilters([
      {
        id: "chfId",
        value: v,
        filter: !!v ? `insuree_ChfId: "${v}"` : null,
      },
    ]);
  };

  _onChangeClaimedAbove = (v) => {
    this.debouncedOnChangeFilters([
      {
        id: "claimedAbove",
        value: !v ? null : v,
        filter: !!v ? `claimed_Gte: "${parseFloat(v)}"` : null,
      },
    ]);
  };

  _onChangeClaimedUnder = (v) => {
    this.debouncedOnChangeFilters([
      {
        id: "claimedUnder",
        value: !v ? null : v,
        filter: !!v ? `claimed_Lte: "${parseFloat(v)}"` : null,
      },
    ]);
  };

  _onChangeDateFrom = (d) => {
    this.props.onChangeFilters([
      {
        id: "datePreAuthorizationFrom",
        value: d,
        filter: !!d ? `datePreAuthorization_Gte: "${d}T00:00:00"` : null,
      },
    ]);
  };

  _onChangeDateTo = (d) => {
    this.props.onChangeFilters([
      {
        id: "datePreAuthorizationTo",
        value: d,
        filter: !!d ? `datePreAuthorization_Lte: "${d}T23:59:59"` : null,
      },
    ]);
  };

  _onChangeService = (v) => {
    this.props.onChangeFilters([
      {
        id: "medicalService",
        value: v,
        filter: !!v ? `services: ["${v.code}"]` : null,
      },
    ]);
  };

  _onChangeItem = (v) => {
    this.props.onChangeFilters([
      {
        id: "medicalItem",
        value: v,
        filter: !!v ? `items: ["${v.code}"]` : null,
      },
    ]);
  };

  _onChangeDiagnosis = (v) => {
    this.props.onChangeFilters([
      {
        id: "mainDiagnosis",
        value: v,
        filter: !!v ? `icd_Id: "${v.id}"` : null,
      },
    ]);
  };

  _onChangeVisitType = (v) => {
    this.props.onChangeFilters([
      {
        id: "visitType",
        value: v,
        filter: !!v ? `visitType: "${v}"` : null,
      },
    ]);
  };

  _onChangeAttachmentStatus = (v) => {
    this.props.onChangeFilters([
      {
        id: "attachmentStatus",
        value: v,
        filter: !!v ? `attachmentStatus: ${v}` : null,
      },
    ]);
  };

  _onChangeShowRestored = (checked) => {
    this.props.onChangeFilters([
      {
        id: "showRestored",
        value: checked || null,
        filter: !!checked ? `showRestored: ${checked}` : null,
      },
    ]);
  };

  _clearFilter = (id) => {
    if (id === "dateRange") {
      this.props.onChangeFilters([
        { id: "datePreAuthorizationFrom", value: null, filter: null },
        { id: "datePreAuthorizationTo", value: null, filter: null },
      ]);
    } else if (id === "amountRange") {
      this.props.onChangeFilters([
        { id: "claimedAbove", value: null, filter: null },
        { id: "claimedUnder", value: null, filter: null },
      ]);
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
      "region",
      "district",
      "healthFacility",
      "admin",
      "prescriber",
      "batchRun",
      "claimPreAuthStatus",
      "claimPreAuthNo",
      "chfId",
      "claimedAbove",
      "claimedUnder",
      "datePreAuthorizationFrom",
      "datePreAuthorizationTo",
      "medicalService",
      "medicalItem",
      "mainDiagnosis",
      "visitType",
      "attachmentStatus",
      "showRestored",
      "claimStatus",
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

    const status = this._filterValue("claimPreAuthStatus");
    if (status) {
      addChip(
        "claimPreAuthStatus",
        formatMessage(intl, "claim", "ClaimFilter.preauthStatus"),
        formatMessage(intl, "claim", `preAuth.status.${status}`),
      );
    }
    addChip("claimPreAuthNo", formatMessage(intl, "claim", "ClaimFilter.claimPreAuthNo"), this._filterTextValue("claimPreAuthNo"));
    addChip("chfId", formatMessage(intl, "claim", "ClaimFilter.insureeCHFID"), this._filterTextValue("chfId"));

    const healthFacility = this._filterValue("healthFacility");
    addChip("healthFacility", formatMessage(intl, "claim", "ClaimFilter.healthFacility"), this._displayName(healthFacility));

    const dateFrom = this._filterValue("datePreAuthorizationFrom");
    const dateTo = this._filterValue("datePreAuthorizationTo");
    if (dateFrom || dateTo) {
      addChip(
        "dateRange",
        formatMessage(intl, "claim", "ClaimFilter.periodChip"),
        `${dateFrom || "…"} → ${dateTo || "…"}`,
      );
    }

    const claimedAbove = this._filterValue("claimedAbove");
    const claimedUnder = this._filterValue("claimedUnder");
    if (claimedAbove || claimedUnder) {
      addChip(
        "amountRange",
        formatMessage(intl, "claim", "ClaimFilter.amountChip"),
        `${claimedAbove || "0"} → ${claimedUnder || "…"}`,
      );
    }

    addChip("region", formatMessage(intl, "claim", "ClaimFilter.region"), this._displayName(this._filterValue("region")));
    addChip("district", formatMessage(intl, "claim", "ClaimFilter.district"), this._displayName(this._filterValue("district")));
    addChip("admin", formatMessage(intl, "claim", "ClaimFilter.claimAdmin"), this._displayName(this._filterValue("admin")));
    addChip("prescriber", formatMessage(intl, "claim", "ClaimFilter.prescriber"), this._displayName(this._filterValue("prescriber")));
    addChip("batchRun", formatMessage(intl, "claim", "ClaimFilter.batchRun"), this._displayName(this._filterValue("batchRun")));
    addChip("medicalService", formatMessage(intl, "claim", "ClaimFilter.medicalService"), this._displayName(this._filterValue("medicalService")));
    addChip("medicalItem", formatMessage(intl, "claim", "ClaimFilter.medicalItem"), this._displayName(this._filterValue("medicalItem")));
    addChip("mainDiagnosis", formatMessage(intl, "claim", "ClaimFilter.mainDiagnosis"), this._displayName(this._filterValue("mainDiagnosis")));

    const visitType = this._filterValue("visitType");
    if (visitType) {
      addChip(
        "visitType",
        formatMessage(intl, "claim", "ClaimFilter.visitType"),
        formatMessage(intl, "medical", `visitType.${visitType}`),
      );
    }

    const attachmentStatus = this._filterValue("attachmentStatus");
    if (attachmentStatus) {
      addChip(
        "attachmentStatus",
        formatMessage(intl, "claim", "ClaimFilter.attachmentStatus"),
        formatMessage(intl, "claim", `attachmentStatus.${attachmentStatus}`),
      );
    }

    if (this._filterValue("showRestored")) {
      addChip("showRestored", formatMessage(intl, "claim", "ClaimFilter.showRestoredChip"), formatMessage(intl, "claim", "ClaimFilter.yes"));
    }

    return (
      <Fragment>
        {chips.map((chip) => (
          <Tooltip key={chip.id} title={formatMessage(intl, "claim", "ClaimFilter.removeFilter")}>
            <Chip
              size="small"
              className={classes.chip}
              onDelete={() => this._clearFilter(chip.id)}
              label={
                <span>
                  <span className={classes.chipLabel}>{chip.label}</span> : {chip.value}
                </span>
              }
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
    const advancedCount = userHealthFacilityId ? 10 : 11;

    return (
      <form className={classes.form} noValidate autoComplete="off">
        <Grid container spacing={2}>
          <ControlledField
            module="claim"
            id="ClaimFilter.claimPreAuthStatus"
            field={
              <Grid item xs={12} sm={6} md={4}>
                <PublishedComponent
                  pubRef="claim.PreAuthFilterPicker"
                  name="claimPreAuthStatus"
                  value={this._filterValue("claimPreAuthStatus")}
                  onChange={this._onChangeStatus}
                />
              </Grid>
            }
          />
          <ControlledField
            module="claim"
            id="ClaimFilter.claimPreAuthNo"
            field={
              <Grid item xs={12} sm={6} md={4}>
                <TextInput
                  module="claim"
                  label="ClaimFilter.claimPreAuthNo"
                  name="claimPreAuthNo"
                  value={this._filterTextValue("claimPreAuthNo")}
                  onChange={this._onChangePreAuthNo}
                />
              </Grid>
            }
          />
          <ControlledField
            module="claim"
            id="ClaimFilter.insureeCHFID"
            field={
              <Grid item xs={12} sm={6} md={4}>
                <TextInput
                  module="claim"
                  label="ClaimFilter.insureeCHFID"
                  name="chfId"
                  value={this._filterTextValue("chfId")}
                  onChange={this._onChangeChfId}
                />
              </Grid>
            }
          />
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
          <ControlledField
            module="claim"
            id="ClaimFilter.datePreAuthorization"
            field={
              <Grid item xs={12} sm={6} md={4}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <PublishedComponent
                      pubRef="core.DatePicker"
                      module="claim"
                      label="ClaimFilter.periodFrom"
                      value={this._filterValue("datePreAuthorizationFrom")}
                      onChange={this._onChangeDateFrom}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <PublishedComponent
                      pubRef="core.DatePicker"
                      module="claim"
                      label="ClaimFilter.periodTo"
                      value={this._filterValue("datePreAuthorizationTo")}
                      onChange={this._onChangeDateTo}
                    />
                  </Grid>
                </Grid>
              </Grid>
            }
          />
          <ControlledField
            module="claim"
            id="ClaimFilter.claimed"
            field={
              <Grid item xs={12} sm={6} md={4}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <AmountInput
                      module="claim"
                      label="ClaimFilter.amountMinLabel"
                      name="claimedAbove"
                      value={this._filterValue("claimedAbove")}
                      onChange={this._onChangeClaimedAbove}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <AmountInput
                      module="claim"
                      label="ClaimFilter.amountMaxLabel"
                      name="claimedUnder"
                      value={this._filterValue("claimedUnder")}
                      onChange={this._onChangeClaimedUnder}
                    />
                  </Grid>
                </Grid>
              </Grid>
            }
          />
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

            {this._renderSection(
              "ClaimFilter.identification",
              <Fragment>
                <ControlledField
                  module="claim"
                  id="ClaimFilter.claimAdmin"
                  field={
                    <Grid item xs={12} sm={6} md={userHealthFacilityId ? 6 : 4}>
                      <PublishedComponent
                        pubRef="claim.ClaimAdminPicker"
                        value={this._filterValue("admin")}
                        withNull={true}
                        hfFilter={this._filterValue("healthFacility")}
                        reset={this.state.reset}
                        onChange={this._onChangeClaimAdmin}
                        region={this._filterValue("region")}
                        district={this._filterValue("district")}
                        required={true}
                      />
                    </Grid>
                  }
                />
                <ControlledField
                  module="claim"
                  id="ClaimFilter.PrescriberPicker"
                  field={
                    <Grid item xs={12} sm={6} md={userHealthFacilityId ? 6 : 4}>
                      <PublishedComponent
                        pubRef="claim.PrescriberPicker"
                        value={this._filterValue("prescriber")}
                        withNull={true}
                        reset={this.state.reset}
                        onChange={this._onChangePrescriber}
                      />
                    </Grid>
                  }
                />
                {!userHealthFacilityId && (
                  <ControlledField
                    module="claim"
                    id="ClaimFilter.batchRun"
                    field={
                      <Grid item xs={12} sm={6} md={4}>
                        <PublishedComponent
                          pubRef="claim_batch.BatchRunPicker"
                          value={this._filterValue("batchRun")}
                          withNull={true}
                          scopeRegion={this._filterValue("region")}
                          scopeDistrict={this._filterValue("district")}
                          reset={this.state.reset}
                          onChange={this._onChangeBatchRun}
                        />
                      </Grid>
                    }
                  />
                )}
              </Fragment>,
            )}

            {this._renderSection(
              "ClaimFilter.location",
              <Fragment>
                <ControlledField
                  module="claim"
                  id="ClaimFilter.region"
                  field={
                    <Grid item xs={12} sm={6}>
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
                    <Grid item xs={12} sm={6}>
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
              </Fragment>,
            )}

            {this._renderSection(
              "ClaimFilter.prestation",
              <Fragment>
                <ControlledField
                  module="claim"
                  id="ClaimFilter.medicalService"
                  field={
                    <Grid item xs={12} sm={6} md={3}>
                      <PublishedComponent
                        pubRef="medical.ServicePicker"
                        preAuth={true}
                        value={this._filterValue("medicalService")}
                        name="medicalService"
                        label={formatMessage(intl, "claim", "medicalService")}
                        onChange={this._onChangeService}
                      />
                    </Grid>
                  }
                />
                <ControlledField
                  module="claim"
                  id="ClaimFilter.medicalItem"
                  field={
                    <Grid item xs={12} sm={6} md={3}>
                      <PublishedComponent
                        pubRef="medical.ItemPicker"
                        preAuth={true}
                        value={this._filterValue("medicalItem")}
                        name="medicalItem"
                        label={formatMessage(intl, "claim", "medicalItem")}
                        onChange={this._onChangeItem}
                      />
                    </Grid>
                  }
                />
                <ControlledField
                  module="claim"
                  id="ClaimFilter.mainDiagnosis"
                  field={
                    <Grid item xs={12} sm={6} md={3}>
                      <PublishedComponent
                        pubRef="medical.DiagnosisPicker"
                        name="mainDiagnosis"
                        label={formatMessage(intl, "claim", "mainDiagnosis")}
                        value={this._filterValue("mainDiagnosis")}
                        onChange={this._onChangeDiagnosis}
                      />
                    </Grid>
                  }
                />
                <ControlledField
                  module="claim"
                  id="ClaimFilter.visitType"
                  field={
                    <Grid item xs={12} sm={6} md={3}>
                      <PublishedComponent
                        pubRef="medical.VisitTypePicker"
                        name="visitType"
                        value={this._filterValue("visitType")}
                        onChange={this._onChangeVisitType}
                      />
                    </Grid>
                  }
                />
              </Fragment>,
            )}

            {this._renderSection(
              "ClaimFilter.options",
              <Fragment>
                <ControlledField
                  module="claim"
                  id="ClaimFilter.attachmentStatus"
                  field={
                    <Grid item xs={12} sm={6} md={4}>
                      <PublishedComponent
                        pubRef="claim.AttachmentStatusPicker"
                        name="attachmentStatus"
                        value={this._filterValue("attachmentStatus")}
                        onChange={this._onChangeAttachmentStatus}
                      />
                    </Grid>
                  }
                />
                <ControlledField
                  module="claim"
                  id="ClaimFilter.showRestored"
                  field={
                    <Grid item xs={12} sm={6} md={8}>
                      <FormControlLabel
                        control={
                          <Switch
                            color="primary"
                            checked={!!this._filterValue("showRestored")}
                            onChange={(event) => this._onChangeShowRestored(event.target.checked)}
                          />
                        }
                        label={formatMessage(intl, "claim", "showRestored")}
                      />
                    </Grid>
                  }
                />
              </Fragment>,
            )}

            <Grid container spacing={2}>
              <Contributions
                filters={filters}
                onChangeFilters={onChangeFilters}
                contributionKey={CLAIM_FILTER_CONTRIBUTION_KEY}
              />
              {!!filterPaneContributionsKey && (
                <Contributions
                  filters={filters}
                  onChangeFilters={onChangeFilters}
                  contributionKey={filterPaneContributionsKey}
                />
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
  bindActionCreators(
    {
      selectClaimAdmin,
      selectHealthFacility,
      selectDistrict,
      selectRegion,
    },
    dispatch,
  );

export default withModulesManager(
  injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(PreauthorizationFilter)))),
);
