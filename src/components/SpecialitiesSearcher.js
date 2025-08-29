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
import SpecialityFilter from "./SpecialityFilter";
import { fetchSpecialities, deleteSpeciality } from "../actions";
import { IconButton } from "@material-ui/core";
import { RIGHT_DELETE } from "../constants";

class SpecialitiesSearcher extends Component {
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

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState((prevState) => ({ ...prevState, reset: prevState.reset + 1 }));
    } else if (prevProps.confirmed !== this.props.confirmed && !!this.props.confirmed && !!this.state.confirmedAction) {
      this.state.confirmedAction();
    }
  }

  rowIdentifier = (r) => r.uuid;

  headers = () => {
    let headers = [
      "speciality.code",
      "speciality.speciality",
      "speciality.validityFrom",
      "speciality.validityTo",
    ];
    if (this.props.rights.includes(RIGHT_DELETE)) {
      headers.push(null);
    }
    return headers;
  };

  sorts = () => [
    ["code", true],
    ["speciality", true],
    ["validityFrom", false],
    ["validityTo", false],
  ];

  itemFormatters = () => {
    let formatters = [
      (speciality) => speciality.code,
      (speciality) => speciality.speciality,
      (speciality) => formatDateFromISO(this.props.modulesManager, this.props.intl, speciality.validityFrom),
      (speciality) => formatDateFromISO(this.props.modulesManager, this.props.intl, speciality.validityTo),
    ];
    if (this.props.rights.includes(RIGHT_DELETE)) {
      formatters.push((speciality) =>
        speciality.validityTo ? null : (
          <IconButton  onClick={(e) => this.onDelete(speciality)}>
            <DeleteIcon />
          </IconButton>
        ),
      );
    }
    return formatters;
  };

//   rowDisabled = (selection, speciality) => speciality.clientMutationId;

  onDelete = (speciality) => {
    let confirm = (e) =>
      this.props.coreConfirm(
        formatMessage(this.props.intl, "medical", "deleteSpeciality.confirm.title"),
        formatMessageWithValues(this.props.intl, "medical", "deleteSpeciality.confirm.message", {
          code: speciality.code,
          speciality: speciality.speciality,
        }),
      );
    let confirmedAction = () =>
      this.props.deleteSpeciality(
        speciality,
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
      specialities,
      specialitiesPageInfo,
      fetchingSpecialities,
      fetchedSpecialities,
      errorSpecialities,
      onDoubleClick,
    } = this.props;
    let count = this.props.specialitiesPageInfo?.totalCount || this.props.specialities?.length || 0; // Correction ici
    return (
      <Fragment>
        <Searcher
          module="medical"
          rowsPerPageOptions={this.rowsPerPageOptions}
          defaultPageSize={this.defaultPageSize}
          fetch={this.props.fetchSpecialities}
          reset={this.state.reset}
          cacheFiltersKey="medicalSpecialitiesSearcher"
          items={specialities}
          rowIdentifier={this.rowIdentifier}
          rowLocked={this.rowLocked}
          itemsPageInfo={specialitiesPageInfo}
          fetchingItems={fetchingSpecialities}
          fetchedItems={fetchedSpecialities}
          errorItems={errorSpecialities}
          FilterPane={SpecialityFilter}
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
      specialities: state.claim?.specialities || [],
      specialitiesPageInfo: state.claim?.specialitiesPageInfo || {},
      fetchingSpecialities: state.claim?.fetchingSpecialities || false,
      fetchedSpecialities: state.claim?.fetchedSpecialities || false,
      errorSpecialities: state.claim?.errorSpecialities || null,
    };
  };

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchSpecialities, deleteSpeciality, coreConfirm, journalize }, dispatch);
};

export default withModulesManager(injectIntl(connect(mapStateToProps, mapDispatchToProps)(SpecialitiesSearcher)));