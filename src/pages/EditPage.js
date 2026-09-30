import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { formatMessageWithValues, withModulesManager, withHistory, historyPush } from "@openimis/fe-core";
import ClaimForm from "../components/ClaimForm";
import { createClaim, updateClaim } from "../actions";
import { selectClaimRights } from "../helpers/rights";
import { DEFAULT, RIGHT_ADD, RIGHT_LOAD } from "../constants";

const styles = (theme) => ({
  page: theme.page,
});

class EditPage extends Component {
  constructor(props) {
    super(props);
    this.autoGenerateClaimCode = props.modulesManager.getConf(
      "fe-claim",
      "claimForm.autoGenerateClaimCode",
      DEFAULT.AUTOGENERATE_CLAIM_CODE,
    );
  }

  add = () => {
    historyPush(this.props.modulesManager, this.props.history, "claim.route.claimEdit");
  };

  save = async (claim) => {

    this.claimPrefix = this.props.modulesManager.getConf(
      "fe-claim",
      "claimPrex",
      0,
    );
    if(this.claimPrefix==1){
      claim.code = claim.insuree.chfId + claim.code
    }
    if (!claim.uuid) {
      this.props.createClaim(
        this.props.modulesManager,
        claim,
        formatMessageWithValues(this.props.intl, "claim", "CreateClaim.mutationLabel", {
          code: this.autoGenerateClaimCode && !claim?.restore?.uuid ? "Auto" : claim.code,
        }),
      );
    } else {
      this.props.updateClaim(
        this.props.modulesManager,
        claim,
        formatMessageWithValues(this.props.intl, "claim", "UpdateClaim.mutationLabel", { code: claim.code }),
      );
    }
  };

  render() {
    const { classes, modulesManager, history, rights, claim_uuid, path } = this.props;
    if (!rights.includes(RIGHT_LOAD)) return null;

    const isHealthFacilityPage = () => {
      return path.split("/").includes("healthFacilities");
    };

    return (
      <div className={classes.page}>
        <ClaimForm
          claim_uuid={claim_uuid}
          back={(e) => historyPush(modulesManager, history, "claim.route.healthFacilities")}
          add={rights.includes(RIGHT_ADD) ? this.add : null}
          save={rights.includes(RIGHT_LOAD) ? this.save : null}
          isHealthFacilityPage={isHealthFacilityPage()}
        />
      </div>
    );
  }
}

const mapStateToProps = (state, props) => ({
  // the global bag alone would lock out a claim administrator: their rights are granted
  // by the CLAIM_ADMIN link they hold on the health facility being worked under
  rights: selectClaimRights(state),
  claim_uuid: props.match.params.claim_uuid,
  path: props.match.path,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ createClaim, updateClaim }, dispatch);
};

export default withHistory(
  withModulesManager(connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(EditPage))))),
);
