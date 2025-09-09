import React, { Component, Fragment } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import {
  Dialog,
  DialogTitle,
  Divider,
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
  coreAlert
} from "@openimis/fe-core";

const styles = (theme) => ({
  dialogTitle: theme.dialog.title,
  dialogContent: theme.dialog.content,
});

class RejectionReasonDialog extends Component {
  state = {
    open: false,
    reason: null
  }

  validate = (reason) => {

  }

  onClose = () => this.setState({ open: false, reason: null }, (e) => !!this.props.close && this.props.close());

  render() {
    const { classes, rejectedClaims, readOnly = false, open } = this.props;
    const { reset, reason } = this.state
    return (
      <Dialog
        open={open}
        fullWidth={false}
        PaperProps={{
          style: {
            width: "600px",
            maxWidth: "none",
            padding: "5px"
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
              rows={3}
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
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  submittingMutation: state.claim.submittingMutation,
  mutation: state.claim.mutation
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      coreConfirm,
      journalize,
      coreAlert,
    },
    dispatch,
  );
};

export default withModulesManager(
  connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(RejectionReasonDialog)))),
);