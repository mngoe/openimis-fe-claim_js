import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { Keyboard, ScreenShare, Assignment } from "@material-ui/icons";
import { formatMessage, MainMenuContribution, withModulesManager } from "@openimis/fe-core";
import { RIGHT_ADD, RIGHT_SUBMIT, RIGHT_CLAIMREVIEW, RIGHT_PROCESS } from "../constants";
const CLAIM_MAIN_MENU_CONTRIBUTION_KEY = "claim.MainMenu";
const ADMIN_MAIN_MENU_CONTRIBUTION_KEY = "admin.MainMenu";

class ClaimMainMenu extends Component {
  render() {
    const { rights } = this.props;
    let claimEntries = [];
    let adminEntries = [];

    // Claim entries
    if (!!rights.filter((r) => r >= RIGHT_ADD && r <= RIGHT_SUBMIT).length) {
      claimEntries.push({
        text: formatMessage(this.props.intl, "claim", "menu.healthFacilityClaims"),
        icon: <Keyboard />,
        route: "/claim/healthFacilities",
      });
    }
    if (!!rights.filter((r) => r >= RIGHT_CLAIMREVIEW && r <= RIGHT_PROCESS).length) {
      claimEntries.push({
        text: formatMessage(this.props.intl, "claim", "menu.reviews"),
        icon: <Assignment />,
        route: "/claim/reviews",
      });
    }
    claimEntries.push(
      ...this.props.modulesManager
        .getContribs(CLAIM_MAIN_MENU_CONTRIBUTION_KEY)
        .filter((c) => !c.filter || c.filter(rights)),
    );

    // Admin entries (specialities & prescribers)
    if (!!rights.filter((r) => r >= RIGHT_CLAIMREVIEW && r <= RIGHT_PROCESS).length) {
      adminEntries.push({
        text: formatMessage(this.props.intl, "claim", "menu.specialities"),
        icon: <Assignment />,
        route: "/claim/specialities",
      });
      adminEntries.push({
        text: formatMessage(this.props.intl, "claim", "menu.prescribers"),
        icon: <Assignment />,
        route: "/claim/prescribers",
      });
    }

    return (
      <>
        {!!claimEntries.length && (
          <MainMenuContribution
            {...this.props}
            header={formatMessage(this.props.intl, "claim", "mainMenu")}
            icon={<ScreenShare />}
            entries={claimEntries}
          />
        )}

        {!!adminEntries.length && (
          <MainMenuContribution
            {...this.props}
            contributionKey={ADMIN_MAIN_MENU_CONTRIBUTION_KEY}
            header={formatMessage(this.props.intl, "admin", "mainMenu")}
            icon={<Assignment />}
            entries={adminEntries}
          />
        )}
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});
export default withModulesManager(injectIntl(connect(mapStateToProps)(ClaimMainMenu)));
