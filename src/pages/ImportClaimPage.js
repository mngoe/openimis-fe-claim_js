import React, { Component } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { connect, useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from 'react-intl';
import {
    Grid,
    Typography,
    Button,
    Divider,
    Input,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControlLabel,
} from "@material-ui/core";
import { formatMessageWithValues, FormattedMessage, formatDateFromISO, baseApiUrl, apiHeaders } from "@openimis/fe-core";
import { ProgressOrError, Table } from "@openimis/fe-core";

const styles = theme => ({
    page: theme.page,
  });
  
  let files = [];
  
  function handleChange(event) {
    files = Array.from(event.target.files);
  }
class ImportClaimPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            page: 0,
            pageSize: 20,
            count: 20,
            afterCursor: null,
            beforeCursor: null,
            uploadState: null,
            showModal: false,
            contentModal: "cmr_cs.currentlyImporting"
        }
        this.isMountedFlag = false;

    }

    query = () => {
        let prms = [];
        prms.push(`first: ${this.state.pageSize}`);
        if (!!this.state.afterCursor) {
            prms.push(`after: "${this.state.afterCursor}"`)
        }
        if (!!this.state.beforeCursor) {
            prms.push(`before: "${this.state.beforeCursor}"`)
        }
        prms.push(`orderBy: ["code"]`);
        this.props.fetchChequesImport(prms);
    }

    handleClose = () => {
        if (this.isMountedFlag) {
            this.setState({ showModal: false, uploadState: null });
        }
    }

    componentDidMount() {
        this.isMountedFlag = true;
        // this.query();
    }

    componentWillUnmount() {
        this.isMountedFlag = false;
    }

    //   query = () => {
    //     let prms = [];
    //     prms.push(`first: ${this.state.pageSize}`);
    //     if (!!this.state.afterCursor) {
    //       prms.push(`after: "${this.state.afterCursor}"`)
    //     }
    //     if (!!this.state.beforeCursor) {
    //       prms.push(`before: "${this.state.beforeCursor}"`)
    //     }
    //     prms.push(`orderBy: ["code"]`);
    //     this.props.fetchChequesImport(prms);
    //   }

    handleSubmit = (event) => {
        event.preventDefault();
        console.log('events ', event)
        this.setState({ showModal: true });
    }

    handleClose = () => {
        if (this.isMountedFlag) {
            this.setState({ showModal: false, uploadState: null });
        }
    }
    render() {
        const {
            intl,
            classes,
            onChangePage,
            onChangeRowsPerPage,
        } = this.props;

        let headers = [
            "claim.claimSummaries.code",
            "claim.claimSummaries.insuree",
            "claim.claimSummaries.claimedDate",
            "claim.claimSummaries.claimStatus",
        ]

        let itemFormatters = [
            e => e.code,
            e => e.insuree,
            e => e.claimDate,
            e => e.claimStatus,
        ]

        return (
            <div className={classes.page}>
                <ProgressOrError progress={false} error={null} />
                <h1>{formatMessageWithValues(intl, "claim", "claim.importClaims")}</h1>

                <Grid container spacing={2} direction="column">
                    <Grid item>
                        <Typography variant="h6">{formatMessageWithValues(intl, "claim", "menu.importClaim")}</Typography>
                    </Grid>
                    <Grid item>
                        <form onSubmit={(event) => this.handleSubmit(event)}>
                            <Grid container spacing={1} direction="column">
                                <Grid item>
                                    <Input
                                        required
                                        id="import-button"
                                        inputProps={{
                                            accept: ".xml, application/xml, text/xml",
                                            multiple: true
                                        }}
                                        type="file"
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        type="submit"
                                    >
                                        {formatMessageWithValues(intl, "CmrCS", "cmr_cs.uploadFile")}
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Grid>
                </Grid>
                <Dialog open={this.state.showModal} onClose={this.handleClose} >
                    <DialogTitle>{formatMessageWithValues(intl, "CmrCS", "cmr_cs.importCheckFile")}</DialogTitle>
                    <Divider />
                    <DialogContent>
                        {this.state.uploadState != null ?
                            <>
                                <DialogContentText>
                                    {formatMessageWithValues(intl, "CmrCS", this.state.contentModal)}
                                </DialogContentText>
                                {this.state.uploadState.map((cheque, index) => (
                                    <DialogContentText key={index}>
                                        Code: {cheque.chequeImportLineCode}, Date: {formatDateFromISO(this.props.modulesManager, intl, cheque.chequeImportLineDate)}, Status: {cheque.chequeImportLineStatus}
                                    </DialogContentText>
                                ))}
                            </>
                            :
                            <DialogContentText>
                                {formatMessageWithValues(intl, "CmrCS", this.state.contentModal)}
                            </DialogContentText>
                        }
                    </DialogContent>
                </Dialog>
                <hr />
                <Table
                    module="cmr_cs"
                    header={formatMessageWithValues(intl, "claim", "claim.tableImport",
                    { count: 0 })}
                    headers={headers}
                    itemFormatters={itemFormatters}
                    items={[]}
                    withPagination={true}
                    page={this.state.page}
                    pageSize={this.state.pageSize}
                    count={this.state.count}
                    onChangePage={onChangePage}
                    onChangeRowsPerPage={onChangeRowsPerPage}
                    rowsPerPageOptions={this.rowsPerPageOptions}
                />
            </div>
        )
    }
}
export default injectIntl(withTheme(withStyles(styles)(ImportClaimPage)));