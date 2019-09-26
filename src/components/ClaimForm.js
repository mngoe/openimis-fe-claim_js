import React, { Component, Fragment } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
    ProgressOrError, Form, withModulesManager, withHistory, journalize, toISODate
} from "@openimis/fe-core";
import { fetchClaim, claimHealthFacilitySet } from "../actions";
import moment from "moment";
import _ from "lodash";

import ClaimMasterPanel from "./ClaimMasterPanel";
import ClaimChildPanel from "./ClaimChildPanel";
import ClaimFeedbackPanel from "./ClaimFeedbackPanel";

const styles = theme => ({
    paper: theme.paper.paper,
    paperHeader: theme.paper.header,
    paperHeaderAction: theme.paper.action,
    item: theme.paper.item,
});


class ClaimServicesPanel extends Component {
    render() {
        return <ClaimChildPanel {...this.props} type="service" picker="medical.ServicePicker" />
    }
}

class ClaimItemsPanel extends Component {
    render() {
        return <ClaimChildPanel {...this.props} type="item" picker="medical.ItemPicker" />
    }
}

class ClaimForm extends Component {

    state = {
        reset: 0,
        claim: this._newClaim(),
    }

    _setHealthFacility(claim) {
        if (this.props.userHealthFacilityFullPath) {
            let hf = { ...this.props.userHealthFacilityFullPath };
            delete (hf.location);
            claim.healthFacility = hf;
        };
        return claim;
    }

    _newClaim() {
        let claim = this._setHealthFacility({});
        claim.status = this.props.modulesManager.getConf("fe-claim", "newClaim.status", 2);
        claim.dateClaimed = toISODate(moment().toDate());
        claim.dateFrom = toISODate(moment().toDate());
        claim.visitType = this.props.modulesManager.getConf("fe-claim", "newClaim.visitType", 'O');
        return claim;
    }

    componentDidMount() {
        if (this.props.claim_id) {
            this.props.fetchClaim(this.props.modulesManager, this.props.claim_id, this.props.forFeedback);
        } else {
            this.setState({
                claim: this._newClaim(),
                dirty: false,
            });
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.fetchedClaim !== this.props.fetchedClaim && !!this.props.fetchedClaim) {
            this.setState({
                claim: this.props.claim,
            })
            this.props.claimHealthFacilitySet(this.props.claim.healthFacility);
        } else if (prevProps.claim_id && !this.props.claim_id) {
            this.setState({
                claim: this._newClaim(),
            });
        } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
            this.props.journalize(this.props.mutation);
            this.setState({
                reset: this.state.reset + 1,
                dirty: false
            });
        }
    }

    _add = () => {
        this.setState(
            {
                claim: this._newClaim(),
                dirty: false,
                reset: this.state.reset + 1,
            },
            e => {
                this.props.add();
                this.forceUpdate();
            }
        )
    }

    canSaveDetail = (d, type) => {
        if (!d[type]) return false;
        if (d.qtyProvided === null || d.qtyProvided === undefined || d.qtyProvided === "") return false;
        if (d.priceAsked === null || d.priceAsked === undefined || d.priceAsked === "") return false;
        return true;
    }

    canSave = (claim) => {
        if (!claim) return false;
        if (!claim.code) return false;
        if (!claim.healthFacility) return false;
        if (!claim.insuree) return false;
        if (!claim.dateClaimed) return false;
        if (!claim.dateFrom) return false;
        if (!claim.status) return false;
        if (!claim.icd) return false;
        if (!!claim.items) {
            let items = [...claim.items];
            if (!this.props.forReview) items.pop();
            if (items.length && items.filter(i => !this.canSaveDetail(i, 'item')).length) {
                return false;
            }
        }
        if (!!claim.services) {
            let services = [...claim.services];
            if (!this.props.forReview) services.pop();
            if (services.length && services.filter(s => !this.canSaveDetail(s, 'service')).length) {
                return false;
            }
        }
        return true;
    }

    reload = () => {
        this.props.fetchClaim(this.props.modulesManager, this.props.claim_id, this.props.forFeedback);
    }

    onEditedChanged = claim => {
        this.setState({ claim })
    }

    render() {
        const { claim_id, fetchingClaim, fetchedClaim, errorClaim, save, back, forReview = false, forFeedback = false } = this.props;
        return (
            <Fragment>
                <ProgressOrError progress={fetchingClaim} error={errorClaim} />
                {(!!fetchedClaim || !claim_id) && (
                    <Form
                        module="claim"
                        edited_id={claim_id}
                        edited={this.state.claim}
                        reset={this.state.reset}
                        title="edit.title"
                        titleParams={{ code: this.state.claim.code }}
                        back={back}
                        add={!!this.props.add ? this._add : null}
                        save={save}
                        canSave={this.canSave}
                        reload={claim_id && this.reload}
                        forReview={forReview}
                        forFeedback={forFeedback}
                        HeadPanel={ClaimMasterPanel}
                        Panels={!!forFeedback ?
                            [ClaimFeedbackPanel] :
                            [
                                ClaimServicesPanel,
                                ClaimItemsPanel
                            ]}
                        onEditedChanged={this.onEditedChanged}
                    />
                )}
            </Fragment>
        )
    }
}

const mapStateToProps = (state, props) => ({
    userHealthFacilityFullPath: !!state.loc ? state.loc.userHealthFacilityFullPath : null,
    claim: state.claim.claim,
    fetchingClaim: state.claim.fetchingClaim,
    fetchedClaim: state.claim.fetchedClaim,
    errorClaim: state.claim.errorClaim,
    submittingMutation: state.claim.submittingMutation,
    mutation: state.claim.mutation,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchClaim, claimHealthFacilitySet, journalize }, dispatch);
};

export default withHistory(withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
    injectIntl(withTheme(
        withStyles(styles)(ClaimForm)
    ))))
);