import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { Keyboard, ScreenShare, Assignment } from "@material-ui/icons";
import { formatMessage, hasAnyPermsInRange, MainMenuContribution, withModulesManager } from "@openimis/fe-core";
import { RIGHT_ADD, RIGHT_SUBMIT, RIGHT_CLAIMREVIEW, RIGHT_PROCESS } from "../constants";
const CLAIM_MAIN_MENU_CONTRIBUTION_KEY = "claim.MainMenu";

class ClaimMainMenu extends Component {
  render() {
    const { rights } = this.props;
    let entries = [];
    // a menu entry is a navigation level gate: a user holding those rights only on the
    // facilities they are linked to (RoleRight.uba) must still reach the page, which then
    // checks each action against the facility at hand
    if (hasAnyPermsInRange(RIGHT_ADD, RIGHT_SUBMIT, { rights, anywhere: true })) {
      // RIGHT_SEARCH is shared by HF & HQ staff)
      entries.push({
        text: formatMessage(this.props.intl, "claim", "menu.healthFacilityClaims"),
        icon: <Keyboard />,
        route: "/claim/healthFacilities",
      });
    }
    if (hasAnyPermsInRange(RIGHT_CLAIMREVIEW, RIGHT_PROCESS, { rights, anywhere: true })) {
      entries.push({
        text: formatMessage(this.props.intl, "claim", "menu.reviews"),
        icon: <Assignment />,
        route: "/claim/reviews",
      });
    }
    // entries.push(
    //   ...this.props.modulesManager
    //     .getContribs(CLAIM_MAIN_MENU_CONTRIBUTION_KEY)
    //     .filter((c) => !c.filter || c.filter(rights)),
    // );
    if (!entries.length) return null;
    return (
      <MainMenuContribution
        {...this.props}
        header={formatMessage(this.props.intl, "claim", "mainMenu")}
        icon={<ScreenShare />}
        entries={entries}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});
export default withModulesManager(injectIntl(connect(mapStateToProps)(ClaimMainMenu)));
