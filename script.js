
document.addEventListener("DOMContentLoaded", function () {
  function generateCSV(dataObj) {
    return Object.values(dataObj)
      .map((value) => `${value}`)
      .join(",");
  }
  let downloadIcon = function (cell, formatterParams) {
    return '<i id ="sel" class="fa-solid fa-download"></i>';
  };

  var table = new Tabulator("#example-table", {
    data: dataToUpdate,
    maxWidth: "100%",
    layout: "fitColumns",
    movableRows: true, //enable user movable rows
    selectable: true,
    pagination: "local",
    dataTree: true,
    dataTreeStartExpanded: false,
    dataTreeFilter: false,
    downloadConfig: {
      dataTree: true,
      columnHeader: { download: false, delete: false },
    },
    // downloadRowRange:"selected",
    persistence: true,
    paginationSize: 20,
    paginationCounter: "rows",
    paginationSizeSelector: [10, 20, 50, 100, true],
    data: [], // Initialize with an empty dataset
    persistenceWriterFunc: function (id, type, data) {
      localStorage.setItem("loca", JSON.stringify(dataToUpdate));
      console.log("setItem triggered " + id + " " + type + " " + data);
    },
    persistenceReaderFunc: function (id, type) {
      storedData = localStorage.getItem("tabularData");
      console.log("getitemtriggered-> " + id + " " + type + " ");

      return storedData ? JSON.parse(storedData) : false;
    },
    columns: [
      {
        rowHandle: true,
        formatter: "handle",
        headerSort: false,
        frozen: true,
        width: 30,
        minWidth: 30,
      },
      {
        title: "Number",
        field: "number",
        sorter: "number",
        headerFilter: "input",
        headerFilterFunc: customSearchFilter,
        headerFilterLiveFilter: false,
        cellClick: function (e, cell) {
          let rowData = cell.getRow().getData();
          console.log(rowData);
        },
      },
      {
        title: "id",
        field: "id",
        visibile: false,
      },
      {
        title: "Date Time",
        field: "datetime",
        sorter: "datetime",
        headerFilter: "input",
      },
      {
        title: "Text",
        field: "text",
        headerFilter: "input",
        headerFilterFunc: customSearchFilter2,
        headerFilterLiveFilter: false,
      },
      {
        title: "Delete",
        field: "delete",
        print: false,
        formatter: "buttonCross", // Using built-in cross button formatter
        headerSort: false,
        download: false,
        cellClick: function (e, cell) {
          var row = cell.getRow();
          row.delete();
        },
      },
      {
        title: "Download",
        formatter: downloadIcon,
        print: false,
        download: false,
        headerSort: false,
        cellClick: function (e, cell) {
          // Get the selected rows and their child data
          document.getElementById("sel").addEventListener("click", () => {
            e.preventDefault();
            cell.getRow().select();
          });
          var selectedRows = table.getSelectedData(true);
          var csvData = [];

          selectedRows.forEach((row) => {
            // Get the row data excluding the "delete" column
            var rowData = { ...row };

            // Remove the "delete" column from the row data
            delete rowData.delete;

            // Flatten and stringify child data
            if (rowData.hasOwnProperty("_children")) {
              rowData.children = JSON.stringify(rowData._children);
            }
            delete rowData._children;

            csvData.push(rowData);
          });

          // Create CSV content
          var csvContent = "data:text/csv;charset=utf-8,";

          // Add headers excluding the "delete" column
          var headers =
            Object.keys(csvData[0])
              .filter((header) => header !== "delete" || key !== "_children") // Exclude the "delete" column header
              .join(",") + "\n";
          csvContent += headers;

          // Add row data excluding the "delete" column
          csvData.forEach(function (row) {
            var values = Object.keys(row)
              .filter((key) => key !== "delete" || key !== "_children") // Exclude the "delete" column
              .map((key) => {
                var value = row[key];
                if (typeof value === "string") {
                  // Escape double quotes and add double quotes around string values
                  return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
              })
              .join(",");
            csvContent += values + "\n";
          });

          // Create a download link
          var encodedUri = encodeURI(csvContent);
          var downloadLink = document.createElement("a");
          downloadLink.setAttribute("href", encodedUri);
          downloadLink.setAttribute("download", "selectedRows.csv");
          document.body.appendChild(downloadLink); // Required for Firefox
          downloadLink.click();
        },
      },
    ],
  });

  // Define a custom filter function to search within both parent and children fields
  function customSearchFilter(headerValue, rowValue, rowData, filterParams) {
    let matchFound = false;
    // Search in the parent field
    if (
      String(rowValue).toLowerCase().includes(String(headerValue).toLowerCase())
    ) {
      matchFound = true;
    }

    // Search in the children fields
    if (rowData._children) {
      for (let i = 0; i < rowData._children.length; i++) {
        let childValue = rowData._children[i].number;
        if (
          childValue !== null &&
          childValue !== undefined &&
          String(childValue)
            .toLowerCase()
            .includes(String(headerValue).toLowerCase())
        ) {
          matchFound = true;

          break;
        }
      }
    }

    return matchFound;
  }
  function customSearchFilter2(headerValue, rowValue, rowData, filterParams) {
    // Search in the parent field
    if (
      String(rowValue).toLowerCase().includes(String(headerValue).toLowerCase())
    ) {
      return true;
    }

    // Search in the children fields
    if (rowData._children) {
      for (let i = 0; i < rowData._children.length; i++) {
        let childValue = rowData._children[i].text;
        if (childValue === (null || undefined)) {
          childValue = rowData._children[i].text;
        }
        if (
          String(childValue)
            .toLowerCase()
            .includes(String(headerValue).toLowerCase())
        ) {
          return true;
        }
      }
    }

    return false;
  }

  if (table.Built) {
    table
      .updateData(dataToUpdate)
      .then(() => {
        console.log("data update success!");
      })
      .catch((e) => {
        console.log("exception during updation: " + e);
      });
  }
  var storedData = localStorage.getItem("tabularData");
  var dataToUpdate = storedData ? JSON.parse(storedData) : [];

  function saveDataLocally(data) {
    localStorage.setItem("tabularData", JSON.stringify(data));
  }
  document.getElementById("print-table").addEventListener("click", function () {
    table.print(false, true);
  });
  document.addEventListener("DOMContentLoaded", () => {});
  function clickButton() {
    var button = document.getElementById("addDataButton");
    if (button) {
      button.click(); // Trigger click on the button
      console.log("btn clicked!");
    }
  }

  function addRandomData() {
    var newData = [];
    for (var i = 0; i < 100; i++) {
       
     { newData.push({
        number: Math.floor(Math.random() * 1000),
        id: i,
        datetime: getCurrentDateTime(),
        text: "Text " + Math.floor(Math.random() * 100),
        _children: [
          {
            id: i + 0.5,
            number: Math.floor(Math.random() * 1000),
            datetime: getCurrentDateTime(),
            text: "Some Random Text",
            _children: [
              {
                id: i + 0.5,
                number: Math.floor(Math.random() * 1000),
                datetime: getCurrentDateTime(),
                text: "Some Random Text",
              },
            ],
          }, //child rows nested under billy bob
          {
            id: i + 1.5,
            number: Math.floor(Math.random() * 1000),
            datetime: getCurrentDateTime(),
            text: "Some Random Text",
          }, //child rows nested under billy bob
          {
            id: i + 2.5,
            number: Math.floor(Math.random() * 1000),
            datetime: getCurrentDateTime(),
            text: "Some Random Text",
          }, //child rows nested under billy bob
        ],
      }); 
    }}

    // Hide a specific column by its field name
    table.hideColumn("id");

    table.addData(newData).then(() => {
      // alert("Data added successfully!");
    });
    table.setPage(1); // Reset to the first page after adding data
    saveDataLocally(table.getData());
  }

  //date time function
  function getCurrentDateTime() {
    let now = moment();
    var dateTimeNow = now.format("DD-MM-YYYY HH:mm:ss");

    return dateTimeNow;
  }

  // Usage example
  const dateTime = getCurrentDateTime();
  console.log(dateTime); // Output: DD-MM-YYYY HH:MM:SS

  function updateColumnCount() {
    document.getElementById("columnCount").value = `${
      table.getColumns().length
    } / ${table.columnManager.columns.length}`;
  }

  //display rows.
  var intervalId = window.setInterval(function () {
    updateRowCount();
  }, 1000);
  var interval = window.setTimeout(function () {
    addRandomData();
  });
  // setTimeout

  // Function to update row count
  function updateRowCount() {
    var visibleRowCount = table.getPageSize();
    var totalRowCount = table.getDataCount();
    document.getElementById("visibleRowCount").innerText = visibleRowCount;
    document.getElementById("totalRowCount").innerText = totalRowCount;
  }

  document
    .getElementById("download-excel")
    .addEventListener("click", function () {
      console.log("Excel button clicked");

      // Get the current date and time to use in the file name
      const currentTime = getCurrentDateTime();
      const fileName = `TabulatorData-${currentTime}.csv`.replaceALl(":","-");

      // Download the file with the updated file name
      table.download("csv", fileName, { sheetName: "MyData" });
    });

  document.getElementById("pdf-import").addEventListener("click", function () {
    console.log("pdf import button clicked!");
    table.import("csv", ".csv");
  });

  document
    .getElementById("download-pdf")
    .addEventListener("click", function () {
      console.log("PDF button clicked");
      table.download("pdf", "data.pdf", {
        orientation: "portrait",
        title: "Tabulator Data",
      });
    });

  function goToPage() {
    var pageNumber = document.getElementById("pageNumberInput").value;
    if (pageNumber && !isNaN(pageNumber)) {
      table.setPage(parseInt(pageNumber));
    }
  }

  document
    .getElementById("addDataButton")
    .addEventListener("click", addRandomData);
});
