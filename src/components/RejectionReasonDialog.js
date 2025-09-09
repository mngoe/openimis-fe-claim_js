import React, { Component, Fragment } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import {
  Dialog,
  DialogTitle,
  Button,
  DialogActions,
  DialogContent,
  Grid
} from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
  FormattedMessage,
  withModulesManager,
  TextInput,
  journalize,
  coreConfirm,
  coreAlert,
  formatMessage
} from "@openimis/fe-core";
import { reject } from "../actions"

const styles = (theme) => ({
  dialogTitle: theme.dialog.title,
  dialogContent: theme.dialog.content,
});

class RejectionReasonDialog extends Component {
  state = {
    open: false,
    reason: null
  }

  validate = () => {
    const { rejectedClaims } = this.props;
    var rejectReason = this.state.reason;
    this.setState(
      { open: false, reason: null }, 
      (e) => !!this.props.reject && this.props.reject(rejectedClaims, rejectReason, formatMessage(this.props.intl, "claim", "RejectClaim.mutationLabel"))
    );
    this.props.close();
  }

  onClose = () => this.setState({ open: false, reason: null }, (e) => !!this.props.close && this.props.close());

  render() {
    const { classes, readOnly = false, open } = this.props;
    const { reset, reason } = this.state
    return (
      <Dialog
        open={open}
        fullWidth={false}
        PaperProps={{
          style: {
            width: "600px",
            maxWidth: "none",
            paddingLeft: "10px",
            paddingRight: "10px"
          },
        }}
      >
        <DialogTitle className={classes.dialogTitle}>
          <FormattedMessage module="claim" id="rejectReason" />
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Grid item xs={12} className={classes.item}>
            <TextInput
              module="claim"
              value={reason}
              reset={reset}
              multiline
              rows={4}
              variant="outlined"
              onChange={(v) => this.setState({ reason: v })}
              readOnly={readOnly}
              required={true}
            />
          </Grid>
        </DialogContent>
        <Fragment>
          <DialogActions>
            <Button disabled={!reason || reason == ""} onClick={this.validate} variant="contained" color="primary">
              <FormattedMessage module="claim" id="validate" />
            </Button>
            <Button onClick={this.onClose}>
              <FormattedMessage module="claim" id="cancel" />
            </Button>
          </DialogActions>
        </Fragment>
      </Dialog>

    );
  }
}

const mapStateToProps = (state) => ({
  submittingMutation: state.claim.submittingMutation,
  mutation: state.claim.mutation
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      coreConfirm,
      journalize,
      coreAlert,
      reject
    },
    dispatch,
  );
};

export default withModulesManager(
  connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(RejectionReasonDialog)))),
);