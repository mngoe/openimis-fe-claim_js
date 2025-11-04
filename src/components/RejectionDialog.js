import React, { Component } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  TextField,
  Divider,
} from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl, FormattedMessage } from "react-intl";
import { withModulesManager, formatMessage } from "@openimis/fe-core";
import CloseIcon from "@material-ui/icons/Close";

const styles = (theme) => ({
  dialogTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: 600,
    padding: theme.spacing(2),
  },
  dialogContent: {
    padding: theme.spacing(3),
    minHeight: "150px",
  },
  actions: {
    justifyContent: "flex-end",
    padding: theme.spacing(2),
  },
});

class RejectionDialog extends Component {
  state = {
    rejection_value: "",
  };

  componentDidMount() {
    console.log("RejectionDialog mounted, claim:", this.props.claim);
  }

  componentDidUpdate(prevProps) {
    console.log("RejectionDialog updated, claim:", this.props.claim);
    // Reset the rejection value when dialog is opened
    if (!prevProps.claim && this.props.claim) {
      console.log("Dialog opening with claim:", this.props.claim);
      this.setState({ rejection_value: "" });
    }
  }

  handleChange = (event) => {
    this.setState({ rejection_value: event.target.value });
  };

  handleClose = () => {
    this.setState({ rejection_value: "" });
    if (this.props.close) {
      this.props.close();
    }
  };

  handleSubmit = () => {
    const { claim, onSubmit } = this.props;
    const { rejection_value } = this.state;

    console.log("Rejection submitted for claim:", claim?.uuid, "reason:", rejection_value);
    
    // Call the submission handler if provided
    if (onSubmit) {
      onSubmit(claim, rejection_value);
    }

    // Close the dialog
    this.handleClose();
  };

  render() {
    const { classes, intl, claim } = this.props;
    const { rejection_value } = this.state;

    // Similar pattern to AttachmentsDialog - check if claim exists to show dialog
    if (!claim) return null;

    return (
      <Dialog 
        open={!!claim} 
        fullWidth 
        maxWidth="sm" 
        onClose={this.handleClose}
      >
        <DialogTitle className={classes.dialogTitle}>
          <FormattedMessage 
            module="claim" 
            id="rejectionDialog.title" 
            defaultMessage="Rejet de la demande" 
          />
          <IconButton onClick={this.handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent className={classes.dialogContent}>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            label={formatMessage(intl, "claim", "rejectionDialog.rejectionReason")}
            placeholder={formatMessage(intl, "claim", "rejectionDialog.placeholder")}
            value={rejection_value}
            onChange={this.handleChange}
            autoFocus
          />
        </DialogContent>

        <DialogActions className={classes.actions}>
          <Button onClick={this.handleClose} color="default" variant="outlined">
            <FormattedMessage module="claim" id="rejectionDialog.cancel" defaultMessage="Annuler" />
          </Button>
          <Button 
            onClick={this.handleSubmit} 
            color="primary" 
            variant="contained"
            disabled={!rejection_value.trim()}
          >
            <FormattedMessage module="claim" id="rejectionDialog.submit" defaultMessage="Rejeter" />
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withModulesManager(
  injectIntl(withTheme(withStyles(styles)(RejectionDialog)))
);