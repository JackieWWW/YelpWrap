import React from 'react';
import Search from './Search.js';
import EntryList from './EntryList.js';
import FavEntryList from './FavEntryList.js';
const axios = require('axios');
import GoogleApiWrapper from './MyMapComponent';
import sample from '../../sampledata.js'
/**
 * NOTICE:
 * npm install --save axios on production branch 
 */

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: false,
      query: '',
      results: [],
      coords: {lat: 48.61021668181817,
        lng: 9.103665540909093},
      location: '',
    }
    this.searchHandlerByZip = this.searchHandlerByZip.bind(this);
    this.searchHandlerByCoords = this.searchHandlerByCoords.bind(this);
  }
  getPosition(options) {
    return new Promise(function (resolve, reject) {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }
  
  componentDidMount() {
    this.searchHandlerByZip();
    this.getPosition()
    .then(result => {
      this.setState({ coords: {lat: result.coords.latitude, lng: result.coords.longitude} }, ()=>{
        this.searchHandlerByCoords(this.state.query, this.state.coords.lat, 
        this.state.coords.lng)
      }
    );
    })
    .catch(err => console.error(err));
  }
  searchHandlerByZip(term='delis', location='10007'){
    this.setState({query: term})
    axios.post('/search', {term: term, location: location})
    .then((data) => {
      this.setState({results: data.data})
      this.setState({coords: {lat: data.data.region.center.latitude, lng: data.data.region.center.longitude}}, ()=>{console.log('state coords',this.state.coords)})

    })
    .catch((err) => {
      console.log('err from axios: ', err);
    });
  }
  searchHandlerByCoords(term='delis', lat, lng){
    axios.post('/search', {term, lat, lng})
    .then((data) => {
      this.setState({results: data.data})
    })
    .catch((err) => {
      console.log('err from axios: ', err);
    });
  }
  //Chris has this utilized on his branch:
  onMarkerPositionChanged(mapProps, map) {
    console.log('map', map);
    console.log('mapProp', mapProps)
    console.log('lat', map.center);
    console.log('lng', map.center.lng());
    var coords = {lat: map.center.lat(), lng: map.center.lng()}
    this.setState({coords: coords},()=>{this.searchHandlerByCoords(this.state.query, this.state.coords.lat, this.state.coords.lng)})
  };
  render() {    
    return (
      <div style={{height: '200px'}}>
        <Search search={this.searchHandlerByZip}/>
        <EntryList list={this.state.results}/>
        <GoogleApiWrapper  markers={this.state.results} onMarkerPositionChanged={this.onMarkerPositionChanged.bind(this)} 
        xy={this.state.coords} />
        <FavEntryList list={this.state.results}/>
      </div>
    )
  }
}