import React, { Component, Fragment } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import _ from "lodash";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { IconButton, Typography, Tooltip, Badge, Chip, Checkbox, FormControlLabel } from "@material-ui/core";
import AttachIcon from "@material-ui/icons/AttachFile";
import TabIcon from "@material-ui/icons/Tab";
import CheckIcon from "@material-ui/icons/Check";
import { Searcher } from "@openimis/fe-core";
import ClaimFilter from "./ClaimFilter";
import {
  withModulesManager,
  formatMessageWithValues,
  formatMessage,
  formatDateFromISO,
  formatAmount,
  PublishedComponent,
} from "@openimis/fe-core";
import { fetchClaimSummaries } from "../actions";

const CLAIM_SEARCHER_CONTRIBUTION_KEY = "claim.Searcher";

const styles = (theme) => ({
  statusChip: {
    height: 24,
    fontSize: 11,
    fontWeight: 600,
    borderRadius: 12,
  },
  statusRed: { backgroundColor: "#fde4e1", color: "#801a00" },
  statusBlue: { backgroundColor: "#e3f2fd", color: "#004A7C" },
  statusGreen: { backgroundColor: "#dff3e6", color: "#176b3a" },
  statusTeal: { backgroundColor: "#DEF1EE", color: "#004A7C" },
  statusPurple: { backgroundColor: "#ede7f6", color: "#4527a0" },
  statusAmber: { backgroundColor: "#fff4d6", color: "#8a5a00" },
  statusGray: { backgroundColor: "#eceff1", color: "#455a64" },
  titleWithToggle: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    flexWrap: "wrap",
  },
  toggleLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: theme.palette.primary.main,
  },
});

class ClaimSearcher extends Component {
  state = {
    random: null,
    attachmentsClaim: null,
    showOptionalColumns: false,
  };

  constructor(props) {
    super(props);
    this.rowsPerPageOptions = props.modulesManager.getConf(
      "fe-claim",
      "claimFilter.rowsPerPageOptions",
      [10, 20, 50, 100],
    );
    this.defaultPageSize = props.modulesManager.getConf("fe-claim", "claimFilter.defaultPageSize", 10);
    this.highlightAmount = parseInt(props.modulesManager.getConf("fe-claim", "claimFilter.highlightAmount", 0));
    this.highlightAltInsurees = props.modulesManager.getConf("fe-claim", "claimFilter.highlightAltInsurees", true);
    this.claimAttachments = props.modulesManager.getConf("fe-claim", "claimAttachments", true);
    this.extFields = props.modulesManager.getConf("fe-claim", "extFields", []);
    this.showOrdinalNumber = props.modulesManager.getConf("fe-claim", "claimForm.showOrdinalNumber", false);
    this.showPreAuthorization = props.modulesManager.getConf("fe-claim", "showPreAuthorization", false);
  }

  canSelectAll = (selection) =>
    this.props.claims.map((s) => s.id).filter((s) => !selection.map((s) => s.id).includes(s)).length;

  fetch = (prms) => {
    this.props.fetchClaimSummaries(this.props.modulesManager, prms, !!this.claimAttachments);
  };

  rowIdentifier = (r) => r.uuid;

  forcedFilters() {
    return !this.props.forcedFilters ? [] : [...this.props.forcedFilters.filter((f) => f.id !== "random")];
  }

  filtersToQueryParams = (state) => {
    let prms = Object.keys(state.filters)
      .filter((f) => !!state.filters[f]["filter"])
      .map((f) => state.filters[f]["filter"]);
    let forced = this.forcedFilters();

    forced.push({
      id: "isNormalClaim",
      filter: 'isNormalClaim: true',
    });
    
    let random = state.filters["random"];
    if (forced.length > 0) {
      prms.push(...forced.map((f) => f.filter));
    }
    if (!!random) {
      prms.push(`first: ${random.value}`);
      prms.push(`orderBy: ["dateClaimed", "?"]`);
      this.setState({ random });
    } else {
      prms.push(`orderBy: ["${state.orderBy}"]`);
      this.setState({ random: null });
    }
    if (!forced.length && !random) {
      if (!state.beforeCursor && !state.afterCursor) {
        prms.push(`first: ${state.pageSize}`);
      }
      if (!!state.afterCursor) {
        prms.push(`after: "${state.afterCursor}"`);
        prms.push(`first: ${state.pageSize}`);
      }
      if (!!state.beforeCursor) {
        prms.push(`before: "${state.beforeCursor}"`);
        prms.push(`last: ${state.pageSize}`);
      }
    }
    return prms;
  };

  _toggleOptionalColumns = (event) => {
    this.setState({ showOptionalColumns: event.target.checked });
  };

  _tableTitle = (count) => {
    const { intl, classes } = this.props;
    return (
      <div className={classes.titleWithToggle}>
        <span>{formatMessageWithValues(intl, "claim", "claimSummaries", { count })}</span>
        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              checked={this.state.showOptionalColumns}
              onChange={this._toggleOptionalColumns}
            />
          }
          label={formatMessage(intl, "claim", "claimSummaries.showAllColumns")}
          classes={{ label: classes.toggleLabel }}
        />
      </div>
    );
  };

  headers = () => {
    const result = ["claimSummaries.code"];
    if (this.state.showOptionalColumns) result.push("claimSummaries.preAuthcode");
    result.push(
      "claimSummaries.healthFacility",
      "claimSummaries.insuree",
      "claimSummaries.prescriber",
      "claimSummaries.claimedDate",
    );
    if (this.state.showOptionalColumns) result.push("claimSummaries.processedDateShort");
    result.push(
      "claimSummaries.feedbackStatusShort",
      "claimSummaries.reviewStatusShort",
      "claimSummaries.claimedAmount",
      "claimSummaries.approvedAmount",
      "claimSummaries.claimStatusShort",
    );
    if (this.state.showOptionalColumns) result.push("claim.claimSummaries.pre-authorization");
    if (this.state.showOptionalColumns) result.push("claimSummaries.claimAttachments");
    if (!!this.extFields && !!this.extFields.length) {
      this.extFields.forEach((f) => result.push(`claimSummaries.${f}`));
    }
    result.push("");
    return result;
  };

  sorts = () => {
    const result = [];
    if (this.showOrdinalNumber) result.push(null);
    result.push(["code", true]);
    if (this.state.showOptionalColumns) result.push(null);
    result.push(
      [this.props.modulesManager.getRef("location.HealthFacilityPicker.sort"), true],
      [this.props.modulesManager.getRef("insuree.InsureePicker.sort"), true],
      null,
      ["dateClaimed", true],
    );
    if (this.state.showOptionalColumns) result.push(["dateProcessed", true]);
    result.push(null, null, ["claimed", false], ["approved", false], null);
    if (this.state.showOptionalColumns) result.push(null);
    if (this.state.showOptionalColumns) result.push(null);
    if (!!this.extFields && !!this.extFields.length) this.extFields.forEach(() => result.push(null));
    result.push(null);
    return result;
  };

  aligns = () => {
    const result = [];
    if (this.showOrdinalNumber) result.push(null);
    result.push(null);
    if (this.state.showOptionalColumns) result.push(null);
    result.push(null, null, null, null);
    if (this.state.showOptionalColumns) result.push(null);
    result.push(null, null, "right", "right", null);
    if (this.state.showOptionalColumns) result.push(null);
    if (this.state.showOptionalColumns) result.push(null);
    if (!!this.extFields && !!this.extFields.length) this.extFields.forEach(() => result.push(null));
    result.push(null);
    return result;
  };

  _statusLabel = (group, value) => {
    if (group === "feedbackStatus" && value === 1) {
      return formatMessage(this.props.intl, "claim", "feedbackStatus.toDo");
    }
    if (group === "reviewStatus" && value === 1) {
      return formatMessage(this.props.intl, "claim", "reviewStatus.toCheck");
    }
    return formatMessage(this.props.intl, "claim", `${group}.${value}`);
  };

  statusChip = (group, value) => {
    const { classes } = this.props;
    let color = "statusTeal";
    if (group === "claimStatus") {
      color = { 1: "statusRed", 2: "statusBlue", 4: "statusGreen", 8: "statusTeal", 16: "statusPurple" }[value] || "statusGray";
    } else {
      color = { 1: "statusAmber", 2: "statusBlue", 4: "statusGreen", 8: "statusGreen", 16: "statusGray" }[value] || "statusGray";
    }
    return (
      <Chip
        size="small"
        className={`${classes.statusChip} ${classes[color]}`}
        label={this._statusLabel(group, value)}
      />
    );
  };

  feedbackColFormatter = (c) =>
    !!this.props.feedbackColFormatter
      ? this.props.feedbackColFormatter(c)
      : this.statusChip("feedbackStatus", c.feedbackStatus);

  reviewColFormatter = (c) =>
    !!this.props.reviewColFormatter
      ? this.props.reviewColFormatter(c)
      : this.statusChip("reviewStatus", c.reviewStatus);

  claimStatusColFormatter = (c) => this.statusChip("claimStatus", c.status);

  itemFormatters = () => {
    const { intl, modulesManager } = this.props;
    const result = [(c) => <Typography noWrap title={c.code}>{c.code}</Typography>];
    if (this.state.showOptionalColumns) {
      result.push((c) => <Typography noWrap title={c?.codePreAuthorization}>{c?.codePreAuthorization}</Typography>);
    }
    result.push(
      (c) => {
        const label = c.healthFacility?.name || c.healthFacility?.code || "";
        return <Typography noWrap title={label}>{label}</Typography>;
      },
      (c) => {
        const label = [c.insuree?.lastName, c.insuree?.otherNames].filter(Boolean).join(" ") || c.insuree?.chfId || "";
        return <Typography noWrap title={label}>{label}</Typography>;
      },
      (c) => {
        const label = [c.prescriber?.code, c.prescriber?.lastName, c.prescriber?.otherNames].filter(Boolean).join(" ");
        return <Typography noWrap title={label}>{label}</Typography>;
      },
      (c) => formatDateFromISO(modulesManager, intl, c.dateClaimed),
    );
    if (this.state.showOptionalColumns) {
      result.push((c) => formatDateFromISO(modulesManager, intl, c.dateProcessed));
    }
    result.push(
      (c) => this.feedbackColFormatter(c),
      (c) => this.reviewColFormatter(c),
      (c) => formatAmount(modulesManager, intl, c.claimed),
      (c) => formatAmount(modulesManager, intl, c.approved),
      (c) => this.claimStatusColFormatter(c),
    );
    if (this.state.showOptionalColumns) {
      result.push((c) => (c.preAuthorization ? <CheckIcon /> : ""));
    }
    if (this.state.showOptionalColumns) {
      result.push(
        (c) =>
          !!c.attachmentsCount && (
            <IconButton onClick={(e) => this.setState({ attachmentsClaim: c })}>
              <Badge badgeContent={c.attachmentsCount ?? 0} color="primary">
                <AttachIcon />
              </Badge>
            </IconButton>
          ),
      );
    }
    if (!!this.extFields && !!this.extFields.length) {
      this.extFields.forEach((f) => {
        result.push((c) => (!!c.jsonExt ? String(_.get(JSON.parse(c.jsonExt), f, "-")) : ""));
      });
    }
    result.push((c) => (
      <Tooltip title={formatMessage(intl, "claim", "openNewTabButton.tooltip")}>
        <IconButton onClick={(e) => this.props.onDoubleClick(c, true)}>
          {" "}
          <TabIcon />
        </IconButton>
      </Tooltip>
    ));
    return result;
  };

  rowLocked = (selection, claim) => !!claim.clientMutationId;

  rowHighlighted = (selection, claim) => !!this.highlightAmount && claim.claimed > this.highlightAmount;

  rowHighlightedAlt = (selection, claim) =>
    !!this.highlightAltInsurees &&
    selection.filter((c) => _.isEqual(c.insuree, claim.insuree)).length &&
    !selection.includes(claim);

  isRestoredClaim = (claim) => claim?.restoreId;

  showRestored = (showRestored) => {
    this.setState({ showRestored });
  };

  isClaimNotRestored = (_, claim) => this.state.showRestored && !claim?.restoreId;

  render() {
    const {
      intl,
      claims,
      claimsPageInfo,
      fetchingClaims,
      fetchedClaims,
      errorClaims,
      FilterExt,
      filterPaneContributionsKey,
      actions,
      defaultFilters,
      cacheFiltersKey,
      onDoubleClick,
      actionsContributionKey,
    } = this.props;

    let count = !!this.state.random && this.state.random.value;
    if (!count) {
      count = (claimsPageInfo?.totalCount || 0).toLocaleString();
    }

    return (
      <Fragment>
        <PublishedComponent
          pubRef="claim.AttachmentsDialog"
          readOnly={true}
          claim={this.state.attachmentsClaim}
          close={(e) => this.setState({ attachmentsClaim: null })}
        />
        <Searcher
          module="claim"
          canSelectAll={this.canSelectAll}
          defaultFilters={defaultFilters}
          cacheFiltersKey={cacheFiltersKey}
          FilterPane={ClaimFilter}
          FilterExt={FilterExt}
          filterPaneContributionsKey={filterPaneContributionsKey}
          items={claims}
          itemsPageInfo={claimsPageInfo}
          fetchingItems={fetchingClaims}
          fetchedItems={fetchedClaims}
          errorItems={errorClaims}
          contributionKey={CLAIM_SEARCHER_CONTRIBUTION_KEY}
          tableTitle={this._tableTitle(count)}
          rowsPerPageOptions={this.rowsPerPageOptions}
          defaultPageSize={this.defaultPageSize}
          fetch={this.fetch}
          rowIdentifier={this.rowIdentifier}
          filtersToQueryParams={this.filtersToQueryParams}
          defaultOrderBy="-dateClaimed"
          rowLocked={this.rowLocked}
          rowHighlighted={this.rowHighlighted}
          rowHighlightedAlt={this.rowHighlightedAlt}
          rowSecondaryHighlighted={this.isRestoredClaim}
          withSelection="multiple"
          selectionMessage={"claimSummaries.selection.count"}
          headers={this.headers}
          itemFormatters={this.itemFormatters}
          actions={actions}
          aligns={this.aligns}
          sorts={this.sorts}
          onDoubleClick={onDoubleClick}
          actionsContributionKey={actionsContributionKey}
          showOrdinalNumber={this.showOrdinalNumber}
        />
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  claims: state.claim.claims,
  claimsPageInfo: state.claim.claimsPageInfo,
  fetchingClaims: state.claim.fetchingClaims,
  fetchedClaims: state.claim.fetchedClaims,
  errorClaims: state.claim.errorClaims,
  servicesPricelists: !!state.medical_pricelist ? state.medical_pricelist.servicesPricelists : {},
  itemsPricelists: !!state.medical_pricelist ? state.medical_pricelist.itemsPricelists : {},
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchClaimSummaries }, dispatch);
};

export default withModulesManager(
  connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(ClaimSearcher)))),
);
