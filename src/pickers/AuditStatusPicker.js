import React, { Component } from "react";
import { SelectInput, formatMessage } from "@openimis/fe-core";
import { injectIntl } from "react-intl";

import {
  AUDIT_STATUS_ADOPTED,
  AUDIT_STATUS_REHABILITED,
  AUDIT_STATUS_REJECTED,
  STATUS_REJECTED,
} from "../constants";

class AuditStatusPicker extends Component {
  render() {
    const { claimStatus, intl, ...props } = this.props;
    const isRejectedClaimStatus = claimStatus === STATUS_REJECTED;
    const options = [
      { 
        value: AUDIT_STATUS_REJECTED,
        label: formatMessage(intl, "claim", `auditStatus.${AUDIT_STATUS_REJECTED}`)
      }
    ];

    if(!isRejectedClaimStatus) {
      options.push({
        value: AUDIT_STATUS_ADOPTED,
        label: formatMessage(intl, "claim", `auditStatus.${AUDIT_STATUS_ADOPTED}`)
      });
    } else {
      options.push({
        value: AUDIT_STATUS_REHABILITED,
        label: formatMessage(intl, "claim", `auditStatus.${AUDIT_STATUS_REHABILITED}`)
      });
    }

    return <SelectInput module="claim" label="auditStatus" withNull={false} options={options} {...props} />;
  }
}

export default injectIntl(AuditStatusPicker);;