import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";

import { CLAIM_STATUS_FILTER } from "../constants";

class PreAuthFilterPicker extends Component{
    render(){
        return <ConstantBasedPicker module="claim" label="preAuth.status" constants={CLAIM_STATUS_FILTER} {...this.props} />;
    }
}
export default PreAuthFilterPicker;