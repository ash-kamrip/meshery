// @ts-check
import React, { useState, useEffect, useRef, useContext } from "react";
import { withStyles, makeStyles, MuiThemeProvider } from "@material-ui/core/styles";
import { createTheme } from '@material-ui/core/styles';
import {
  NoSsr,
  TableCell,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Tooltip,
  Grid,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CardContent,
  Card,
  CardActions,
  AppBar,
  Toolbar,
  TextField,
  FormControl,
  Select,
  MenuItem,
  ButtonGroup
} from "@material-ui/core";
import { UnControlled as CodeMirror } from "react-codemirror2";
import DeleteIcon from "@material-ui/icons/Delete";
import SaveIcon from '@material-ui/icons/Save';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import UploadIcon from "@material-ui/icons/Publish";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import MUIDataTable from "mui-datatables";
import PromptComponent from "./PromptComponent";
import Moment from "react-moment";
import { withSnackbar } from "notistack";
import CloseIcon from "@material-ui/icons/Close";
import LockIcon from '@material-ui/icons/Lock';
import ExploreIcon from '@material-ui/icons/Explore';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import { updateProgress } from "../lib/store";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import dataFetch from "../lib/data-fetch";
import { CircularProgress } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import jsYaml from "js-yaml";
import ListAltIcon from '@material-ui/icons/ListAlt';
import URLUploader from "./URLUploader";
import { createPatternFromConfig,  getPatternServiceName } from "./MesheryMeshInterface/helpers";
import LazyPatternServiceForm, { getWorkloadTraitAndType } from "./MesheryMeshInterface/LazyPatternServiceForm";
import { trueRandom } from "../lib/trueRandom";
import { SchemaContext } from "../utils/context/schemaSet"
import { Autocomplete } from '@material-ui/lab';
import { groupWorkloadByVersion } from "../utils/workloadFilter"
import { AddCircle,  DirectionsCar, Filter, SimCard, SupervisedUserCircle } from "@material-ui/icons";
import PatternServiceForm from "./MesheryMeshInterface/PatternServiceForm";

const styles = (theme) => ({
  grid : {
    padding : theme.spacing(2),
  },
  tableHeader : {
    fontWeight : "bolder",
    fontSize : 18,
  },
  muiRow : {
    '& .MuiTableRow-root' : {
      cursor : 'pointer'
    }
  }
});

const useStyles = makeStyles((theme) => ({
  codeMirror : {
    '& .CodeMirror' : {
      minHeight : "300px",
      height : '60vh',
    }
  },
  backButton : {
    marginRight : theme.spacing(2),
  },
  appBar : {
    marginBottom : "16px",
    backgroundColor : "#fff",
    borderRadius : "8px"
  },
  yamlDialogTitle : {
    display : "flex",
    alignItems : "center"
  },
  yamlDialogTitleText : {
    flexGrow : 1
  },
  fullScreenCodeMirror : {
    height : '100%',
    '& .CodeMirror' : {
      minHeight : "300px",
      height : '100%',
    }
  },
  formCtrl : {
    width : "90px",
    minWidth : "90px",
    maxWidth : "90px",
    marginRight : 8,
  },
  autoComplete : {
    width : "120px",
    minWidth : "120px",
    maxWidth : 150,
    marginRight : "auto"
  },
  btngroup : {
    marginLeft : "auto"
  },
  // meshSelector: {
  //   flexGrow: 1
  // },
  // toolbar: {
  //   display: "flex"
  // }
}))

function CustomToolbar(onClick, urlOnClick) {
  return function Toolbar() {
    return (
      <>
        <label htmlFor="upload-button">
          <input type="file" accept=".yaml, .yml" hidden onChange={onClick} id="upload-button" name="upload-button" />
          <Tooltip title="Upload Pattern">
            <IconButton aria-label="Upload" component="span">
              <UploadIcon />
            </IconButton>
          </Tooltip>
        </label>
        <label htmlFor="url-upload-button">
          <URLUploader onSubmit={urlOnClick} />
        </label>
      </>
    );
  };
}

function TooltipIcon({ children, onClick, title }) {
  return (
    <Tooltip title={title} placement="top" arrow interactive >
      <IconButton onClick={onClick}>
        {children}
      </IconButton>
    </Tooltip>
  )
}

function YAMLEditor({ pattern, onClose, onSubmit }) {
  const classes = useStyles();
  const [yaml, setYaml] = useState("");
  const [fullScreen, setFullScreen] = useState(false);

  const toggleFullScreen = () => {
    setFullScreen(!fullScreen);
  }

  return (
    <Dialog onClose={onClose} aria-labelledby="pattern-dialog-title" open maxWidth="md" fullScreen={fullScreen} fullWidth={!fullScreen}>
      <DialogTitle disableTypography id="pattern-dialog-title" className={classes.yamlDialogTitle}>
        <Typography variant="h6" className={classes.yamlDialogTitleText}>
          {pattern.name}
        </Typography>
        <TooltipIcon
          title={fullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          onClick={toggleFullScreen}>
          {fullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
        </TooltipIcon>
        <TooltipIcon title="Exit" onClick={onClose}>
          <CloseIcon />
        </TooltipIcon>
      </DialogTitle>
      <Divider variant="fullWidth" light />
      <DialogContent>
        <CodeMirror
          value={pattern.pattern_file}
          className={fullScreen ? classes.fullScreenCodeMirror : ""}
          options={{
            theme : "material",
            lineNumbers : true,
            lineWrapping : true,
            gutters : ["CodeMirror-lint-markers"],
            lint : true,
            mode : "text/x-yaml",
          }}
          onChange={(_, data, val) => setYaml(val)}
        />
      </DialogContent>
      <Divider variant="fullWidth" light />
      <DialogActions>
        <Tooltip title="Update Pattern">
          <IconButton
            aria-label="Update"
            color="primary"
            onClick={() => onSubmit(yaml, pattern.id, pattern.name, "update")}
          >
            <SaveIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete Pattern">
          <IconButton
            aria-label="Delete"
            color="primary"
            onClick={() => onSubmit(yaml, pattern.id, pattern.name, "delete")}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
}

function resetSelectedPattern() {
  return { show : false, pattern : null }
}

function MesheryPatterns({
  updateProgress, enqueueSnackbar, closeSnackbar, user, classes
}) {
  const [page, setPage] = useState(0);
  const [search] = useState("");
  const [sortOrder] = useState("");
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const modalRef = useRef(null);
  const [patterns, setPatterns] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [selectedPattern, setSelectedPattern] = useState(resetSelectedPattern());

  const DEPLOY_URL = '/api/pattern/deploy';

  const getMuiTheme = () => createTheme({
    overrides : {
      MuiInput : {
        underline : {
          "&:hover:not(.Mui-disabled):before" : {
            borderBottom : "2px solid #222"
          },
          "&:after" : {
            borderBottom : "2px solid #222"
          }
        }
      },
      MUIDataTableSearch : {
        searchIcon : {
          color : "#607d8b",
          marginTop : "7px",
          marginRight : "8px",
        },
        clearIcon : {
          "&:hover" : {
            color : "#607d8b"
          }
        },
      },
      MUIDataTableToolbar : {
        iconActive : {
          color : "#222"
        },
        icon : {
          "&:hover" : {
            color : "#607d8b"
          }
        },
      }
    }
  })

  const ACTION_TYPES = {
    FETCH_PATTERNS : {
      name : "FETCH_PATTERNS",
      error_msg : "Failed to fetch patterns"
    },
    UPDATE_PATTERN : {
      name : "UPDATE_PATTERN",
      error_msg : "Failed to update pattern file"
    },
    DELETE_PATTERN : {
      name : "DELETE_PATTERN",
      error_msg : "Failed to delete pattern file"
    },
    DEPLOY_PATTERN : {
      name : "DEPLOY_PATTERN",
      error_msg : "Failed to deploy pattern file"
    },
    UPLOAD_PATTERN : {
      name : "UPLOAD_PATTERN",
      error_msg : "Failed to upload pattern file"
    },
  }

  const searchTimeout = useRef(null);
  /**
   * fetch patterns when the page loads
   */
  useEffect(() => {
    fetchPatterns(page, pageSize, search, sortOrder);
  }, []);

  const handleDeploy = (pattern_file) => {
    updateProgress({ showProgress : true })
    dataFetch(
      DEPLOY_URL,
      {
        credentials : "include",
        method : "POST",
        body : pattern_file,
      }, () => {
        console.log("PatternFile Deploy API", `/api/pattern/deploy`);
        updateProgress({ showProgress : false });
        enqueueSnackbar("Pattern Successfully Deployed!", {
          variant : "success",
          action : function Action(key) {
            return (
              <IconButton key="close" aria-label="Close" color="inherit" onClick={() => closeSnackbar(key)}>
                <CloseIcon />
              </IconButton>
            );
          },
          autoHideDuration : 2000,
        });
      },
      handleError(ACTION_TYPES.DEPLOY_PATTERN),
    )
  }

  function fetchPatterns(page, pageSize, search, sortOrder) {
    if (!search) search = "";
    if (!sortOrder) sortOrder = "";

    const query = `?page=${page}&page_size=${pageSize}&search=${encodeURIComponent(search)}&order=${encodeURIComponent(
      sortOrder
    )}`;

    updateProgress({ showProgress : true });

    dataFetch(
      `/api/pattern${query}`,
      { credentials : "include", },
      (result) => {
        console.log("PatternFile API", `/api/pattern${query}`);
        updateProgress({ showProgress : false });
        if (result) {
          setPatterns(result.patterns || []);
          setPage(result.page || 0);
          setPageSize(result.page_size || 0);
          setCount(result.total_count || 0);
        }
      },
      handleError(ACTION_TYPES.FETCH_PATTERNS)
    );
  }

  const handleError = (action) => (error) => {
    updateProgress({ showProgress : false });

    enqueueSnackbar(`${action.error_msg}: ${error}`, {
      variant : "error",
      action : function Action(key) {
        return (
          <IconButton key="close" aria-label="Close" color="inherit" onClick={() => closeSnackbar(key)}>
            <CloseIcon />
          </IconButton>
        );
      },
      autoHideDuration : 8000,
    });
  }

  function resetSelectedRowData() {
    return () => {
      setSelectedRowData(null);
    };
  }

  function handleSubmit(data, id, name, type) {
    updateProgress({ showProgress : true })
    if (type === "delete") {
      dataFetch(
        `/api/pattern/${id}`,
        {
          credentials : "include",
          method : "DELETE",
        },
        () => {
          console.log("PatternFile API", `/api/pattern/${id}`);
          updateProgress({ showProgress : false });
          fetchPatterns(page, pageSize, search, sortOrder);
          resetSelectedRowData()()
        },
        handleError(ACTION_TYPES.DELETE_PATTERN)
      );
    }

    if (type === "update") {
      dataFetch(
        `/api/pattern`,
        {
          credentials : "include",
          method : "POST",
          body : JSON.stringify({ pattern_data : { id, pattern_file : data }, save : true }),
        },
        () => {
          console.log("PatternFile API", `/api/pattern`);
          updateProgress({ showProgress : false });
          fetchPatterns(page, pageSize, search, sortOrder);
        },
        handleError(ACTION_TYPES.UPDATE_PATTERN)
      );
    }

    if (type === "upload" || type === "urlupload") {
      let body
      if (type === "upload") {
        body = JSON.stringify({ pattern_data : { pattern_file : data }, save : true })
      }
      if (type === "urlupload") {
        body = JSON.stringify({ url : data, save : true })
      }
      dataFetch(
        `/api/pattern`,
        {
          credentials : "include",
          method : "POST",
          body,
        },
        () => {
          console.log("PatternFile API", `/api/pattern`);
          updateProgress({ showProgress : false });
          fetchPatterns(page, pageSize, search, sortOrder);
        },
        handleError(ACTION_TYPES.UPLOAD_PATTERN)
      );
    }
  }

  function uploadHandler(ev) {
    if (!ev.target.files?.length) return;

    const file = ev.target.files[0];
    // Create a reader
    const reader = new FileReader();
    reader.addEventListener("load", (event) => {
      handleSubmit(
        event.target.result,
        "",
        file?.name || "meshery_" + Math.floor(trueRandom() * 100),
        "upload",
      );
    });
    reader.readAsText(file);
  }

  function urlUploadHandler(link) {
    handleSubmit(link, "", "meshery_" + Math.floor(trueRandom() * 100), "urlupload");
    // console.log(link, "valid");
  }
  const columns = [
    {
      name : "name",
      label : "Pattern Name",
      options : {
        filter : false,
        sort : true,
        searchable : true,
        customHeadRender : function CustomHead({ index, ...column }, sortColumn) {
          return (
            <TableCell key={index} onClick={() => sortColumn(index)}>
              <TableSortLabel active={column.sortDirection != null} direction={column.sortDirection || "asc"}>
                <b>{column.label}</b>
              </TableSortLabel>
            </TableCell>
          );
        },
      },
    },
    {
      name : "created_at",
      label : "Upload Timestamp",
      options : {
        filter : false,
        sort : true,
        searchable : true,
        customHeadRender : function CustomHead({ index, ...column }, sortColumn) {
          return (
            <TableCell key={index} onClick={() => sortColumn(index)}>
              <TableSortLabel active={column.sortDirection != null} direction={column.sortDirection || "asc"}>
                <b>{column.label}</b>
              </TableSortLabel>
            </TableCell>
          );
        },
        customBodyRender : function CustomBody(value) {
          return <Moment format="LLLL">{value}</Moment>;
        },
      },
    },
    {
      name : "updated_at",
      label : "Update Timestamp",
      options : {
        filter : false,
        sort : true,
        searchable : true,
        customHeadRender : function CustomHead({ index, ...column }, sortColumn) {
          return (
            <TableCell key={index} onClick={() => sortColumn(index)}>
              <TableSortLabel active={column.sortDirection != null} direction={column.sortDirection || "asc"}>
                <b>{column.label}</b>
              </TableSortLabel>
            </TableCell>
          );
        },
        customBodyRender : function CustomBody(value) {
          return <Moment format="LLLL">{value}</Moment>;
        },
      },
    },
    {
      name : "Actions",
      options : {
        filter : false,
        sort : false,
        searchable : false,
        customHeadRender : function CustomHead({ index, ...column }) {
          return (
            <TableCell key={index}>
              <b>{column.label}</b>
            </TableCell>
          );
        },
        customBodyRender : function CustomBody(_, tableMeta) {
          const rowData = patterns[tableMeta.rowIndex]
          return (
            <>
              <Tooltip title="Configure">
                <IconButton onClick={() => setSelectedPattern({ pattern : patterns[tableMeta.rowIndex], show : true })}>
                  <ListAltIcon />
                </IconButton>
              </Tooltip>
              <IconButton
                title="Deploy"
                onClick={() => handleDeploy(rowData.pattern_file)}
              >
                <PlayArrowIcon />
              </IconButton>
            </>
          );
        },
      },
    },
  ];

  columns.forEach((column, idx) => {
    if (column.name === sortOrder.split(" ")[0]) {
      columns[idx].options.sortDirection = sortOrder.split(" ")[1];
    }
  });

  async function showModal(count) {
    let response = await modalRef.current.show({
      title : `Delete ${count ? count : ""} Pattern${count > 1 ? "s" : ''}?`,

      subtitle : `Are you sure you want to delete ${count > 1 ? "these" : 'this'}  ${count ? count : ""}  pattern${count > 1 ? "s" : ''}?`,

      options : ["Yes", "No"],
    })
    return response;
  }

  function deletePattern(id) {
    dataFetch(
      `/api/pattern/${id}`,
      {
        method : "DELETE",
        credentials : "include",
      },
      () => {
        updateProgress({ showProgress : false });

        enqueueSnackbar("Pattern deleted.", {
          variant : "success",
          autoHideDuration : 2000,
          action : function Action(key) {
            return (
              <IconButton key="close" aria-label="Close" color="inherit" onClick={() => closeSnackbar(key)}>
                <CloseIcon />
              </IconButton>
            );
          },
        });
        fetchPatterns(page, pageSize, search, sortOrder);
      },
      handleError("Failed to delete pattern")
    );
  }

  const options = {
    filter : false,
    sort : !(user && user.user_id === "meshery"),
    search : !(user && user.user_id === "meshery"),
    filterType : "textField",
    responsive : "scrollFullHeight",
    resizableColumns : true,
    serverSide : true,
    count,
    rowsPerPage : pageSize,
    rowsPerPageOptions : [10, 20, 25],
    fixedHeader : true,
    page,
    print : false,
    download : false,
    customToolbar : CustomToolbar(uploadHandler, urlUploadHandler),

    onCellClick : (_, meta) => meta.colIndex !== 3 && setSelectedRowData(patterns[meta.rowIndex]),

    onRowsDelete : async function handleDelete(row) {
      let response = await showModal(Object.keys(row.lookup).length)
      console.log(response)
      if (response === "Yes") {
        const fid = Object.keys(row.lookup).map(idx => patterns[idx]?.id)
        fid.forEach(fid => deletePattern(fid))
      }
      if (response === "No")
        fetchPatterns(page, pageSize, search, sortOrder);
    },

    onTableChange : (action, tableState) => {
      const sortInfo = tableState.announceText
        ? tableState.announceText.split(" : ")
        : [];
      let order = "";
      if (tableState.activeColumn) {
        order = `${columns[tableState.activeColumn].name} desc`;
      }

      switch (action) {
        case "changePage":
          fetchPatterns(tableState.page, pageSize, search, sortOrder);
          break;
        case "changeRowsPerPage":
          fetchPatterns(page, tableState.rowsPerPage, search, sortOrder);
          break;
        case "search":
          if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
          }
          searchTimeout.current = setTimeout(() => {
            if (search !== tableState.searchText) {
              fetchPatterns(page, pageSize, tableState.searchText !== null
                ? tableState.searchText
                : "", sortOrder);
            }
          }, 500);
          break;
        case "sort":
          if (sortInfo.length == 2) {
            if (sortInfo[1] === "ascending") {
              order = `${columns[tableState.activeColumn].name} asc`;
            } else {
              order = `${columns[tableState.activeColumn].name} desc`;
            }
          }
          if (order !== sortOrder) {
            fetchPatterns(page, pageSize, search, order);
          }
          break;
      }
    },
  };

  return (
    <NoSsr>
      {selectedPattern.show &&
        <PatternForm onSubmit={handleSubmit} show={setSelectedPattern} pattern={selectedPattern.pattern} />}

      {selectedRowData && Object.keys(selectedRowData).length > 0 && (
        <YAMLEditor pattern={selectedRowData} onClose={resetSelectedRowData()} onSubmit={handleSubmit} />
      )}
      {
        !selectedPattern.show && <MuiThemeProvider theme={getMuiTheme()}>
          <MUIDataTable
            title={<div className={classes.tableHeader}>Patterns</div>}
            data={patterns}
            columns={columns}
            // @ts-ignore
            options={options}
            className={classes.muiRow}
          />
        </MuiThemeProvider>
      }
      <PromptComponent ref={modalRef} />
    </NoSsr>
  );
}

const mapDispatchToProps = (dispatch) => ({ updateProgress : bindActionCreators(updateProgress, dispatch), });

const mapStateToProps = (state) => {
  return { user : state.get("user")?.toObject(), };
};

// @ts-ignore
export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(withSnackbar(MesheryPatterns)));



// --------------------------------------------------------------------------------------------------
// -------------------------------------------- PATTERNS FORM ---------------------------------------
// --------------------------------------------------------------------------------------------------



function PatternForm({ pattern, onSubmit, show : setSelectedPattern }) {
  const { workloadTraitSet, meshWorkloads } = useContext(SchemaContext);
  const [workloadTraitsSet, setWorkloadTraitsSet] = useState(workloadTraitSet);
  const [deployServiceConfig, setDeployServiceConfig] = useState(getPatternJson() || {});
  const [yaml, setYaml] = useState(pattern.pattern_file);
  const classes = useStyles();
  const reference = useRef({});
  const [selectedMeshType, setSelectedMeshType] = useState("core")
  const [selectedVersionMesh, setSelectedVersionMesh] = useState()
  const [selectedVersion, setSelectedVersion] = useState("")
  const [activeForm, setActiveForm] = useState()

  useEffect(() => {
    if (workloadTraitSet != workloadTraitsSet) {
      setWorkloadTraitsSet(workloadTraitSet)
    }
  }, [workloadTraitSet]);

  useEffect(() => {
    const meshVersionsWithDetails = groupWlByVersion()
    setSelectedVersionMesh(meshVersionsWithDetails)
  }, [selectedMeshType])

  useEffect(() => {
    if (selectedVersionMesh) {
      setSelectedVersion(Object.keys(selectedVersionMesh).sort().reverse()[0])
    }
  }, [selectedVersionMesh])


  function groupWlByVersion() {
    const mfw = meshWorkloads[selectedMeshType];
    return mfw ? groupWorkloadByVersion(mfw) : {};
  }


  function getPatternJson() {
    const patternString = pattern.pattern_file;
    // @ts-ignore
    return jsYaml.load(patternString).services;
  }

  function getPatternKey(cfg) {
    return Object.keys(cfg?.services)?.[0] || undefined;
  }

  const handleSubmit = (cfg, patternName) => {
    console.log("submitted", { cfg, patternName })
    const key = getPatternKey(cfg);
    handleDeploy({ ...deployServiceConfig, [key] : cfg?.services?.[key] });
    if (key) setDeployServiceConfig({ ...deployServiceConfig, [key] : cfg?.services?.[key] });
  }

  const handleSettingsChange = (schemaSet) => () => {
    const config = createPatternFromConfig({
      [getPatternServiceName(schemaSet)] : {
        // @ts-ignore
        settings : reference.current?.getSettings(),
        // @ts-ignore
        traits : reference.current?.getTraits()
      }
    }, "default", true);

    handleChangeData(config, "");
  }

  const handleChangeData = (cfg, patternName) => {
    console.log("Ran Changed", { cfg, patternName })
    const key = getPatternKey(cfg);
    handleDeploy({ ...deployServiceConfig, [getPatternKey(cfg)] : cfg?.services?.[key] });
    if (key)
      setDeployServiceConfig({ ...deployServiceConfig, [getPatternKey(cfg)] : cfg?.services?.[key] });
  }

  const handleDelete = (cfg, patternName) => {
    console.log("deleted", cfg);
    const newCfg = workloadTraitsSet?.filter(schema => schema.workload.title !== patternName)
    setWorkloadTraitsSet(newCfg);
  }

  const handleDeploy = (cfg) => {
    const deployConfig = {};
    deployConfig.name = pattern.name;
    deployConfig.services = cfg;
    const deployConfigYaml = jsYaml.dump(deployConfig);
    setYaml(deployConfigYaml);
  }

  function handleSubmitFinalPattern(yaml, id, name, action) {
    onSubmit(yaml, id, name, action);
    setSelectedPattern(resetSelectedPattern()); // Remove selected pattern
  }

  const ns = "default";

  function saveCodeEditorChanges(data) {
    setYaml(data.valueOf().getValue())
  }

  function insertPattern(workload) {
    const attrName = getPatternServiceName(workload);
    var returnValue = {}
    Object.keys(deployServiceConfig).find(key => {
      if (deployServiceConfig[key]['type'] === attrName) {
        returnValue = deployServiceConfig[key]
        return true
      }
    })

    return returnValue;
  }

  function getMeshOptions() {
    return meshWorkloads ? Object.keys(meshWorkloads) : []
  }

  function getMeshProps(name) {
    switch (name) {
      case "istio": return { name, img : "/static/img/istio.svg" }
      case "linkerd": return { name, img : "/static/img/linkerd.svg" }
      case "nginx": return { name, img : "/static/img/nginx.svg" }
      case "smi": return { name, img : "/static/img/smi.png" }
      case "citrix": return { name, img : "/static/img/citrix_service_mesh.svg" }
      case "core": return { name, img : "/static/img/kubernetes.svg" }
      default: return {}
    }
  }

  function handleMeshSelection(event) {
    setSelectedMeshType(event.target.value);
  }

  function handleVersionChange(_, value) {
    setSelectedVersion(value)
  }

  async function getPatternProps(schema) {
    const refinedSchema = await getWorkloadTraitAndType(schema)
    setActiveForm(refinedSchema)
  }

  console.log({ selectedVersionMesh })

  if (!workloadTraitsSet) return <CircularProgress />

  return (
    <>
      <AppBar position="static" className={classes.appBar} elevation={0}>
        <Toolbar className={classes.toolbar}>
          <FormControl className={classes.formCtrl}>
            <Select
              labelId="service-mesh-selector"
              id="service-mesh-selector"
              value={selectedMeshType}
              onChange={handleMeshSelection}
              disableUnderline
            >
              {getMeshOptions().map(item => {
                const details = getMeshProps(item)
                return (<MenuItem value={details.name}>
                  <li>
                    <img src={details.img} height="32px" />
                  </li>
                </MenuItem>)
              })}
            </Select>


          </FormControl>
          {
            selectedVersion &&
            <Autocomplete
              options={Object.keys(selectedVersionMesh).sort().reverse()}
              renderInput={(params) => <TextField {...params} variant="outlined" label="Version" />}
              value={selectedVersion}
              onChange={handleVersionChange}
              className={classes.autoComplete}
              disableClearable
            />
          }
          {/* <Autocomplete
            id="service-meshes-versions"
            limitTags={2}
            options={meshOptions}
            getOptionLabel={option => option.title}
            disableClearable
            renderInput={(params) => <TextField {...params} variant="outlined" label="Custom filter" />}
            renderOption={(option) => {
              return (
                <li>
                  <img src={option.img} height="50px" />
                </li>
              )
            }}
            renderTags={(option) => {
              return (
                <li>
                  <img src={option.img} height="50px" />
                </li>
              )
            }}
          /> */}
          {/* <IconButton edge="start" className={classes.backButton} color="inherit" onClick={() => setSelectedPattern(resetSelectedPattern())}>
            <ArrowBackIcon />
          </IconButton> */}
          <ButtonGroup
            disableFocusRipple
            disableElevation
            className={classes.btngroup}
          >
            {selectedVersionMesh && selectedVersionMesh?.[selectedVersion]
              ?.sort((a, b) => (getPatternServiceName(a.workload) < getPatternServiceName(b.workload) ? -1 : 1))
              .map((s) => {
                const name = s?.workload?.oam_definition?.spec?.metadata?.k8sKind
                return nameToIcon(name, () => getPatternProps(s))
              })
            }
            <Divider
              orientation="vertical"
            />
          </ButtonGroup>
          <Tooltip title="Save Pattern as New File">
            <IconButton
              aria-label="Save"
              color="primary"
              onClick={() => handleSubmitFinalPattern(yaml, "", `meshery_${Math.floor(trueRandom() * 100)}`, "upload")}
            >
              <FileCopyIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Update Pattern">
            <IconButton
              aria-label="Update"
              color="primary"
              onClick={() => handleSubmitFinalPattern(yaml, pattern.id, pattern.name, "update")}
            >
              <SaveIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Pattern">
            <IconButton
              aria-label="Delete"
              color="secondary"
              onClick={() => handleSubmitFinalPattern(yaml, pattern.id, pattern.name, "delete")}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="List View">
            <IconButton color="primary" onClick={() => setActiveForm(null)}>
              <ListAltIcon />
            </IconButton>
          </Tooltip>
          {/* <Typography variant="h6">
            Edit Pattern Configuration of <i>{`${pattern.name}`}</i>
          </Typography> */}
        </Toolbar>
      </AppBar>
      <Grid container spacing={3}>
        {
          activeForm
            ? (
              <Grid item xs={12} md={6}>
                <PatternServiceForm
                  schemaSet={activeForm}
                  jsonSchema={activeForm.workload}
                  formData={insertPattern(activeForm.workload)}
                  onSettingsChange={handleSettingsChange(activeForm.workload)}
                  onSubmit={(val) => handleSubmit(val, pattern.name)}
                  onDelete={(val) => handleDelete(val, pattern.name)}
                  namespace={ns}
                  reference={reference}
                />
              </Grid>
            ) : (
              <Grid item xs={12} md={6}>
                {selectedVersionMesh && selectedVersionMesh?.[selectedVersion]
                  ?.filter((s) => s.type !== "addon")
                  .sort((a, b) => (getPatternServiceName(a.workload) < getPatternServiceName(b.workload) ? -1 : 1))
                  .map((s, i) => (
                    <div style={{ marginBottom : "0.5rem" }} key={`svc-form-${i}`} >
                      {
                        console.log("pa:", i, s)
                      }
                      <LazyPatternServiceForm
                        schemaSet={s}
                        formData={insertPattern(s.workload)}
                        onSettingsChange={handleSettingsChange(s.workload)}
                        onSubmit={(val) => handleSubmit(val, pattern.name)}
                        onDelete={(val) => handleDelete(val, pattern.name)}
                        namespace={ns}
                        reference={reference}
                      />
                    </div>))}
                <Accordion style={{ width : '100%' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">
                      Configure Addons
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {selectedVersionMesh && selectedVersionMesh?.[selectedVersion]
                      ?.filter((s) => s.type === "addon")
                      .sort((a, b) => (getPatternServiceName(a.workload) < getPatternServiceName(b.workload) ? -1 : 1))
                      .map((s, i) => (
                        <Grid item key={`svc-form-addons-${i}`}>
                          <LazyPatternServiceForm
                            formData={deployServiceConfig[s.workload?.title]}
                            onSettingsChange={handleSettingsChange(s.workload)}
                            schemaSet={s}
                            onSubmit={handleSubmit}
                            onDelete={handleDelete}
                            namespace={ns}
                            reference={reference}
                          />
                        </Grid>
                      ))}
                  </AccordionDetails>
                </Accordion>
              </Grid>)
        }
        <Grid item xs={12} md={6} >
          <CodeEditor yaml={yaml} pattern={pattern} handleSubmitFinalPattern={handleSubmitFinalPattern} saveCodeEditorChanges={saveCodeEditorChanges} />
        </Grid>
      </Grid>
    </>
  );
}

function CodeEditor({ yaml, handleSubmitFinalPattern, saveCodeEditorChanges, pattern }) {
  const cardStyle = { position : "sticky", minWidth : "100%" };

  const classes = useStyles();

  return (
    <div>
      <Card
        // @ts-ignore
        style={cardStyle}>
        <CardContent >
          <CodeMirror
            value={yaml}
            className={classes.codeMirror}
            options={{
              theme : "material",
              lineNumbers : true,
              lineWrapping : true,
              gutters : ["CodeMirror-lint-markers"],
              mode : "text/x-yaml",
            }}
            onBlur={(a) => saveCodeEditorChanges(a)}
          />
          <CardActions style={{ justifyContent : "flex-end", marginBottom : '0px' }}>
            <Tooltip title="Save Pattern as New File">
              <IconButton
                aria-label="Save"
                color="primary"
                onClick={() => handleSubmitFinalPattern(yaml, "", `meshery_${Math.floor(trueRandom() * 100)}`, "upload")}
              >
                <FileCopyIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Update Pattern">
              <IconButton
                aria-label="Update"
                color="primary"
                onClick={() => handleSubmitFinalPattern(yaml, pattern.id, pattern.name, "update")}
              >
                <SaveIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Pattern">
              <IconButton
                aria-label="Delete"
                color="secondary"
                onClick={() => handleSubmitFinalPattern(yaml, pattern.id, pattern.name, "delete")}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </CardActions>
        </CardContent>
      </Card>
    </div>
  )
}

function nameToIcon(name, action) {
  console.log("name: ", name)
  function CustomIcon({ Icon }) {
    return (
      <Tooltip
        title={name}>
        <IconButton onClick={action}>
          <Icon />
        </IconButton>
      </Tooltip>
    )
  }

  switch (name) {
    case "AuthorizationPolicy": return <CustomIcon Icon={LockIcon} />
    case "DestinationRule": return <CustomIcon Icon={ExploreIcon} />
    case "EnvoyFilter": return <CustomIcon Icon={Filter} />
    case "Gateway": return <CustomIcon Icon={ListAltIcon} />
    case "PeerAuthentication": return <CustomIcon Icon={FileCopyIcon} />
    case "Sidecar": return <CustomIcon Icon={DirectionsCar} />
    case "VirtualService": return <CustomIcon Icon={SupervisedUserCircle} />
    case "WorkloadEntry": return <CustomIcon Icon={SimCard} />
    default: return <CustomIcon Icon={AddCircle} />
  }
}