import React, {useState, useEffect} from 'react';
import{
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent,
} from "@material-ui/core";
import InfoBox from "./InfoBox";
import Map from "./Map";
import Table from "./Table";
import { sortData, prettyPrintStat } from "./util";
import LineGraph from "./LineGraph";
import './App.css';
import "leaflet/dist/leaflet.css";


function App() {

//State = How to write variables in REact. 
// Syntax: const [variable, modifier to change = useState([empty value])]
//UseEffect runs piece of code based on a given condition. 
const [countries, setCountries] = useState([]);
const [country, setCountry] = useState('worldwide');
const [countryInfo, setCountryInfo] = useState({});
const [tableData, setTableData] = useState([]);
// Positioning the map into center using latitude and longitude.
const [mapCenter, setMapCenter] = useState({lat: 34.80746, lng: -40.4796});
const [mapZoom, setMapZoom] = useState(3);
const [mapCountries, setMapCountries] = useState([]);
const [casesType, setCasesType] = useState("cases");

//This displays the worldwide case when app loads up.
useEffect(() => {
  fetch("https://disease.sh/v3/covid-19/all")
  .then(response => response.json())
  .then(data => {
    setCountryInfo(data);
  });
}, []);

useEffect(() => {
  //Code over here runs once when components loads and not again. 
  // asyc -> send a reques, wait, and do something with info. 
  const getCountriesData = async () => {
    await fetch ("https://disease.sh/v3/covid-19/countries")
    .then ((response) => response.json())
    .then((data) => 
    {
      // Map is like loop to iterate over arrays plus it returns the value. 
      const countries = data.map((country) => (
        {
          name: country.country, // Name of country.
          value: country.countryInfo.iso2 //UK, USA, FR
        }));

          // Sorts the data and puts in table. 
          const sortedData = sortData(data);
          setTableData(sortedData);
          setCountries(countries);
          // For circles in map
          setMapCountries(data);
    });
  };

  //Calling the function to get info about countries and mapping it. 
  getCountriesData();
}, []);

const onCountryChange = async (event) => {
  const countryCode = event.target.value;
  // This code sets the countryname instead of worldwide in dropdown.
  setCountry(countryCode);

  // Pull the info of country when country is selected.
  // if the country code is worldwide then first link other wise second link.
  const url = countryCode === 'worldwide' ? `https://disease.sh/v3/covid-19/all` : 
  `https://disease.sh/v3/covid-19/countries/${countryCode}`;

  await fetch(url)
  .then(response => response.json())
  .then(data => {
    setCountry(countryCode);

    //All the data from country response is stored. 
    setCountryInfo(data);
    // Shows the map when country is selected from dropdown.
    setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
    setMapZoom(4);
  });
};
  return (
    //BEM naming convention
    // Menu Item are from material-ui for dropdowns. 
    <div className="app"> 
      <div className="app_left">
      <div className="app_header">
        <h1>Covid 19 tracker</h1>
        <FormControl className="app_dropdown">
          <Select variant="outlined" onChange = {onCountryChange} value={country}>
          <MenuItem value="worldwide">WorldWide</MenuItem>
            {/*Loops through all the countries and 
            show down the dropdown of countries*/}
            {

              countries.map(country => (
              <MenuItem value={country.value}>{country.name}</MenuItem>
              ))
            }

            {/*<MenuItem value="worldwide">Option1</MenuItem>
            <MenuItem value="worldwide">Option2</MenuItem>
            <MenuItem value="worldwide">Option3</MenuItem>
          <MenuItem value="worldwide">Option4</MenuItem>*/}
          </Select>
        </FormControl>
      </div>
      
      <div className="app_stats">
        <InfoBox 
        isRed
        active={casesType === "cases"}
        onClick={e => setCasesType("cases")}
        title="Coronavirus Cases" 
        cases={prettyPrintStat(countryInfo.todayCases)} 
        total={prettyPrintStat(countryInfo.cases)}>
        </InfoBox>

        <InfoBox 
        active={casesType === "recovered"}
        onClick={e => setCasesType("recovered")}
        title="Recovered" 
        cases={prettyPrintStat(countryInfo.todayRecovered)} 
        total={prettyPrintStat(countryInfo.recovered)}>
        </InfoBox>

        <InfoBox 
        isRed
        active={casesType === "deaths"}
        onClick={e => setCasesType("deaths")}
        title="Deaths" 
        cases={prettyPrintStat(countryInfo.todayDeaths)}
        total={prettyPrintStat(countryInfo.deaths)}>
        </InfoBox>
        {/* Infoboxes Corona virus cases */}
        {/* Infoboxes Corona recoveries*/}
        {/* Infoboxes */}
      </div>

      <Map
        casesType={casesType}
        countries={mapCountries}
        center={mapCenter}
        zoom={mapZoom}
      />

      {/* Map */}
      </div>
      <Card className="app_right">  
        <CardContent>
          <h3> Live Cases by Country</h3>
          {/* Table */}
          <Table countries={tableData}/>
          <h3 className="app_graphTitle">Worldwide new cases.</h3>
          <LineGraph />
        </CardContent>
      </Card>
      
    </div>
  );
}

export default App;
