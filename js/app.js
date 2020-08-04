$(document).ready(() => {
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
            // console.log(vehicleInfo);
            var vehicleArr = [];
            var vehicleObj;
            var vehicleLocation;

            // console.log(vehicleInfo);
            var vehicleInfoAbb =
              vehicleInfo.Siri.ServiceDelivery.VehicleMonitoringDelivery
                .VehicleActivity;
            console.log(vehicleInfoAbb);

            // beginning of for loop for vehicleArr
            for (var i = 0; i < vehicleInfoAbb.length; i++) {
              vehicleObj = {};
              vehicleLocation = {};

              // converting time into milliseconds before pushing into array
              var event = new Date(vehicleInfoAbb[i].RecordedAtTime);
              var vehicleMilliTime = Date.parse(event.toString());

              vehicleObj["time"] = vehicleMilliTime;
              vehicleObj["stopname"] =
                vehicleInfoAbb[
                  i
                ].MonitoredVehicleJourney.MonitoredCall.StopPointName;
              vehicleObj["id"] =
                vehicleInfoAbb[i].MonitoredVehicleJourney.LineRef;
              vehicleLocation["lat"] = JSON.parse(
                vehicleInfoAbb[i].MonitoredVehicleJourney.VehicleLocation
                  .Latitude
              );
              vehicleLocation["lng"] = JSON.parse(
                vehicleInfoAbb[i].MonitoredVehicleJourney.VehicleLocation
                  .Longitude
              );
              vehicleObj["location"] = vehicleLocation;
              // console.log(vehicleLocation);
              vehicleObj["destination"] =
                vehicleInfoAbb[i].MonitoredVehicleJourney.DestinationName;
              vehicleObj["direction"] =
                vehicleInfoAbb[i].MonitoredVehicleJourney.DirectionRef;
              vehicleArr.push(vehicleObj);
            }
            console.log("vehicleArr", vehicleArr);

            // // need else to catch the err or operators without lines running at this time
            var table = new Tabulator("#example-table", {
              data: vehicleArr,
              height: 205, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
              layout: "fitColumns", //fit columns to width of table (optional)
              placeholder: "No data set",
              selectable: 1,
              columns: [
                //Define Table Columns
                {
                  title: "Name",
                  field: "destination",
                  alignEmptyValues: "bottom",
                },
                {
                  title: "Bus Name",
                  field: "id",
                  align: "center",
                },
                {
                  title: "Stop Name",
                  field: "stopname",
                  align: "center",
                },
                { title: "Direction", field: "direction" },
              ],
              // identify row clicked and runs another AJAX to find route
              rowClick: function (e, row) {
                console.log(row._row.data.id);
                var currentVehicleLocation = row._row.data.location;
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
                      console.log(
                        currentVehicleLocation,
                        "currentVehicleLocation"
                      );
                      var vehicleLocationLat = currentVehicleLocation.lat;
                      var vehicleLocationLng = currentVehicleLocation.lng;
                      var routeArr =
                        routeData.Contents.dataObjects.ScheduledStopPoint;
                      var stopname = row._row.data.stopname;
                      var busName = row._row.data.id;

                      // beginning of map
                      function initMap() {
                        console.log(routeArr);
                        const map = new google.maps.Map(
                          document.getElementById("map"),
                          {
                            zoom: 15,
                            center: currentVehicleLocation,
                          }
                        );
                        var routeObj;
                        var routeArrComplete = [];

                        // stopname
                        var vehicleStopName = row._row.data.stopname;
                        console.log(vehicleStopName, "vehicleStopName");

                        setTimeout(geocode, 0);
                        function geocode() {
                          var location = vehicleStopName;
                          axios
                            .get(
                              "https://maps.googleapis.com/maps/api/geocode/json",
                              {
                                params: {
                                  address: location,
                                  key:
                                    "AIzaSyCCCWRpVSxg1uUHP_SEzNr-0UcLGs6P820",
                                },
                              }
                            )
                            .then((stopRef) => {
                              console.log(stopRef, "stopRef");
                              var stopLocation =
                                stopRef.data.results[0].geometry.location;
                              console.log(stopLocation, "stopLocation");
                              var t2 = Date.now() / 1000;
                              var lat2 = vehicleLocationLat;
                              var lon2 = vehicleLocationLng;
                              var t1 = row._row.data.time / 1000;
                              var lat1 = stopLocation.lat;
                              var lon1 = stopLocation.lng;

                              console.log(t2, t1, "Date.now(), row._time");
                              var speed = JSON.stringify(
                                Math.floor(
                                  calcCrow(t1, lat1, lon1, t2, lat2, lon2)
                                )
                              );

                              // distance equation
                              function calcCrow(
                                t1,
                                lat1,
                                lon1,
                                t2,
                                lat2,
                                lon2
                              ) {
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
                                var c =
                                  2 *
                                  Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                                var d = R * c;
                                var speed =
                                  Math.abs(d / (t2 - t1)) * 3600 * 0.621;
                                return speed;
                              }
                              function toRad(Value) {
                                return (Value * Math.PI) / 180;
                              }
                              // end of speed
                              console.log(speed);
                              console.log(routeArrComplete);
                              let vehicleCircle = new google.maps.Circle({
                                strokeColor: "#000",
                                strokeOpacity: 0.8,
                                strokeWeight: 2,
                                fillColor: "#FF0000",
                                fillOpacity: 0.35,
                                map,
                                center: currentVehicleLocation,
                                radius: 45,
                                clickable: true,
                              });

                              var infoWindow = new google.maps.InfoWindow({
                                content: `<h4>${stopname}</h4><h6>Bus Id: ${busName}</h6><p>${speed} mph</p>`,
                              });

                              //add a click event to the circle
                              google.maps.event.addListener(
                                vehicleCircle,
                                "click",
                                function (ev) {
                                  infoWindow.setPosition(ev.latLng);
                                  infoWindow.open(map);
                                }
                              );
                            })
                            .catch((err) => console.log(err));
                        }

                        // circle routes
                        for (let i = 0; i < routeArr.length; i++) {
                          routeObj = {};
                          routeObj["lat"] = JSON.parse(
                            routeArr[i].Location.Latitude
                          );
                          routeObj["lng"] = JSON.parse(
                            routeArr[i].Location.Longitude
                          );
                          routeArrComplete.push(routeObj);

                          const routeCircle = new google.maps.Circle({
                            strokeColor: "#000",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: "#FFF",
                            fillOpacity: 0.35,
                            map,
                            center: routeArrComplete[i],
                            radius: 25,
                          });
                          // return routeArrComplete;
                        }
                      }
                      initMap(routeArr);
                    }
                  },
                });
              },
            });
          } // else {} for 2nd AJAX
        });
        // }
        // setInterval(fetchdata, 2000);
      });
    })
    .catch((err) => {
      if (err) throw err;
    });
});

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
