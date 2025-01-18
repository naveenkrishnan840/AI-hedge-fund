import {React, useState, useEffect} from "react";
import "react-chat-elements/dist/main.css"
import {Formik, Form, Field} from "formik";
import {RequestService} from "./request";
import { Box, Button, Container, Grid2, Select } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import {useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import Chip from '@mui/material/Chip';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from "dayjs";
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';

const ChatBody = () => {
    const [ticker, setTicker] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedAnalyst, setSelectedAnalyst] = useState([]);
    const [cash, setCash] = useState(10000);
    const [stock, setStock] = useState(0);
    const [responseLoaded, setResponseLoaded] = useState(false);
    const [analystSignalRes, setAnalystSignalRes] = useState([]);
    const [tradingDecisionRes, settradingDecisionRes] = useState({});
    const [listOfDecision, setListOfDecision] = useState([]);
    const [clearResponse, setClearResponse] = useState(false);  
    const [reasoning, setReasoning] = useState("");
    const theme = useTheme();
    function cashvaluetext(value) {
        return `$${value}`;
      }

    const handleChangeAnalyst = (event) => {
        setSelectedAnalyst((value) =>
        [...new Set([...value, ...event.target.value])]
        );
    };
    const handleChange = (event) => {
        setTicker(event.target.value);
    };

    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
    PaperProps: {
        style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250
        },
    },
    };
    function getStyles(name, personName, theme) {
        return {
          fontWeight: personName.includes(name)
            ? theme.typography.fontWeightMedium
            : theme.typography.fontWeightRegular,
        };
      }
    const onSubmitForm = () => {
        setResponseLoaded(false);
        setClearResponse(true)
        const data = {
            "ticker": ticker,
            "selectedAnalyst": selectedAnalyst,
            "startDate": `${startDate.$d.getFullYear()}-${String(startDate.$d.getMonth() + 1).padStart(2, '0')}-${String(startDate.$d.getDate()).padStart(2, '0')}`,
            "endDate": `${endDate.$d.getFullYear()}-${String(endDate.$d.getMonth() + 1).padStart(2, '0')}-${String(endDate.$d.getDate()).padStart(2, '0')}`,
            "portfolio": {
                "cash": cash,
                "shares": Number(stock),
            }
        }
        const response = RequestService("/hedge-fund-request", data);
        response.then((res)=>{
            if (res.detail){
                setResponseLoaded(true);
                settradingDecisionRes(res.detail.decision);
                setAnalystSignalRes(res.detail.analyst_signals);
                setListOfDecision(res.detail.date_range_decision);
                setReasoning(res.detail.reasoning);
                setResponseLoaded(true);

            }
        })
    }

    useEffect(() => {
        setResponseLoaded(false);
      }, []);
    
    return (
        <>
        <div className="min-h-screen bg-gray-500 text-white">
            <div className="text-center font-bold text-2xl border border-white shadow-lg p-6 mx-40 rounded-md">AI Hedge Fund</div>
            <Formik
                validateOnBlur={false}
                validateOnChange={false}
                    initialValues={{ inputmessage: ""}}
                    onSubmit={async (values, { resetForm }) => {
                        onSubmitForm(values)
                        resetForm({
                            values: { inputmessage: "",  passengerId: null}
                        })
                    }}
                >
                    {({ values, submitForm, errors }) => (
                        <Form>
                            <Container sx={{
                                            width: '1000px',
                                            border: "1px solid white",
                                            marginTop: "50px",
                                            marginBottom: "50px"
                                        }}>
                                        <Grid2 container rowSpacing={8} columnSpacing={5} sx={{color: 'whitesmoke', padding: "10px", margin: "10px"}}>
                                            <Grid2 size={6}>
                                                <FormControl sx={{width: 400}}>
                                                    <InputLabel >Ticker</InputLabel>
                                                    <Field name="inputmessage" >
                                                        {({ field }) => (
                                                            <>
                                                               <Select
                                                                    sx={{color: "whitesmoke"}}
                                                                    defaultValue={"AAPL"}
                                                                    labelId="demo-simple-select-helper-label"
                                                                    id="demo-simple-select-helper"
                                                                    value={ticker}
                                                                    label="Ticker"
                                                                    onChange={handleChange}
                                                                    required
                                                                    helperText="This field is mandatory"
                                                                    >
                                                                    <MenuItem value={"GOOGL"}>Apple Inc. (AAPL)</MenuItem>
                                                                    <MenuItem value={"GOOGL"}>Alphabet Inc. (GOOGL)</MenuItem>
                                                                    <MenuItem value={"MSFT"}>Microsoft Corporation (MSFT)</MenuItem>
                                                                    <MenuItem value={"AMZN"}>Amazon.com, Inc. (AMZN)</MenuItem>
                                                                    <MenuItem value={"META"}>Meta (formerly Facebook) Inc. (META)</MenuItem>
                                                                    <MenuItem value={"TSLA"}>Tesla Motors (TSLA)</MenuItem>
                                                                    <MenuItem value={"GS"}>The Goldman Sachs Group, Inc. (GS)</MenuItem>
                                                                    <MenuItem value={"GS"}>The Goldman Sachs Group, Inc. (GS)</MenuItem>
                                                                    <MenuItem value={"DJIA"}>The Dow Jones Industrial Average (DJIA)</MenuItem>
                                                                    <MenuItem value={"SPX"}>The S&P 500 Index (SPX)</MenuItem>
                                                                    <MenuItem value={"COMP"}>The NASDAQ Composite Index (COMP)</MenuItem>
                                                                    
                                                            </Select> 
                                                            </>
                                                        )}
                                                    </Field>
                                                    
                                                </FormControl>
                                            </Grid2>
                                            <Grid2 size={6}>
                                                <FormControl sx={{width: 400}}>
                                                    <InputLabel id="demo-multiple-chip-label">AI Analyst</InputLabel>
                                                    <Select
                                                    sx={{color: "whitesmoke"}}
                                                    labelId="demo-multiple-chip-label"
                                                    id="demo-multiple-chip"
                                                    multiple
                                                    value={selectedAnalyst}
                                                    onChange={handleChangeAnalyst}
                                                    input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                                                    renderValue={(selected) => (
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, color: "whitesmoke" }}>
                                                        {selected.map((value) => (
                                                            <Chip key={value} label={value} />
                                                        ))}
                                                        </Box>
                                                    )}
                                                    MenuProps={MenuProps}
                                                    >
                                                        <MenuItem key={"technical_analyst"} value={"Technical Analyst"} 
                                                        style={getStyles("technical_analyst", selectedAnalyst, theme)}>
                                                        Technical Analyst
                                                        </MenuItem>
                                                        <MenuItem key={"fundamentals_analyst"} value={"Fundamentals Analyst"} 
                                                        style={getStyles("fundamentals_analyst", selectedAnalyst, theme)}>
                                                        Fundamentals Analyst
                                                        </MenuItem>
                                                        <MenuItem key={"sentiment_analyst"} value={"Sentiment Analyst"} 
                                                        style={getStyles("sentiment_analyst", selectedAnalyst, theme)}>
                                                        Sentiment Analyst    
                                                        </MenuItem>
                                                        <MenuItem key={"valuation_analyst"} value={"Valuation Analyst"} 
                                                        style={getStyles("valuation_analyst", selectedAnalyst, theme)}>
                                                        Valuation Analyst
                                                        </MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid2>
                                            <Grid2 size={6}>
                                                <FormControl sx={{width: 400}}>
                                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                        <DatePicker maxDate={dayjs()} value={startDate} onChange={(newValue) => setStartDate(newValue)}
                                                            label="Start Date" format="DD-MM-YYYY"
                                                        />
                                                    </LocalizationProvider>
                                                </FormControl>
                                            </Grid2>
                                            <Grid2 size={6}>
                                                <FormControl sx={{width: 400}}>
                                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                        <DatePicker maxDate={dayjs()} value={endDate} onChange={(newValue) => setEndDate(newValue)}
                                                            label="End Date" format="DD-MM-YYYY" sx={{color: "whitesmoke"}}
                                                        />
                                                    </LocalizationProvider>
                                                </FormControl>
                                            </Grid2>
                                            {/* <Divider/> */}
                                            <Grid2 size={6}>
                                                <FormControl sx={{width: 400}}>
                                                    <TextField
                                                    
                                                    label="Cash"
                                                    type="number"
                                                    defaultValue={100000}
                                                    required
                                                    // value={cash}
                                                    onChange={(evt) => setCash(evt.target.value)}
                                                    />
                                                </FormControl>
                                            </Grid2>
                                            <Grid2 size={6}>
                                                <FormControl sx={{width: 400}}>
                                                    <TextField
                                                    label="Shares"
                                                    type="number"
                                                    sx={{color: "whitesmoke"}}
                                                    required
                                                    onChange={(evt) => setStock(evt.target.value)}
                                                    />
                                                </FormControl>
                                            </Grid2>
                                            <Grid2 sx={{marginLeft: "250px"}}>
                                                <FormControl sx={{width: 400}}>
                                                    <Button type="submit" sx={{color: "white", bgcolor: "#6B7280", cursor: "pointer"}} variant="contained">Submit</Button>
                                                </FormControl>
                                            </Grid2>
                                        </Grid2>
                                        </Container>
                                        <CircularProgress color="success"/>
                                        {responseLoaded === true &&
                                        (<>
                                                <Divider/>
                                                <Container sx={{
                                                    width: '1000px',
                                                    border: "1px solid white",
                                                    marginTop: "50px",
                                                    minHeight:"500px"
                                                }}>
                                                    <div className="m-10 space-y-7">
                                                        <div style={{width: "850px"}} className="p-2 m-2 font-bold shadow-md text-center ">ANALYST SIGNALS</div>
                                                        <TableContainer component={Paper}>
                                                                <Table aria-label="Analyst SIgnals">
                                                                    <TableHead>
                                                                    <TableRow>
                                                                        <TableCell>Analyst</TableCell>
                                                                        <TableCell >Signal</TableCell>
                                                                        <TableCell>Confidence</TableCell>
                                                                    </TableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                    {analystSignalRes.map((row) => (
                                                                        <TableRow
                                                                        >
                                                                        <TableCell sx={{color: "blueviolet"}}>{row.analyst}</TableCell>
                                                                        {row.signal == "BULLISH" &&
                                                                        <TableCell sx={{color: "green"}}>{row.signal}</TableCell>}
                                                                        {row.signal == "BEARISH" &&
                                                                        <TableCell sx={{color: "red"}}>{row.signal}</TableCell>}
                                                                        {row.signal == "NEUTRAL" &&
                                                                        <TableCell sx={{color: "yellow"}}>{row.signal}</TableCell>}
                                                                        <TableCell sx={{color: "yellowgreen"}}>{row.confidence}</TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                    </TableBody>
                                                                </Table>
                                                        </TableContainer>
                                                        <Divider/>
                                                        <div style={{width: "850px"}} className="p-2 m-2 font-bold shadow-md text-center ">TRADING DECISION</div>
                                                        <TableContainer sx={{display: "flex", justifySelf: "center"}} component={Paper}>
                                                            <Table aria-label="Decision table">
                                                                <TableBody>
                                                                {Object.entries(tradingDecisionRes).map((row, index) => (
                                                                    <TableRow >
                                                                        <TableCell>{row[0]}</TableCell>
                                                                        {row[0] == "Action" && row[1] == "BUY" && 
                                                                        <TableCell sx={{color:"green"}}>{row[1]}</TableCell>}
                                                                        {row[0] == "Action" && row[1] == "SELL" && 
                                                                        <TableCell sx={{color:"red"}}>{row[1]}</TableCell>}
                                                                        {row[0] == "Action" && row[1] == "HOLD" && 
                                                                        <TableCell sx={{color:"yellow"}}>{row[1]}</TableCell>}
                                                                        {row[0] == "Confidence" && 
                                                                        <TableCell sx={{color:"yellow"}}>{row[1]}</TableCell>}
                                                                        {row[0] == "Quantity" && Object.entries(tradingDecisionRes)[index - 1][1] == "BUY" && 
                                                                        <TableCell sx={{color:"green"}}>{row[1]}</TableCell>}
                                                                        {row[0] == "Quantity" && Object.entries(tradingDecisionRes)[index - 1][1] == "SELL" && 
                                                                        <TableCell sx={{color:"red"}}>{row[1]}</TableCell>}
                                                                        {row[0] == "Quantity" && Object.entries(tradingDecisionRes)[index - 1][1] == "HOLD" && 
                                                                        <TableCell sx={{color:"yellow"}}>{row[1]}</TableCell>}
                                                                    </TableRow>
                                                                ))}
                                                                </TableBody>
                                                            </Table>
                                                        </TableContainer>
                                                        <Divider/>
                                                        <div style={{width: "850px"}} className="p-2 m-2 font-bold shadow-md text-center ">Reasoning</div>
                                                        <div style={{width: "850px"}} className="p-2 m-2 font-bold shadow-md text-wrap  ">{reasoning}</div>
                                                        <Divider/>
                                                        <div style={{width: "850px"}} className="p-2 m-2 font-bold shadow-md text-center ">DATE RANGE TRADING DECISION</div>
                                                        <TableContainer component={Paper}>
                                                            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                                                <TableHead>
                                                                <TableRow>
                                                                    <TableCell align="center">Date</TableCell>
                                                                    <TableCell align="center">Ticker</TableCell>
                                                                    <TableCell align="center">Action</TableCell>
                                                                    <TableCell align="center">Quantity</TableCell>
                                                                    <TableCell align="center">Price</TableCell>
                                                                    <TableCell align="center">Shares</TableCell>
                                                                    <TableCell align="center">Total Value</TableCell>
                                                                    <TableCell align="center">Bullish</TableCell>
                                                                    <TableCell align="center">Bearish</TableCell>
                                                                    <TableCell align="center">Neutral</TableCell>
                                                                </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                {listOfDecision.map((row) => (
                                                                    <TableRow
                                                                        key={row.name}
                                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                    >
                                                                    <TableCell align="center">{row.date}</TableCell>
                                                                    <TableCell sx={{color: "green"}} align="center">{row.ticker}</TableCell>

                                                                    {row.action == "buy" && 
                                                                    <TableCell sx={{color:"green"}}>{row.action.toUpperCase()}</TableCell>}
                                                                    {row.action == "sell" && 
                                                                    <TableCell sx={{color:"red"}}>{row.action.toUpperCase()}</TableCell>}
                                                                    {row.action == "hold" && 
                                                                    <TableCell sx={{color:"yellow"}}>{row.action.toUpperCase()}</TableCell>}

                                                                    {row.action == "buy" && 
                                                                    <TableCell sx={{color:"green"}}>{row.quantity}</TableCell>}
                                                                    {row.action == "sell" && 
                                                                    <TableCell sx={{color:"red"}}>{row.quantity}</TableCell>}
                                                                    {row.action == "hold" && 
                                                                    <TableCell sx={{color:"yellow"}}>{row.quantity}</TableCell>}

                                                                    <TableCell align="center">{row.price}</TableCell>
                                                                    <TableCell  align="center">{row.shares_owned}</TableCell>
                                                                    <TableCell sx={{color:"yellow"}} align="center">{row.position_value}</TableCell>
                                                                    <TableCell sx={{color:"green"}} align="center">{row.bullish_count}</TableCell>
                                                                    <TableCell sx={{color:"red"}} align="center">{row.bearish_count}</TableCell>
                                                                    <TableCell sx={{color:"blue"}} align="center">{row.neutral_count}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                                </TableBody>
                                                            </Table>
                                                        </TableContainer>
                                                    </div>
                                                </Container>    
                                            </>)}
                        </Form>
                       )}
            </Formik>
        </div>
        </>
    )
}

export default ChatBody;