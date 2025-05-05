import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";

import { REJECTION_CODE } from "../constants";

class RejectionCodePicker extends Component {
    render(){
        return <ConstantBasedPicker module="claim" label="rejectionCode" constants={REJECTION_CODE} {...this.props}/>;
    }
}

export default RejectionCodePicker;