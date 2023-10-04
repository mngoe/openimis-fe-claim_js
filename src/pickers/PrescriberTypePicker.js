import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";
import { PRESCRIBER_TYPE } from "../constants";

class PrescriberTypePicker extends Component {
  render() {
    return <ConstantBasedPicker module="claim" label="prescribertype" constants={PRESCRIBER_TYPE} {...this.props} />;
  }
}

export default PrescriberTypePicker;
