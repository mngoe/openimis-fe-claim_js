import React, { Component, Fragment } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import _ from "lodash";
import DeleteIcon from "@material-ui/icons/Delete";
import {
  withModulesManager,
  formatMessage,
  formatMessageWithValues,
  formatDateFromISO,
  journalize,
  coreConfirm,
  Searcher,
} from "@openimis/fe-core";
import { fetchPrescribers, deleteSPrescriber, deletePrescriber } from "../actions";
import { IconButton } from "@material-ui/core";
import { RIGHT_DELETE } from "../constants";
import PrescriberFilter from "./PrescriberFilter";

class PrescribersSearcher extends Component {
  state = { reset: 0, confirmedAction: null };

  constructor(props) {
    super(props);
    this.rowsPerPageOptions = props.modulesManager.getConf(
      "fe-medical",
      "specialityFilter.rowsPerPageOptions",
      [10, 20, 50, 100],
    );
    this.defaultPageSize = props.modulesManager.getConf("fe-medical", "specialityFilter.defaultPageSize", 10);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.submittingMutation && !this.props.submittingMutation) {
        this.props.journalize(this.props.mutation);  
        this.props.fetchPrescribers();
        console.log("Re-fetching specialities after mutation"); 
    }
    
    if (
      prevProps.confirmed !== this.props.confirmed &&
      !!this.props.confirmed &&
      !!this.state.confirmedAction
    ) {
        console.log("Confirmed action execution");
      this.state.confirmedAction();
      this.setState({ confirmedAction: null }); // Reset après exécution
    }
  }

  rowIdentifier = (r) => r.uuid;

  headers = () => {
    let headers = [
      "prescriber.code",
      "prescriber.nin",
      "prescriber.lastName",
      "prescriber.otherNames",
      "prescriber.speciality",
      "prescriber.status",
      "prescriber.mainHealthFacility",
      "prescriber.phone",
      "prescriber.entryDate",
      "prescriber.releaseDate",
    ];
    if (this.props.rights.includes(RIGHT_DELETE)) {
      headers.push(null);
    }
    return headers;
  };

  sorts = () => [
    ["code", true],
    ["nin", true],
    ["last_name", true],
    ["other_names", true],
    ["speciality", false],
    ["status", false],
    ["main_health_facility", false],
    ["phone", false],
    ["entry_date", true],
    ["release_date", true],
  ];

  itemFormatters = () => {
    let formatters = [
      (prescriber) => prescriber.code,
      (prescriber) => prescriber.nin,
      (prescriber) => prescriber.lastName,
      (prescriber) => prescriber.otherNames,
      (prescriber) => prescriber.speciality.code+" "+prescriber.speciality.speciality,
      (prescriber) => prescriber.status.status,
      (prescriber) => prescriber.mainHealthFacility.code+" "+prescriber.mainHealthFacility.name,
      (prescriber) => prescriber.phone,
      (prescriber) => prescriber.entryDate,
      (prescriber) => prescriber.releaseDate,
    ];
    if (this.props.rights.includes(RIGHT_DELETE)) {
      formatters.push((prescriber) =>
        prescriber.validityTo ? null : (
          <IconButton  onClick={(e) => this.onDelete(prescriber)}>
            <DeleteIcon />
          </IconButton>
        ),
      );
    }
    return formatters;
  };

//   rowDisabled = (selection, speciality) => speciality.clientMutationId;

  onDelete = (prescriber) => {
    let confirm = (e) =>
      this.props.coreConfirm(
        formatMessage(this.props.intl, "medical", "deleteSpeciality.confirm.title"),
        formatMessageWithValues(this.props.intl, "medical", "deletePrescriber.confirm.message", {
          code: speciality.code,
          speciality: speciality.speciality,
        }),
      );
    let confirmedAction = () =>
      this.props.deletePrescriber(
        prescriber,
        formatMessageWithValues(this.props.intl, "medical", "DeleteSpeciality.mutationLabel", {
          code: speciality.code,
        }),
      );
    this.setState({ confirmedAction }, confirm);
  };

//   rowLocked = (selection, speciality) => speciality.clientMutationId;

  render() {
    const {
      intl,
      prescribers,
      prescribersPageInfo,
      fetchingPrescribers,
      fetchedPrescribers,
      errorPrescribers,
      onDoubleClick,
    } = this.props;
    let count = this.props.prescribersPageInfo?.totalCount || this.props.prescribers?.length || 0; // Correction ici
    return (
      <Fragment>
        <Searcher
          module="claim"
          rowsPerPageOptions={this.rowsPerPageOptions}
          defaultPageSize={this.defaultPageSize}
          fetch={this.props.fetchPrescribers}
          reset={this.state.reset}
          cacheFiltersKey="claimPrescribersSearcher"
          items={prescribers}
          rowIdentifier={this.rowIdentifier}
          rowLocked={this.rowLocked}
          itemsPageInfo={prescribersPageInfo}
          fetchingItems={fetchingPrescribers}
          fetchedItems={fetchedPrescribers}
          errorItems={errorPrescribers}
          FilterPane={PrescriberFilter}
          tableTitle={formatMessageWithValues(intl, "medical", "specialities", { count })}
          headers={this.headers}
          itemFormatters={this.itemFormatters}
          rowDisabled={this.rowDisabled}
          sorts={this.sorts}
          onDoubleClick={onDoubleClick}
        />
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => {
    return {
      rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
      submittingMutation: state.claim?.submittingMutation || false,
      mutation: state.claim?.mutation || null,
      confirmed: state.core?.confirmed || false,
      prescribers: state.claim?.prescribers || [],
      prescribersPageInfo: state.claim?.prescribersPageInfo || {},
      fetchingPrescribers: state.claim?.fetchingPrescribers || false,
      fetchedPrescribers: state.claim?.fetchedPrescribers || false,
      errorPrescribers: state.claim?.errorPrescribers || null,
    };
  };

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchPrescribers, deletePrescriber, coreConfirm, journalize }, dispatch);
};

export default withModulesManager(injectIntl(connect(mapStateToProps, mapDispatchToProps)(PrescribersSearcher)));