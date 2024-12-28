import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";

import { FEEDBACK_SEX } from "../constants";

class FeedbackSexPicker extends Component {
  render() {
    return <ConstantBasedPicker module="claim" label="feedbackSex" constants={FEEDBACK_SEX} {...this.props} />;
  }
}

export default FeedbackSexPicker;
