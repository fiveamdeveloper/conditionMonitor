const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const path = require("path");
var mysql = require("mysql2");
const { Kafka } = require("kafkajs");
const port = 3000;
const host = "0.0.0.0";

app.use(express.static("../assets"));

// -------------------------------------------------------
// Create MySql database connection
// -------------------------------------------------------
var db = "monitoringData";
var con = mysql.createConnection({
  host: `${host}`,
  user: "monitor",
  password: "monitor",
  database: db,
});
// was localhost before!

con.connect(function (err) {
  if (err) throw err;
  console.log(`Connected to db: ${db}`);
});

// -------------------------------------------------------
// Create socket.io connection to frontend
// -------------------------------------------------------
io.on("connection", (socket) => {
  // Disconnect routine for socket.io
  console.log("Dashboard connected");
  socket.on("disconnect", () => {
    console.log("Dashboard disconnected");
  });
});

// -------------------------------------------------------
// Simulate live machine data for Kafka Producer
// -------------------------------------------------------
const main = async () => {
  const kafka = new Kafka({
    clientId: "my-app",
    brokers: [`${host}:9092`],
  });
  // was localhost before!

  const consumer = kafka.consumer({ groupId: "test-group" });

  await consumer.connect();
  await consumer.subscribe({ topic: "test-topic", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      // logs processed Kafka message
      console.log({ "received value": `${message.value.toString()}` });

      // -------------------------------------------------------
      // Save data to MySql - is this the wrong place?!
      // -------------------------------------------------------
      //var kafkaDataset = JSON.parse(message.value);
      //kafkaDatasetTime = kafkaDataset.timestamp.toString();
      //console.log(kafkaDataset.timestamp);
      /*con.connect(function (err) {
        if (err) throw err;
        console.log("Connected!");
        var saveKafkaDataset =
          "INSERT INTO maintenance_machine_telemetry (datetime, machineId, volt, rotation, pressure, vibration) VALUES ('2015-12-15 23:59:59', '${kafkaDataSetTime}','${parseInt(kafkaDataset.volt)}','${kafkaDataset.rotation}','${kafkaDataset.pressure}','${kafkaDataset.vibration}')";
        con.query(saveKafkaDataset, function (err, result) {
          if (err) throw err;
          console.log("Statement executed", saveKafkaDataset);
        });
      });
      */
      // serves Kafka Message to socket.io -> Dashboard
      io.emit("machineData", `${message.value.toString()}`);
    },
  });
};

main();

// -------------------------------------------------------
// Serves Dashboard in web browser
// -------------------------------------------------------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

app.get("/machines", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

app.get("/history", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

// -------------------------------------------------------
// API services
// -------------------------------------------------------

app.get("/machines/masterdata", (req, res) => {
  con.query(
    "SELECT * FROM machines_master_data ORDER BY machineId ASC",
    (err, result) => {
      if (err) throw err;
      console.log(result);
      var machines = JSON.stringify(result);
      var machine = JSON.parse(machines);
      res.send(machine);
    }
  );
});

app.get("/machines/history", (req, res) => {
  con.query("SELECT * FROM maintenance_machine_telemetry", (err, result) => {
    if (err) throw err;
    console.log(result);
    var measurements = JSON.stringify(result);
    res.send(JSON.parse(measurements));
  });
});

app.get("/machines/aggregatedfailures", (req, res) => {
  con.query(
    "SELECT * FROM maintenance_machine_aggregated_failures ORDER BY machineId ASC",
    (err, result) => {
      if (err) throw err;
      console.log(result);
      var machines = JSON.stringify(result);
      var machine = JSON.parse(machines);
      res.send(machine);
    }
  );
});

server.listen(port, host, () => {
  console.log("App is listening on", port);
});
