import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Typography,
  TableContainer,
  Paper,
  CircularProgress,
  Box,
  withTheme,
  withStyles,
} from "@material-ui/core";
import { ExpandMore as ExpandMoreIcon } from "@material-ui/icons";
import { useModulesManager, useTranslations, Table, formatDateFromISO } from "@openimis/fe-core";
import { fetchClaimHistory } from "../actions";

const styles = (theme) => ({
  panel: {
    margin: theme.spacing(0),
    '&:before': {
      display: 'none',
    },
  },
  panelSummary: {
    backgroundColor: theme.paper.header.backgroundColor,
    color: theme.palette.primary.main,
    minHeight: '36px !important',
    '&$expanded': {
      minHeight: '36px !important',
    },
  },
  panelExpandIcon: {
    color: theme.palette.primary.main,
  },
  panelSummaryContent: {
    margin: 0,
    '&$expanded': {
      margin: 0,
    },
  },
  expanded: {},
  panelTitle: {
    fontSize: '1.25rem',
    fontWeight: 500,
  },
  tableContainer: {
    width: '100%',
    boxShadow: 'none',
    backgroundColor: theme.paper.body.backgroundColor,
    padding: theme.spacing(0),
  },
  tableHeader: {
    backgroundColor: theme.palette.grey[300],
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    color: theme.palette.primary.main,
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: theme.spacing(2),
    width: '100%',
  },
});

const ClaimHistoryPanel = ({ claim, claimUuid, onViewVersion, classes }) => {
  const dispatch = useDispatch();
  const { history, fetchingHistory, errorHistory } = useSelector((state) => state.claim);
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues, formatDateFromISO, formatAmount } = useTranslations("claim", modulesManager);
  const [expanded, setExpanded] = React.useState(false);

  useEffect(() => {
    dispatch(fetchClaimHistory(claimUuid));
  }, [claimUuid, dispatch]);

  const handleChange = (event, isExpanded) => {
    setExpanded(isExpanded);
  };
  
  const headers = [
    "claimHistory.code",
    "claimHistory.dateClaimed",
    "claimHistory.dateProcessed",
    "claimHistory.feedbackStatus",
    "claimHistory.reviewStatus",
    "claimHistory.claimed",
    "claimHistory.approved",
    "claimHistory.status",
    "claimHistory.restoreId",
  ];

  const itemFormatters = [
    (claim) => claim.code || '—',
    (claim) => formatDateFromISO(claim.dateClaimed) || '—',
    (claim) => formatDateFromISO(claim.dateProcessed) || '—',
    (claim) => claim.feedbackStatus || '—',
    (claim) => claim.reviewStatus || '—',
    (claim) => claim.claimed ? formatAmount(claim.claimed) : '—',
    (claim) => claim.approved ? formatAmount(claim.approved) : '—',
    (claim) => claim.status || '—',
    (claim) => claim.restoreId || '—'
  ];

  return (
    <Paper className={classes.paper}>
      <ExpansionPanel 
        expanded={expanded} 
        onChange={handleChange}
      >
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon className={classes.panelExpandIcon} />}
          classes={{
            root: classes.panelSummary,
            content: classes.panelSummaryContent,
            expanded: classes.expanded,
          }}
        >
          <Typography className={classes.panelTitle}>
            {formatMessageWithValues("ClaimHistoryModal.title", { code: claim?.code || '' })}
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.panelsDetails}>
          {fetchingHistory ? (
            <Box className={classes.loadingContainer}>
              <CircularProgress />
            </Box>
          ) : errorHistory ? (
            <Box color="error.main" p={2} width="100%">
              {errorHistory}
            </Box>
          ) : (
            <TableContainer component={Paper} className={classes.tableContainer}>
              <Table
                module="claim"
                headers={headers}
                itemFormatters={itemFormatters}
                items={history || []}
                withPagination={false}
                withPaper={false}
                sort={null}
                onDoubleClick={onViewVersion}
                rowStyle={(item, index) => ({
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }
                })}
              />
            </TableContainer>
          )}
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </Paper>
  );
};

export default withTheme(withStyles(styles)(ClaimHistoryPanel));
