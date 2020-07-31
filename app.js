$(document).ready(() => {
  // var api_key = 1f826683-3cac-4731-b48f-ee077a45a969;

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

  // $.ajax({
  //   type: "GET",
  //   url: `http://api.511.org/transit/lines?api_key=4f536c63-2e63-429d-9261-fb091e63e5f8&line_id=24`,
  //   dataType: "json",
  //   success: (res) => {
  //     if (!res) {
  //       console.log("no worky");
  //     } else {
  //       console.log(res);
  //     }
  //   },
  // });

  // various stops of the bus
  $.ajax({
    type: "GET",
    url: `http://api.511.org/transit/stops?api_key=4f536c63-2e63-429d-9261-fb091e63e5f8&operator_id=SF&line_id=43`,
    dataType: "json",
    success: (res) => {
      if (!res) {
        console.log("no worky");
      } else {
        var routeArr = res.Contents.dataObjects.ScheduledStopPoint;
        for (let i = 0; i < routeArr.length; i++) {
          console.log(routeArr[i]);
        }
      }
    },
  });

  // various lines/buses that run
  $.ajax({
    type: "GET",
    url: `http://api.511.org/transit/lines?api_key=4f536c63-2e63-429d-9261-fb091e63e5f8&Operator_id=SF`,
    dataType: "json",
    success: (res) => {
      if (!res) {
        console.log("no worky");
      } else {
        console.log(res);
      }
    },
  });
  $.ajax({
    type: "GET",
    url: `http://api.511.org/transit/operators?api_key=4f536c63-2e63-429d-9261-fb091e63e5f8`,
    dataType: "json",
    success: (res) => {
      if (!res) {
        console.log("no worky");
      } else {
        console.log(res);
      }
    },
  });
});

// var table = new Tabulator("#example-table", {
//   height: "800px",
//   layout: "fitColumns", // column size will be adjusted automatically to width
//   paginationSize: 20, // amt of rows
//   placeholder: "No Data Set",
//   columns: [
//     { title: "Id", field: "galleryId", sorter: "number", width: 10 }, // sorter: dataType, width: in %
//     { title: "Title", field: "title", sorter: "string" }, // title property is what's being
//     {
//       title: "Active",
//       field: "isActive",
//       align: "center",
//       formatter: "tickCross",
//       sorter: "boolean",
//     }, // formatter: tick or cross
//     {
//       title: "Featured",
//       field: "isFeatured",
//       align: "center",
//       formatter: "tickCross",
//       sorter: "boolean",
//     },
//     {
//       title: "Created",
//       field: "timeCreated",
//       sorter: "data",
//       align: "center",
//       formatter: (cell) => {
//         var convertTime = new Date(cell.getValue().UTCString()); // getValue() method from tabulator
//         return convertTime;
//       },
//     },
//     {
//       title: "Updated",
//       field: "lastUpdated",
//       sorter: "data",
//       align: "center",
//       formatter: (cell) => {
//         var conTime = new Date(cell.getValue().UTCString()); // getValue() method from tabulator
//         return conTime;
//       },
//     },
//     { title: "Username", field: "username", sorter: "string", align: "center" },
//     { title: "Type", field: "galleryType", sorter: "string", align: "center" },
//     {
//       title: "Actions",
//       sortable: false, // sortable: unable to be sorted
//       align: "center",
//       formatter: (cell) => {
//         // everytime formatter is used, have to return some value
//         // cells are used to store the data
//         var galId = cell.getData().galleryId;
//         var galTitle = cell.getData().title;
//         var active = cell.getData().isActive;
//         var featured = cell.getData().isFeatured;
//         var created = cell.getData().timeCreated;
//         var lastUpdated = cell.getData().lastUpdated;
//         var username = cell.getData().username;
//         var galleryType = cell.getData().galleryType;
//       },
//     },
//   ],
// });

var table = new Tabulator("#example-table", {
  height: 205, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
  layout: "fitColumns", //fit columns to width of table (optional)
  columns: [
    //Define Table Columns
    { title: "Name", field: "name", width: 125 },
    { title: "Age", field: "age", align: "left", formatter: "progress" },
    { title: "Favourite Color", field: "col" },
    { title: "Date Of Birth", field: "dob", sorter: "date", align: "center" },
  ],
  rowClick: function (e, row) {
    //trigger an alert message when the row is clicked
    alert("Row " + row.getData().id + " Clicked!!!!");
  },
});

//define some sample data
var tabledata = [
  { id: 1, name: "Oli Bob", age: "12", col: "red", dob: "" },
  { id: 2, name: "Mary May", age: "1", col: "blue", dob: "14/05/1982" },
  {
    id: 3,
    name: "Christine Lobowski",
    age: "42",
    col: "green",
    dob: "22/05/1982",
  },
  {
    id: 4,
    name: "Brendon Philips",
    age: "125",
    col: "orange",
    dob: "01/08/1980",
  },
  {
    id: 5,
    name: "Margret Marmajuke",
    age: "16",
    col: "yellow",
    dob: "31/01/1999",
  },
];

//load sample data into the table
table.setData(tabledata);

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
