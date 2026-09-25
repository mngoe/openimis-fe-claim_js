import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";

import { AUDIT_STATUS } from "../constants";

class AuditStatusPicker extends Component {
  render() {
    return <ConstantBasedPicker module="claim" withNull={false} label="auditStatus" constants={AUDIT_STATUS} {...this.props} />;
  }
}

export default AuditStatusPicker;