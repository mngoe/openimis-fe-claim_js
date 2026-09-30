import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import { Fab, Tooltip } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import _ from "lodash";
import AddIcon from "@material-ui/icons/Add";
import * as Sentry from "@sentry/react";
import {
  withHistory,
  historyPush,
  withModulesManager,
  formatMessage,
  formatMessageWithValues,
  journalize,
  coreConfirm,
  Helmet,
  clearCurrentPaginationPage,
  PublishedComponent,
  hasAnyPermsInRange,
  hasPerms,
  hasPermsAnywhere,
  hasUserLinkType,
} from "@openimis/fe-core";
import ClaimSearcher from "../components/ClaimSearcher";
import { submit, del, selectHealthFacility, submitAll, selectClaimAdmin } from "../actions";
import {
  RIGHT_ADD,
  RIGHT_LOAD,
  RIGHT_SUBMIT,
  RIGHT_DELETE,
  MODULE_NAME,
  ROLE_REJECT,
  UBA_LINK_TYPE_CLAIM_ADMIN,
} from "../constants";
import { claimAdminAccessRequirements } from "../helpers/rights";

const CLAIM_HF_FILTER_CONTRIBUTION_KEY = "claim.HealthFacilitiesFilter";
const CLAIM_SEARCHER_ACTION_CONTRIBUTION_KEY = "claim.SelectionAction";

const styles = (theme) => ({
  page: theme.page,
  fab: theme.fab,
});

class HealthFacilitiesPage extends Component {
  constructor(props) {
    super(props);
    let defaultFilters = props.modulesManager.getConf("fe-claim", "healthFacilities.defaultFilters", {
      "claimStatus": {
        "value": 2,
        "filter": "status: 2",
      },
    });
    this.canSubmitClaimWithZero = props.modulesManager.getConf("fe-claim", "canSubmitClaimWithZero", false);
    this.state = {
      defaultFilters,
      confirmedAction: null,
      showRejectReasonDialog: false,
      rejectedClaimsSelected: []
    };
  }

  /**
   * Is the user a claim administrator, i.e. does a UserBusinessAccess link grant them the
   * CLAIM_ADMIN credential on a health facility ? That link is what the backend derives
   * the claim admin record from, so it - and no longer the name of a role, nor the
   * standard claim administrator role being attached - is the condition.
   *
   * This answers "who is this user", not "may they do it": holding the credential grants
   * nothing by itself, the rights below are what decide.
   */
  isClaimAdmin = () => hasUserLinkType(this.props.user, UBA_LINK_TYPE_CLAIM_ADMIN);

  /**
   * Does the user hold `perms` globally, or on the health facility being looked at - the
   * ones they are claim admin of when none is selected ? The business map opens the UBA
   * path (`helpers/rights.js`): the right sitting in the user's UBA bag and a CLAIM_ADMIN
   * link existing on that facility, without ever granting anything the rights do not.
   */
  canOnHealthFacility = (perms) =>
    hasPerms(perms, {
      rights: this.props.rights,
      accessRequirements: claimAdminAccessRequirements(this.props.user, this.props.claimHealthFacility),
    });

  componentDidMount = () => {
    const { module, user, claimAdmin, claimHealthFacility } = this.props;
    if (module !== MODULE_NAME) this.props.clearCurrentPaginationPage();
    
    if (this.isClaimAdmin() && !!user?.claim_admin) {
      // the claim admin record and its health facility are derived by the backend from
      // the CLAIM_ADMIN links, they only have to be on the current user payload
      this.props.selectClaimAdmin(user.claim_admin);
      this.props.selectHealthFacility(user.claim_admin?.healthFacility);
    }

    Sentry.captureMessage("Claim admin check", {
      level: "info",
      extra: {
        isClaimAdmin: this.isClaimAdmin(),
        user_admin_uuid: user?.claim_admin?.uuid,
        user_admin_code: user?.claim_admin?.code,
        user_admin: user?.claim_admin,
        user_business_accesses: user?.business_accesses,
        claimAdmin: claimAdmin,
        claimHealthFacility: claimHealthFacility,
      },
    });
  };

  componentWillUnmount = () => {
    const { location, history } = this.props;
    const {
      location: { pathname },
    } = history;
    const urlPath = location.pathname;
    if (!pathname.includes(urlPath)) this.props.clearCurrentPaginationPage();
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState({ reset: this.state.reset + 1 });
    } else if (!prevProps.confirmed && this.props.confirmed) {
      this.state.confirmedAction();
    }
  }

  canSubmitSelected = (selection) =>
    !!selection &&
    selection.length &&
    selection.filter((s) => s.status === 2 && (!!this.canSubmitClaimWithZero || s.claimed > 0)).length ===
      selection.length;

  canSubmitAll = (selection) => !selection || selection.length == 0;

  submitSelected = (selection) => {
    if (selection.length === 1) {
      this.props.submit(
        selection,
        formatMessageWithValues(this.props.intl, "claim", "SubmitClaim.mutationLabel", { code: selection[0].code }),
      );
    } else {
      this.props.submit(
        selection,
        formatMessageWithValues(this.props.intl, "claim", "SubmitClaims.mutationLabel", { count: selection.length }),
        selection.map((c) => c.code),
      );
    }
  };

  submitAll = (selection) => {
    let filters = this.props.selectedFilters;
    if (selection.length === 0) {
      this.props.submitAll(
        filters,
        formatMessageWithValues(this.props.intl, "claim", "SubmitAllClaims.mutationLabel", { "claims": "All" }),
      );
    }
  };

  canDeleteSelected = (selection) =>
    !!selection && selection.length && selection.filter((s) => s.status === 2).length === selection.length;

  deleteSelected = (selection) => {
    let confirm = null;
    let confirmedAction = null;
    if (selection.length === 1) {
      confirmedAction = () =>
        this.props.del(
          selection,
          formatMessageWithValues(this.props.intl, "claim", "DeleteClaim.mutationLabel", { code: selection[0].code }),
        );
      confirm = (e) =>
        this.props.coreConfirm(
          formatMessage(this.props.intl, "claim", "deleteClaim.confirm.title"),
          formatMessageWithValues(this.props.intl, "claim", "deleteClaim.confirm.message", {
            code: selection[0].code,
          }),
        );
    } else {
      confirmedAction = () =>
        this.props.del(
          selection,
          formatMessageWithValues(this.props.intl, "claim", "DeleteClaims.mutationLabel", { count: selection.length }),
          selection.map((c) => c.code),
        );
      confirm = (e) =>
        this.props.coreConfirm(
          formatMessage(this.props.intl, "claim", "deleteClaims.confirm.title"),
          formatMessageWithValues(this.props.intl, "claim", "deleteClaims.confirm.message", {
            count: selection.length,
          }),
        );
    }

    this.setState({ confirmedAction }, confirm);
  };

  canRejectSelected = (selection) =>
    !!selection && selection.length && selection.filter((s) => s.status === 2).length === selection.length;

  rejectSelected = (selection) => {
    this.setState({ showRejectReasonDialog: true, rejectedClaimsSelected: selection });
  }

  onDoubleClick = (c, newTab = false) => {
    historyPush(this.props.modulesManager, this.props.history, "claim.route.claimEdit", [c.uuid], newTab);
  };

  onAdd = () => {
    // the claim is created under the claim admin picked in the filter
    historyPush(this.props.modulesManager, this.props.history, "claim.route.claimEdit");
  };

  // a claim is created under a claim admin, hence on their health facility: both must be
  // picked, and the user must hold RIGHT_ADD there - globally, or in the UBA bag through
  // a CLAIM_ADMIN link on that facility
  canAdd = () =>
    !!this.props.claimAdmin && !!this.props.claimHealthFacility && this.canOnHealthFacility(RIGHT_ADD);

  render() {
    const { intl, classes, rights, generatingPrint, userRoles } = this.props;
    const { showRejectReasonDialog, rejectedClaimsSelected } = this.state;
    // navigation level gate: a user holding those rights only where they are linked must
    // still reach the page, the actions below being checked one by one
    if (!hasAnyPermsInRange(RIGHT_ADD, RIGHT_SUBMIT, { rights, anywhere: true })) return null;
    let actions = [];
    if (this.canOnHealthFacility(RIGHT_SUBMIT)) {
      actions.push({ label: "claimSummaries.submitAll", enabled: this.canSubmitAll, action: this.submitAll });
      actions.push({
        label: "claimSummaries.submitSelected",
        enabled: this.canSubmitSelected,
        action: this.submitSelected,
      });
    }
    if (this.canOnHealthFacility(RIGHT_DELETE)) {
      actions.push({
        label: "claimSummaries.deleteSelected",
        enabled: this.canDeleteSelected,
        action: this.deleteSelected,
      });
    }
    if(!!userRoles && userRoles.length > 0){
      for (let i = 0; i < userRoles.length; i++) {
        if (userRoles[i].name == ROLE_REJECT) {
          actions.push({
            label: "claimSummaries.rejectSelected",
            enabled: this.canRejectSelected,
            action: this.rejectSelected,
          });
        }
      }
    }
    return (
      <div className={classes.page}>
        <Helmet title={formatMessage(this.props.intl, "location", "location.healthFacilities.page.title")} />
        <PublishedComponent
          pubRef="claim.RejectionReasonDialog"
          close={(e) => this.setState({ rejectedClaimsSelected: null, showRejectReasonDialog: false })}
          open={showRejectReasonDialog}
          rejectedClaims={rejectedClaimsSelected}
        />
        <ClaimSearcher
          defaultFilters={this.state.defaultFilters}
          cacheFiltersKey="claimHealthFacilitiesPageFiltersCache"
          onDoubleClick={this.canOnHealthFacility(RIGHT_LOAD) ? this.onDoubleClick : null}
          actions={actions}
          processing={generatingPrint}
          filterPaneContributionsKey={CLAIM_HF_FILTER_CONTRIBUTION_KEY}
          actionsContributionKey={CLAIM_SEARCHER_ACTION_CONTRIBUTION_KEY}
        />
        {!generatingPrint && hasPermsAnywhere(RIGHT_ADD, { rights }) && (
          <Tooltip
            title={
              !this.canAdd()
                ? formatMessage(intl, "claim", "newClaim.adminAndHFRequired")
                : formatMessage(intl, "claim", "newClaim.tooltip")
            }
          >
            <div className={classes.fab}>
              <Fab color="primary" disabled={!this.canAdd()} onClick={this.onAdd}>
                <AddIcon />
              </Fab>
            </div>
          </Tooltip>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  claimAdmin: state.claim.claimAdmin,
  claimHealthFacility: state.claim.claimHealthFacility,
  userHealthFacilityFullPath: !!state.loc ? state.loc.userHealthFacilityFullPath : null,
  submittingMutation: state.claim.submittingMutation,
  mutation: state.claim.mutation,
  confirmed: state.core.confirmed,
  filtersCache: state.core.filtersCache,
  selectedFilters: state.core.filtersCache.claimHealthFacilitiesPageFiltersCache,
  module: state.core?.savedPagination?.module,
  user: state.core.user,
  userRoles: state.core.user?.i_user?.roles,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      selectHealthFacility,
      selectClaimAdmin,
      journalize,
      coreConfirm,
      submit,
      submitAll,
      del,
      clearCurrentPaginationPage,
    },
    dispatch,
  );
};

export default injectIntl(
  withModulesManager(
    withHistory(connect(mapStateToProps, mapDispatchToProps)(withTheme(withStyles(styles)(HealthFacilitiesPage)))),
  ),
);
