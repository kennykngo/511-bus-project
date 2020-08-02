$(document).ready(() => {
  initMap();
  $.ajax({
    type: "GET",
    url: `http://api.511.org/transit/operators?api_key=4f536c63-2e63-429d-9261-fb091e63e5f8`,
    dataType: "json",
  })
    .then((operator) => {
      // appends options with operator values to the html
      for (let i = 0; i < operator.length; i++) {
        $("#operators").append(
          `<option value="${operator[i].Id}">${operator[i].Name}</option>`
        );
      }
      // displays val of options used for next AJAX
      $("#operators").on("change", function optionVal() {
        var operatorVal = $(this).val();
        console.log(operatorVal);
        // function fetchdata() {
        $.ajax({
          type: "GET",
          url: `http://api.511.org/transit/VehicleMonitoring?api_key=4f536c63-2e63-429d-9261-fb091e63e5f8&agency=${operatorVal}`,
          dataType: "json",
        }).then((vehicleInfo) => {
          if (vehicleInfo) {
            console.log(vehicleInfo);
            var vehicleArr = [];
            var vehicleObj;
            var vehicleInfoAbb =
              vehicleInfo.Siri.ServiceDelivery.VehicleMonitoringDelivery
                .VehicleActivity;
            console.log(vehicleInfoAbb);
            for (var i = 0; i < vehicleInfoAbb.length; i++) {
              vehicleObj = {};

              var lat2 =
                vehicleInfoAbb[i].MonitoredVehicleJourney.VehicleLocation
                  .Latitude;
              var lon2 =
                vehicleInfoAbb[i].MonitoredVehicleJourney.VehicleLocation
                  .Longitude;

              // distance equation
              function calcCrow(lat1, lon1, lat2, lon2) {
                var R = 6371; // km
                var dLat = toRad(lat2 - lat1);
                var dLon = toRad(lon2 - lon1);
                var lat1 = toRad(lat1);
                var lat2 = toRad(lat2);

                var a =
                  Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.sin(dLon / 2) *
                    Math.sin(dLon / 2) *
                    Math.cos(lat1) *
                    Math.cos(lat2);
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                var d = R * c;
                return d;
              }

              // Converts numeric degrees to radians
              function toRad(Value) {
                return (Value * Math.PI) / 180;
              }

              vehicleObj["id"] =
                vehicleInfoAbb[i].MonitoredVehicleJourney.LineRef;
              vehicleObj["location"] =
                vehicleInfoAbb[i].MonitoredVehicleJourney.VehicleLocation;
              vehicleObj["destination"] =
                vehicleInfoAbb[i].MonitoredVehicleJourney.DestinationName;
              vehicleObj["direction"] =
                vehicleInfoAbb[i].MonitoredVehicleJourney.DirectionRef;
              vehicleArr.push(vehicleObj);
            }
            console.log(vehicleArr);

            // // need else to catch the err or operators without lines running at this time
            var table = new Tabulator("#example-table", {
              data: vehicleArr,
              height: 205, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
              layout: "fitColumns", //fit columns to width of table (optional)
              placeholder: "No data set",
              columns: [
                //Define Table Columns
                { title: "Name", field: "destination" },
                {
                  title: "Bus Name",
                  field: "id",
                  align: "center",
                },
                { title: "Direction", field: "direction" },
                {
                  title: "Date Of Birth",
                  field: "dob",
                  sorter: "date",
                  align: "center",
                },
              ],
              // identify row clicked and runs another AJAX to find route
              rowClick: function (e, row) {
                console.log(row._row.data.id);
                $.ajax({
                  type: "GET",
                  url: `http://api.511.org/transit/stops?api_key=4f536c63-2e63-429d-9261-fb091e63e5f8&operator_id=${operatorVal}&line_id=${
                    row.getData().id
                  }`,
                  dataType: "json",
                  success: (routeData) => {
                    if (!routeData) {
                      console.log("no worky");
                    } else {
                      // takes the routes api and shows each point in which it'll stop
                      var routeArr =
                        routeData.Contents.dataObjects.ScheduledStopPoint;
                      var originLat = JSON.parse(routeArr[0].Location.Latitude);
                      var originLng = JSON.parse(
                        routeArr[0].Location.Longitude
                      );
                      var destinationLat = JSON.parse(
                        routeArr[routeArr.length - 1].Location.Latitude
                      );
                      var destinationLng = JSON.parse(
                        routeArr[routeArr.length - 1].Location.Longitude
                      );
                      console.log(originLat, destinationLat);

                      function initMap() {
                        // Create the map.
                        const map = new google.maps.Map(
                          document.getElementById("map"),
                          {
                            zoom: 15,
                            center: { lat: 37.7749, lng: -122.4194 }, // SF
                          }
                        );
                        console.log(routeArr);
                        var routeObj;
                        for (let i = 0; i < routeArr.length; i++) {
                          routeObj = {};
                          routeObj["lat"] = JSON.parse(
                            routeArr[i].Location.Latitude
                          );
                          routeObj["lng"] = JSON.parse(
                            routeArr[i].Location.Longitude
                          );
                          console.log(routeObj);
                          const cityCircle = new google.maps.Circle({
                            strokeColor: "#000",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: "#FFF",
                            fillOpacity: 0.35,
                            map,
                            center: routeObj[i],
                            radius: 1000,
                          });
                        }
                      }
                      initMap(routeArr);
                    }
                  },
                });
              },
            });
          }
        });
        // }
        // setInterval(fetchdata, 2000);
      });
    })
    .catch((err) => {
      if (err) throw err;
    });
});

// $.ajax({
//   type: "GET",
//   url: `http://api.511.org/transit/StopMonitoring?api_key=4f536c63-2e63-429d-9261-fb091e63e5f8&agency=SF`,
//   dataType: "json",
//   success: (res) => {
//     console.log(
//       res.ServiceDelivery.StopMonitoringDelivery.MonitoredStopVisit[0]
//     );
//     console.log(
//       res.ServiceDelivery.StopMonitoringDelivery.MonitoredStopVisit[0]
//         .MonitoredVehicleJourney.MonitoredCall
//     );

//     // if (!res) {
//     //   console.log("no worky");
//     // } else {
//     //   console.log(res);
//     // }
//   },
// });

//load sample data into the table
// table.setData(lineData);

// top menu , side nav bar -->
// google maps and tables onto the page
// Display the buses and the information, rather than just the location of the bus
// If bus is clicked, would like to see the bus on the map
// Present the avg speed however I want (on the map/ or however)
// Due end of Sunday

// If done well, work

// 1) Create a web page with from a bootstrap template
// 2) Embed google map onto the page
// 3) Embed a table (e.g., tabulator) also in the page
// 4) Use 511.org to get bus list, real-time locations, stops, and routes
// 5) Collect the locations of the buses along the routes
// 6) calculate the average speed of the bus between stops
// 7) Show the agency buses on the table
// 8) On click, show the selected bus on the map

// var table = new Tabulator("#example-table", {
//   rowFormatter:function(row){
//       if(row.getData().age >= 18){
//           row.getElement().classList.add("success"); //mark rows with age greater than or equal to 18 as successful;
//       }
//   },
// });
