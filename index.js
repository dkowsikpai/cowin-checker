const fetch = require('node-fetch');
const lodash = require('lodash');
const fs = require("fs");
const schedule = require("node-schedule");

let district = "307"
let dates = [
    "24-06-2021",
    "25-06-2021",
    "26-06-2021",
    "27-06-2021",
    "28-06-2021",
    "29-06-2021",
    "30-06-2021",
    "01-07-2021"
]
let limit = 30;

setInterval(run, 10000);


function run() {
    dates.forEach(date=>{
        let url = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id=${district}&date=${date}`;
        fetch(url)
            .then(response=>response.json())
            .then(data=>{
                sessions = data.sessions;
                console.log(date);
                get_suggession(sessions, limit);
                // lodash.filter(sessions)
                // var json = JSON.stringify(data);
                // fs.writeFile("data.json", json, "utf-8", (err)=>{
                //     console.log(err);
                // });
                
            })
            .catch(error=>console.error(error));
    });
}

let our_coordinates = [10.165321501188208, 76.24433440835949]
let filter = {
    fee_type: ["Paid"], // Paid
    min_age_limit: [18, 45],
    vaccine: "COVISHIELD",
    min_available_capacity: 0,
    min_available_capacity_dose1: 0
}

const filter_data = (data, filter)=>{
    let sessions = data;
    let dt = lodash.filter(sessions, (i)=>{return i.vaccine === filter.vaccine});
    dt = lodash.filter(dt, (i)=>{return (filter.min_age_limit.indexOf(i.min_age_limit)) >= 0});
    dt = lodash.filter(dt, (i)=>{return (filter.fee_type.indexOf(i.fee_type)) >= 0});
    dt = lodash.filter(dt, (i)=>{return (filter.fee_type.indexOf(i.fee_type)) >= 0});
    dt = lodash.filter(dt, (i)=>{return i.available_capacity > filter.min_available_capacity});
    dt = lodash.filter(dt, (i)=>{return i.available_capacity_dose1 > filter.min_available_capacity_dose1});
    // console.log(dt);
    return dt;
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }
  
function deg2rad(deg) {
    return deg * (Math.PI/180);
}

// let json_dt = require('./data.json');
// let fdata = filter_data(json_dt, filter);
const get_suggession = (json_dt, limit)=>{
    let fdata = filter_data(json_dt, filter);
    let l = [];
    fdata.forEach(i=>{
        let dist = getDistanceFromLatLonInKm(i.lat, i.long, our_coordinates[0], our_coordinates[1]);
        l.push({
            name: i.name,
            age: i.min_age_limit,
            address: i.address,
            distance: dist,
            available_capacity: i.available_capacity,
            available_capacity_dose1: i.available_capacity_dose1,
            url: "https://selfregistration.cowin.gov.in/"
        })
    });

    let suggesstions = lodash.orderBy(l, ["distance"], ["asc"]);
    let limited_data = lodash.take(suggesstions, limit);
    console.log(limited_data);
}




