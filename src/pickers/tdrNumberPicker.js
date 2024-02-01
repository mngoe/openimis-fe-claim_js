import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";

import { CLAIM_TDR } from "../constants";

class TdrNumberPicker extends Component {
    render(){
        return <ConstantBasedPicker module="claim" label="claimTdrNumber" constants={CLAIM_TDR} {...this.props} />;
    }
}

export default TdrNumberPicker;