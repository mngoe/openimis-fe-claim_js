import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";

import { OTHER_TYPE } from "../constants";

class OtherTypePicker extends Component {
  render() {
    return <ConstantBasedPicker module="claim" label="othertype" constants={OTHER_TYPE} {...this.props} />;
  }
}

export default OtherTypePicker;
