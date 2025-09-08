import React, { Component, Fragment } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import ReplayIcon from "@material-ui/icons/Replay";
import { withTheme, withStyles } from "@material-ui/core/styles";

import {
  ProgressOrError,
  Form,
  withModulesManager,
  withHistory,
  journalize,
  formatMessageWithValues,
  Helmet,
  historyPush,
} from "@openimis/fe-core";
import { fetchSpeciality, clearSpeciality } from "../actions";
import SpecialityMasterPanel from "../components/SpecialityMasterPanel";

const SPECIALITY_FORM_CONTRIBUTION_KEY = "claim.Speciality";

const styles = (theme) => ({
  lockedPage: theme.page.locked,
});

class SpecialityForm extends Component {
  state = {
    lockNew: false,
    reset: 0,
    update: 0,
    speciality_uuid: null,
    speciality: this._newSpeciality(),
    newSpeciality: true,
    isSaved: false,
  };

  _newSpeciality() {
    return {
      code: "",
      speciality: "",
      altLanguage: "",
    };
  }

  componentDidMount() {
    if (this.props.speciality_uuid) {
      this.setState((state, props) => ({ speciality_uuid: props.speciality_uuid }));
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      prevProps.fetchedSpeciality !== this.props.fetchedSpeciality &&
      !!this.props.fetchedSpeciality &&
      !!this.props.speciality
    ) {
      this.setState((state, props) => ({
        speciality: props.speciality,
        speciality_uuid: props.speciality.uuid,
        lockNew: false,
        newSpeciality: false,
      }));
    } else if (prevState.speciality_uuid !== this.state.speciality_uuid) {
      this.props.fetchSpeciality(this.state.speciality_uuid);
    } else if (prevProps.speciality_uuid && !this.props.speciality_uuid) {
      this.setState({ speciality: this._newSpeciality(), lockNew: false, speciality_uuid: null });
    } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState((state) => ({ reset: state.reset + 1 }));
    }
  }

  componentWillUnmount() {
    this.props.clearSpeciality();
  }

  _add = () => {
    this.setState(
      (state) => ({
        speciality: this._newSpeciality(),
        lockNew: false,
        newSpeciality: true,
        reset: state.reset + 1,
      }),
      (e) => {
        this.props.add();
        this.forceUpdate();
      },
    );
  };

  onEditedChanged = (speciality) => {
    this.setState({ speciality, newSpeciality: false });
  };

  canSave = () => {
    if (this.state.isSaved) return false;
    if (!this.state.speciality.speciality) return false;
    if (this.state.speciality.speciality.length > 150) return false;
    if (this.state.speciality.code && this.state.speciality.code.length > 50) return false;
    if (this.state.speciality.altLanguage && this.state.speciality.altLanguage.length > 150) return false;
    return true;
  };

  reload = () => {
    this.setState({
      lockNew: false,
      reset: 0,
      update: 0,
      speciality_uuid: null,
      speciality: this._newSpeciality(),
      newSpeciality: true,
      isSaved: false,
    });
  };

  _save = (speciality) => {
    this.setState({ lockNew: !speciality.uuid, isSaved: true }, (e) => this.props.save(speciality));
  };

  render() {
    const { fetchingSpeciality, fetchedSpeciality, errorSpeciality, add, save, back, classes } = this.props;
    const { speciality_uuid, lockNew, speciality, newSpeciality, reset, update, isSaved } = this.state;
    let readOnly = lockNew || !!speciality.validityTo || isSaved;

    let actions = [
      {
        doIt: this.reload,
        icon: <ReplayIcon />,
        onlyIfDirty: !readOnly && !isSaved,
      },
    ];

    return (
      <div className={readOnly ? classes.lockedPage : null}>
        <Helmet
          title={formatMessageWithValues(this.props.intl, "claim", "speciality.edit.page.title", {
            name: this.state.speciality.speciality,
          })}
        />
        <ProgressOrError progress={fetchingSpeciality} error={errorSpeciality} />
        {(!!fetchedSpeciality || !speciality_uuid) && (
          <Fragment>
            <Form
              module="claim"
              edited_id={speciality_uuid}
              edited={speciality}
              reset={reset}
              update={update}
              title="speciality.edit.title"
              titleParams={{ name: speciality.speciality }}
              back={back}
              add={!!add && !newSpeciality ? this._add : null}
              save={!!save ? this._save : null}
              canSave={this.canSave}
              readOnly={readOnly}
              HeadPanel={SpecialityMasterPanel}
              onEditedChanged={this.onEditedChanged}
              actions={actions}
              contributedPanelsKey={SPECIALITY_FORM_CONTRIBUTION_KEY}
              openDirty={save}
            />
          </Fragment>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state, props) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  speciality: state.claim.speciality,
  fetchingSpeciality: state.claim.fetchingSpeciality,
  fetchedSpeciality: state.claim.fetchedSpeciality,
  errorSpeciality: state.claim.errorSpeciality,
  submittingMutation: state.claim.submittingMutation,
  mutation: state.claim.mutation,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchSpeciality, clearSpeciality, journalize }, dispatch);
};

export default withHistory(
  withModulesManager(
    connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(SpecialityForm)))),
  ),
);