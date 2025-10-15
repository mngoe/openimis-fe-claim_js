import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";

import { CLAIM_ACT_TYPE } from "../constants";

class ClaimActTypePicker extends Component {
  render() {
    return <ConstantBasedPicker module="claim" label="claimActType" constants={CLAIM_ACT_TYPE} {...this.props} />;
  }
}

export default ClaimActTypePicker;
