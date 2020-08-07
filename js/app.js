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
        console.log("operatorVal", operatorVal);

        // // calls the function once
        // fetchdata();
        // // calls function continuously
        // function fetchdata() {
        $.ajax({
          type: "GET",
          url: `http://api.511.org/transit/VehicleMonitoring?api_key=4f536c63-2e63-429d-9261-fb091e63e5f8&agency=${operatorVal}`,
          dataType: "json",
        }).then((vehicleInfo) => {
          if (vehicleInfo) {
            // $("#instructions").text("Select a line option.");
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

              vehicleObj["onwardCall"] =
                vehicleInfoAbb[
                  i
                ].MonitoredVehicleJourney.OnwardCalls.OnwardCall;
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
              height: 300, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
              layout: "fitColumns", //fit columns to width of table (optional)
              placeholder: "No data set",
              selectable: 1,
              headerBackgroundColor: "#e6e6e6",
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
                var clickedVehicle = row._row.data;
                var currentVehicleLocation = clickedVehicle.location;
                var clickedVehicleStopname = clickedVehicle.stopname;
                var clickedBusId = clickedVehicle.id;
                var clickedBusOnward = clickedVehicle.onwardCall;
                console.log("clickedVehicle", clickedVehicle);
                console.log("clickedVehicle.id", clickedVehicle.id);
                console.log("currentVehicleLocation", currentVehicleLocation);
                $.ajax({
                  type: "GET",
                  url: `http://api.511.org/transit/stops?api_key=4f536c63-2e63-429d-9261-fb091e63e5f8&operator_id=${operatorVal}&line_id=${
                    row.getData().id
                  }&Direction_id=${row.getData().direction}`,
                  dataType: "json",
                  success: (routeData) => {
                    if (!routeData) {
                      console.log("no worky");
                    } else {
                      console.log(routeData);
                      // takes the routes api and shows each point in which it'll stop
                      var vehicleLocationLat = currentVehicleLocation.lat;
                      var vehicleLocationLng = currentVehicleLocation.lng;
                      console.log(
                        "vehicleLocation",
                        vehicleLocationLat,
                        vehicleLocationLng
                      );
                      var routeArr =
                        routeData.Contents.dataObjects.ScheduledStopPoint;

                      console.log(
                        "clickedVehicle.direction",
                        clickedVehicle.direction
                      );
                      console.log("routeArr", routeArr);

                      // adds lat and lng
                      for (let i = 0; i < routeArr.length; i++) {
                        routeArr[i].Location["lat"] = JSON.parse(
                          routeArr[i].Location.Latitude
                        );
                        routeArr[i].Location["lng"] = JSON.parse(
                          routeArr[i].Location.Longitude
                        );
                        if (clickedVehicle.stopname == routeArr[i].Name) {
                          routeStopLat = routeArr[i].Location.lat;
                          routeStopLng = routeArr[i].Location.lng;
                        }
                      }

                      console.log(
                        "routeStopLocation",
                        routeStopLat,
                        routeStopLng
                      );

                      // generates routePathArr if there are onwardcalls
                      var routePathArr = [];
                      var routePathObj;
                      var routePathLocationObj;
                      for (
                        let index = 0;
                        index < clickedBusOnward.length;
                        index++
                      ) {
                        for (let i = 0; i < routeArr.length; i++) {
                          if (
                            clickedBusOnward[index].StopPointName ==
                            routeArr[i].Name
                          ) {
                            routePathObj = {};
                            // routePathLocationObj = {};

                            routePathObj["lat"] = routeArr[i].Location.lat;
                            routePathObj["lng"] = routeArr[i].Location.lng;
                            // routePathLocationObj["lat"] =
                            //   routeArr[i].Location.lat;
                            // routePathLocationObj["lng"] =
                            //   routeArr[i].Location.lng;
                            // routePathObj["location"] = routePathLocationObj;
                            // routePathObj["name"] = routeArr[i].Name;
                            routePathArr.push(routePathObj);
                          }
                        }
                      }
                      console.log("routePathArr", routePathArr);
                      // end of routePathArr

                      let routeArrCircle = [];
                      for (let i = 0; i < routeArr.length; i++) {
                        routeObj = {};
                        routeObj["lat"] = routeArr[i].Location.lat;
                        routeObj["lng"] = routeArr[i].Location.lng;
                        routeArrCircle.push(routeObj);
                      }

                      console.log("routeArrCircle", routeArrCircle);

                      function initMap() {
                        console.log(
                          "currentVehicleLocation",
                          currentVehicleLocation
                        );
                        const directionsService = new google.maps.DirectionsService();
                        const directionsRenderer = new google.maps.DirectionsRenderer();
                        const map = new google.maps.Map(
                          document.getElementById("map"),
                          {
                            zoom: 15,
                            center: currentVehicleLocation,
                            // currentVehicleLocation,
                          }
                        );

                        var t2 = Date.now() / 1000;
                        var lat2 = vehicleLocationLat;
                        var lon2 = vehicleLocationLng;
                        var t1 = row._row.data.time / 1000;
                        var lat1 = routeStopLat;
                        var lon1 = routeStopLng;

                        var speed = Math.floor(
                          calcCrow(t1, lat1, lon1, t2, lat2, lon2)
                        );

                        // distance equation
                        function calcCrow(t1, lat1, lon1, t2, lat2, lon2) {
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
                            2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                          var d = R * c;
                          var speed = Math.abs(d / (t2 - t1)) * 3600 * 0.621;
                          return speed;
                        }
                        function toRad(Value) {
                          return (Value * Math.PI) / 180;
                        }
                        // end of speed
                        console.log("speed", speed);

                        // vehicleMarker
                        var vehicleMarker = new google.maps.Marker({
                          position: currentVehicleLocation,
                          map: map,
                          clickable: true,
                          icon: {
                            url:
                              "http://maps.google.com/mapfiles/ms/icons/bus.png",
                            scaledSize: new google.maps.Size(60, 60),
                          },
                        });
                        console.log("routeArrPath", routePathArr);

                        // for (let i = 0; i < routePathArr.length; i++) {
                        const vehiclePath = new google.maps.Polyline({
                          path: routePathArr,
                          // flightPlanCoordinates,
                          geodesic: true,
                          strokeColor: "#FF0000",
                          strokeOpacity: 1.0,
                          strokeWeight: 2,
                        });
                        // }

                        vehiclePath.setMap(map);

                        var infoWindow = new google.maps.InfoWindow({
                          content: `<h4>${clickedVehicleStopname}</h4><h6>Bus Id: ${clickedBusId}</h6><p>${speed} mph</p>`,
                        });

                        //add a click event to the marker
                        google.maps.event.addListener(
                          vehicleMarker,
                          "click",
                          function (ev) {
                            infoWindow.setPosition(ev.latLng);
                            infoWindow.open(map);
                          }
                        );

                        // beginning of circle routes
                        // routes with just lng + lat
                        for (let i = 0; i < routeArr.length; i++) {
                          // route path
                          const routeCircle = new google.maps.Circle({
                            strokeColor: "#000",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: "#FFF",
                            fillOpacity: 0.35,
                            map,
                            center: routeArrCircle[i],
                            radius: 25,
                          });
                        }

                        console.log("routeArrCircle", routeArrCircle);
                        // end of circle routes

                        // directionsRenderer.setMap(map);

                        // const onChangeHandler = function () {
                        //   calculateAndDisplayRoute(
                        //     directionsService,
                        //     directionsRenderer
                        //   );
                        // };

                        // onChangeHandler();
                        // return routeArrCircle;
                      }

                      initMap(routeArr);

                      // function calculateAndDisplayRoute(
                      //   directionsService,
                      //   directionsRenderer
                      // ) {
                      //   var start = routeArrCircle[0];
                      //   var end = routeArrCircle[routeArrCircle.length - 1];
                      //   directionsService.route(
                      //     {
                      //       origin: start,
                      //       destination: end,
                      //       travelMode: google.maps.TravelMode.TRANSIT,
                      //     },
                      //     (response, status) => {
                      //       if (status === "OK") {
                      //         directionsRenderer.setDirections(response);
                      //       } else {
                      //         window.alert(
                      //           "Directions request failed due to " + status
                      //         );
                      //       }
                      //     }
                      //   );
                      // }
                    }
                  },
                });
              },
            });
          } /* else {
            $("#instructions").text("Operator not available.");
          // } // else {} for 2nd AJAX */
        });
        // }
        // setInterval(fetchdata, 30000);
      });
    })
    .catch((err) => {
      if (err) throw err;
    });

  // $.ajax({
  //   type: "GET",
  //   url:
  //     "http://api.511.org/transit/stopplaces?api_key=4f536c63-2e63-429d-9261-fb091e63e5f8&operator_id=SF",
  //   dataType: "json",
  // }).then((res) => {
  //   console.log(res);
  // });
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
