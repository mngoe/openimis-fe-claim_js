import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";

import { AUDITED_FILTER_STATUS } from "../constants";

class AuditedStatusPicker extends Component {
  render() {
    return <ConstantBasedPicker module="claim" label="auditedStatus" constants={AUDITED_FILTER_STATUS} {...this.props} />;
  }
}

export default AuditedStatusPicker;
