import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { formatMessage, SelectInput, withModulesManager } from "@openimis/fe-core";
import { fetchPrescriberStatus } from "../actions";
import _debounce from "lodash/debounce";
import _ from "lodash";

class StatusPicker extends Component {
  componentDidMount() {
    if (!this.props.status || this.props.status.length==0) {
      setTimeout(() => {
        !this.props.fetching && !this.props.fetched && this.props.fetchPrescriberStatus();
      }, 0);
    }
  }

  onSuggestionSelected = (v) => this.props.onChange(v);

  render() {
    const {
      intl,
      status,
      module = "claim",
      withLabel = true,
      label = "prescriberStatusPicker.label",
      withPlaceholder = false,
      placeholder,
      value,
      reset,
      readOnly = false,
      required = false,
      withNull = true,
    } = this.props;
    
    const options = !!status ? 
      status.map((v) => ({
        value: v.code, 
        label: v.status,
        status: v
      })) : [];
    
    return (
      <SelectInput
        module={module}
        options={options}
        label={!!withLabel ? label : null}
        placeholder={
          !!withPlaceholder ? placeholder || formatMessage(intl, "claim", "prescriberStatusPicker.placeholder") : null
        }
        onChange={this.onSuggestionSelected}
        value={value}
        reset={reset}
        readOnly={readOnly}
        required={required}
        withNull={withNull}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  status: state.claim.status,
  fetching: state.claim.fetchingPrescriberStatus,
  fetched: state.claim.fetchedPrescriberStatus
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchPrescriberStatus }, dispatch);
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(withModulesManager(StatusPicker)));
