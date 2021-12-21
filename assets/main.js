const dashboardView = document.getElementById("dashboard");
const masterDataView = document.getElementById("machineMasterData");
const apiMasterData = "machines/masterdata";
const apiHistory = "machines/history";
const apiAggregatedFailures = "machines/aggregatedfailures";

if (window.location.pathname == "/machines") {
  console.log("Master Data view opened");
  dashboardView.style.display = "none";
  historyView.style.display = "none";
  masterDataView.style.display = "block";

  // fetch and show machine data
  fetch(apiMasterData)
    // converts response into JSON
    .then((res) => res.json())
    // data is passed into a for loop
    .then((res) => {
      const machineSummary = document.getElementById("machineData");
      var presentYear = new Date();

      for (i = 0; i < res.length; i++) {
        machineSummary.insertAdjacentHTML(
          "afterbegin",
          `<tr>
          <th scope="row">${res[i].machineId}</th>
          <td>${res[i].model}</td>
          <td>${res[i].manufacturingYear}</td>
          <td>${presentYear.getFullYear() - parseInt(res[i].manufacturingYear)}
          </td>
          </tr>`
        );
      }
    });
}

if (window.location.pathname == "/") {
  dashboardView.style.display = "block";
  masterDataView.style.display = "none";
  historyView.style.display = "none";

  fetch(apiMasterData)
    // converts response into JSON
    .then((res) => res.json())
    // data is passed into a for loop
    .then((res) => {
      for (i = 0; i < res.length; i++) {
        var machineSelector = document.getElementById("machineSelector");
        var addOption = document.createElement("option");
        addOption.text = `${res[i].machineId} | ${res[i].model}`;
        addOption.value = `${res[i].machineId}`;
        machineSelector.appendChild(addOption);
      }
    });

  // Fetches failures aggregated on machine -> output of PySpark.py
  fetch(apiAggregatedFailures)
    .then((res) => res.json())
    .then((res) => {
      const failureSummary = document.getElementById("failureSummary");

      for (i = 0; i < res.length; i++) {
        failureSummary.insertAdjacentHTML(
          "afterbegin",
          `<th scope="row">${res[i].machineId}</th>
          <td>${res[i].error}</td>
          <td>${res[i].count}</td>`
        );
      }
      if (res.length != "") {
        document.getElementById("errorAlert").style.display = "block";
      }
    });
  //
}

if (window.location.pathname == "/history") {
  console.log("Measurement history view opened");
  dashboardView.style.display = "none";
  masterDataView.style.display = "none";
  historyView.style.display = "block";

  // fetch and show machine data
  fetch(apiHistory)
    // converts response into JSON
    .then((res) => res.json())
    // data is passed into a for loop
    .then((res) => {
      const historyData = document.getElementById("historyData");

      for (i = 0; i < res.length; i++) {
        historyData.insertAdjacentHTML(
          "afterbegin",
          `<tr>
          <th scope="row">${res[i].datetime}</th>
          <td>${res[i].machineId}</td>
          <td>${res[i].volt}</td>
          <td>${res[i].rotation}</td>
          <td>${res[i].pressure}</td>
          <td>${res[i].vibration}</td>
          </tr>`
        );
      }
    });
}
