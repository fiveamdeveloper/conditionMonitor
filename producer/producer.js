const { Kafka } = require("kafkajs");
const host = "0.0.0.0";

// Intervall data gets generated
const simulationInterval = 1000;

function simulateMonitoringData() {
  // generates random machine number between 1 and 5
  var machineId = (Math.random() * 5 + 1).toFixed(0);
  var timestamp = new Date();
  timestamp = timestamp.toISOString().slice(0, 19).replace("T", " ");
  //var machineId = numberToGenerate;

  // value limits voltage
  const minVoltage = 1150;
  const maxVoltage = 1175;

  // value limit pressure
  const maxPressure = 145;

  // value limit rotation
  const maxRotation = 3000;

  // value limit vibration
  const maxVibration = 60;

  // random value generation with 2 decimals
  var voltage = (
    Math.random() * (maxVoltage - minVoltage) +
    minVoltage
  ).toFixed(2);
  var rotation = (Math.random() * maxRotation).toFixed(2);
  var pressure = (Math.random() * maxPressure).toFixed(2);
  var vibration = (Math.random() * maxVibration).toFixed(2);

  // dataset is sent to Kafka later
  var dataset = {
    timestamp,
    machineId,
    voltage,
    rotation,
    pressure,
    vibration,
  };
  // Update timestamp if data != now
  setInterval(function () {
    if (!Date.now) {
      Date.now = function now() {
        return timestamp;
      };
    }
  });
  console.log(dataset);
  return dataset;
}

//simulateMonitoringData(5);

const main = async () => {
  const kafka = new Kafka({
    clientId: "my-app",
    brokers: [`${host}:9092`],
  });

  const producer = kafka.producer();
  await producer.connect();

  await producer.send({
    topic: "test-topic",
    messages: [{ value: JSON.stringify(simulateMonitoringData()) }],
  });

  await producer.disconnect();
};

setInterval(main, simulationInterval);
