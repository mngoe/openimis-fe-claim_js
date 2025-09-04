import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { formatMessageWithValues, withModulesManager, withHistory, historyPush } from "@openimis/fe-core";
import { createOrUpdateSpeciality } from "../actions";
import { RIGHT_ADD, RIGHT_UPDATE } from "../constants";
import SpecialityForm from "../components/SpecialityForm";

const styles = (theme) => ({
  page: theme.page,
});

class SpecialityEditPage extends Component {
  add = () => {
    historyPush(this.props.modulesManager, this.props.history, "claim.route.specialityEdit");
  };

  save = (speciality) => {
    this.props.createOrUpdateSpeciality(
      speciality,
      formatMessageWithValues(
        this.props.intl,
        "claim",
        !speciality.uuid ? "CreateSpeciality.mutationLabel" : "UpdateSpeciality.mutationLabel",
        { code: speciality.code || speciality.speciality },
      ),
    );
  };

  render() {
    const { modulesManager, history, classes, rights, speciality_uuid } = this.props;
    return (
      <div className={classes.page}>
        <SpecialityForm
          speciality_uuid={speciality_uuid}
          back={(e) => historyPush(modulesManager, history, "claim.route.specialities")}
          add={rights.includes(RIGHT_ADD) ? this.add : null}
          save={rights.includes(RIGHT_UPDATE) ? this.save : null}
        />

      </div>
    );
  }
}

const mapStateToProps = (state, props) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  speciality_uuid: props.match.params.speciality_uuid,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ createOrUpdateSpeciality }, dispatch);
};

export default withHistory(
  withModulesManager(
    connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(SpecialityEditPage)))),
  ),
);