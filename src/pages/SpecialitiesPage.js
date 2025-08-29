// SpecialitiesPage.js
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Fab } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { withHistory, historyPush, formatMessage, Helmet, clearCurrentPaginationPage } from "@openimis/fe-core";
import SpecialitiesSearcher from "../components/SpecialitiesSearcher";
import { RIGHT_ADD, MODULE_NAME } from "../constants";

const styles = (theme) => ({
  page: theme.page,
  fab: theme.fab,
});

class SpecialitiesPage extends Component {
  onAdd = () => {
    historyPush(this.props.modulesManager, this.props.history, "medical.route.specialityEdit");
  };

  onDoubleClick = (speciality) => {
    historyPush(this.props.modulesManager, this.props.history, "medical.route.specialityEdit", [speciality.uuid]);
  };

  componentDidMount = () => {
    const { module } = this.props;
    if (module !== MODULE_NAME) this.props.clearCurrentPaginationPage();
  };

  render() {
    const { classes, rights } = this.props;
    return (
      <div className={classes.page}>
        <Helmet title={formatMessage(this.props.intl, "medical", "specialities.page.title")} />
        <SpecialitiesSearcher onDoubleClick={this.onDoubleClick} />
        {rights.includes(RIGHT_ADD) && (
          <div className={classes.fab}>
            <Fab color="primary" onClick={this.onAdd}>
              <AddIcon />
            </Fab>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  module: state.core?.savedPagination?.module,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ clearCurrentPaginationPage }, dispatch);

export default injectIntl(
  withTheme(withStyles(styles)(withHistory(connect(mapStateToProps, mapDispatchToProps)(SpecialitiesPage)))),
);