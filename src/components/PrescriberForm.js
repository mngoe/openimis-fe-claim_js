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
} from "@openimis/fe-core";
import { fetchPrescriber, clearPrescriber } from "../actions";
import PrescriberMasterPanel from "../components/PrescriberMasterPanel";

const PRESCRIBER_FORM_CONTRIBUTION_KEY = "claim.Prescriber";

const styles = (theme) => ({
  lockedPage: theme.page.locked,
});

class PrescriberForm extends Component {
  state = {
    lockNew: false,
    reset: 0,
    update: 0,
    prescriber_uuid: null,
    prescriber: this._newPrescriber(),
    newPrescriber: true,
    isSaved: false,
  };

  _newPrescriber() {
    return {
      code: "",
      lastName: "",
      otherNames: "",
      region: null,
      district: null,
      mainHealthFacility: null,
      nin: "",
      status: null,
      speciality: null,
      entryDate:"",
      releaseDate: ""
    };
  }

  componentDidMount() {
    if (this.props.prescriber_uuid) {
      this.setState((state, props) => ({ prescriber_uuid: props.prescriber_uuid }));
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      prevProps.fetchedPrescriber !== this.props.fetchedPrescriber &&
      !!this.props.fetchedPrescriber &&
      !!this.props.prescriber
    ) {
      this.setState((state, props) => ({
        prescriber: props.prescriber,
        prescriber_uuid: props.prescriber.uuid,
        lockNew: false,
        newPrescriber: false,
      }));
    } else if (prevState.prescriber_uuid !== this.state.prescriber_uuid) {
      this.props.fetchPrescriber(this.state.prescriber_uuid);
    } else if (prevProps.prescriber_uuid && !this.props.prescriber_uuid) {
      this.setState({ prescriber: this._newPrescriber(), lockNew: false, prescriber_uuid: null });
    } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState((state) => ({ reset: state.reset + 1 }));
    }
  }

  componentWillUnmount() {
    this.props.clearPrescriber();
  }

  _add = () => {
    this.setState(
      (state) => ({
        prescriber: this._newPrescriber(),
        lockNew: false,
        newPrescriber: true,
        reset: state.reset + 1,
      }),
      (e) => {
        this.props.add();
        this.forceUpdate();
      },
    );
  };

  onEditedChanged = (prescriber) => {
    this.setState({ prescriber, newPrescriber: false });
  };

  canSave = () => {
    return true;
  };

  reload = () => {
    this.setState({
      lockNew: false,
      reset: 0,
      update: 0,
      prescriber_uuid: null,
      prescriber: this._newPrescriber(),
      newPrescriber: true,
      isSaved: false,
    });
  };

  _save = (prescriber) => {
    this.setState({ lockNew: !prescriber.uuid, isSaved: true }, (e) => this.props.save(prescriber));
  };

  render() {
    const { fetchingPrescriber, fetchedPrescriber, errorPrescriber, add, save, back, classes } = this.props;
    const { prescriber_uuid, lockNew, prescriber, newPrescriber, reset, update, isSaved } = this.state;
    let readOnly = lockNew || !!prescriber.validityTo || isSaved;

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
          title={formatMessageWithValues(this.props.intl, "claim", "prescriber.edit.page.title", {
            lastName: this.state.prescriber.lastName,
            code: this.state.prescriber.code,
            otherNames: this.state.prescriber.code,
          })}
        />
        <ProgressOrError progress={fetchingPrescriber} error={errorPrescriber} />
        {(!!fetchedPrescriber || !prescriber_uuid) && (
          <Fragment>
            <Form
              module="claim"
              edited_id={prescriber_uuid}
              edited={prescriber}
              reset={reset}
              update={update}
              title="prescriber.edit.title"
              titleParams={{ name: prescriber.lastName }}
              back={back}
              add={!!add && !newPrescriber ? this._add : null}
              save={!!save ? this._save : null}
              canSave={this.canSave}
              readOnly={readOnly}
              HeadPanel={PrescriberMasterPanel}
              onEditedChanged={this.onEditedChanged}
              actions={actions}
              contributedPanelsKey={PRESCRIBER_FORM_CONTRIBUTION_KEY}
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
  prescriber: state.claim.prescriber,
  fetchingPrescriber: state.claim.fetchingPrescriber,
  fetchedPrescriber: state.claim.fetchedPrescriber,
  errorPrescriber: state.claim.errorPrescriber,
  submittingMutation: state.claim.submittingMutation,
  mutation: state.claim.mutation,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchPrescriber, clearPrescriber, journalize }, dispatch);
};

export default withHistory(
  withModulesManager(
    connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(PrescriberForm)))),
  ),
);