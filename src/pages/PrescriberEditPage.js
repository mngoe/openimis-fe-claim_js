import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { formatMessageWithValues, withModulesManager, withHistory, historyPush } from "@openimis/fe-core";
import { createOrUpdatePrescriber } from "../actions";
import { RIGHT_ADD, RIGHT_UPDATE } from "../constants";
import PrescriberForm from "../components/PrescriberForm";

const styles = (theme) => ({
  page: theme.page,
});

class PrescriberEditPage extends Component {
  add = () => {
    historyPush(this.props.modulesManager, this.props.history, "claim.route.prescriberEdit");
  };

  save = (prescriber) => {
    this.props.createOrUpdatePrescriber(
      prescriber,
      formatMessageWithValues(
        this.props.intl,
        "claim",
        !prescriber.uuid ? "CreatePrescriber.mutationLabel" : "UpdatePrescriber.mutationLabel",
        { code: prescriber.code || prescriber.uuid },
      ),
    );
  };

  render() {
    const { modulesManager, history, classes, rights, prescriber_uuid } = this.props;
    return (
      <div className={classes.page}>
        <PrescriberForm
          prescriber_uuid={prescriber_uuid}
          back={(e) => historyPush(modulesManager, history, "claim.route.prescribers")}
          add={rights.includes(RIGHT_ADD) ? this.add : null}
          save={rights.includes(RIGHT_UPDATE) ? this.save : null}
        />

      </div>
    );
  }
}

const mapStateToProps = (state, props) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  prescriber_uuid: props.match.params.prescriber_uuid,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ createOrUpdatePrescriber }, dispatch);
};

export default withHistory(
  withModulesManager(
    connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(PrescriberEditPage)))),
  ),
);