from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import (
    IntegerType,
    StringType,
    FloatType,
    StructType,
    TimestampType,
)
import mysqlx

# MySQL Connection
dbOptions = {
    "host": "localhost",  # conditionMonitor DB
    "port": 3306,
    "user": "monitor",
    "password": "monitor",
    "database": "monitoringData",
}

# Create a spark session
spark = (
    SparkSession.builder.appName("conditionMonitor")
    .master("local[*]")
    .config("spark.driver.bindAddress", "127.0.0.1")
    .getOrCreate()
)

# Set log level
spark.sparkContext.setLogLevel("WARN")

# Create dataFrame from Kafka data
df = (
    spark.readStream.format("kafka")
    .option("kafka.bootstrap.servers", "kafka:9092")
    .option("subscribe", "test-topic")
    .option("startingOffsets", "earliest")
    .load()
)


# Define schema of monitoring data
monitoringData = (
    StructType()
    .add("timestamp", StringType())
    .add("machineId", IntegerType())
    .add("voltage", FloatType())
    .add("rotation", FloatType())
    .add("pressure", FloatType())
    .add("vibration", FloatType())
)

# Output data
df = spark.createDataFrame(monitoringData)
df.printSchema()

# Convert value: binary -> JSON -> fields + parsed timestamp
monitoringData = (
    kafkaMessages.select(  # Extract 'value' from Kafka message (i.e., the tracking data) \
        from_json(column("value").cast("string"), monitoringData).alias("json")
    )
    .select(  # Convert Unix timestamp to TimestampType \
        from_unixtime(column("json.timestamp"))
        .cast(TimestampType())
        .alias("parsed_timestamp"),  # Select all JSON fields \
        column("json.*"),
    )
    .withColumnRenamed("json.machineId", "machineId")
    .withColumnRenamed("json.voltage", "voltage")
    .withColumnRenamed("json.rotation", "rotation")
    .withColumnRenamed("json.pressure", "pressure")
    .withColumnRenamed("json.vibration", "vibration")
    .withWatermark("parsed_timestamp")
)

# error calculation for voltage
errorVoltage = (
    monitoringData.where(col("voltage") > 1175)
    .groupBy(
        window(  # Check if it must be adapted \
            column("parsed_timestamp"),
        ),
        column("voltage"),
        column("machineID"),
    )
    .count()
    .withColumnRenamed("count", "number_error")
)

# error calculation for rotation
errorRotation = (
    monitoringData.where(col("rotation") > 3000)
    .groupBy(
        window(  # Check if it must be adapted \
            column("parsed_timestamp"),
        ),
        column("rotation"),
        column("machineID"),
    )
    .count()
    .withColumnRenamed("count", "number_error")
)

# error calculation for pressure
errorPressure = (
    monitoringData.where(col("pressure") > 145)
    .groupBy(
        window(
            # Check if it must be adapted
            column("parsed_timestamp"),
        ),
        column("pressure"),
        column("machineID"),
    )
    .count()
    .withColumnRenamed("count", "number_error")
)

# error calculation for vibration
errorVibration = (
    monitoringData.where(col("vibration") >60)
    .groupBy(
        window(
            # Check if it must be adapted
            column("parsed_timestamp"),
        ),
        column("vibration"),
        column("machineID"),
    )
    .count()
    .withColumnRenamed("count", "number_error")
)


# Start running the query; print running counts to the console
consoleDump = (
    errorVoltage.writeStream.trigger(processingTime=slidingDuration)
    .outputMode("update")
    .format("console")
    .option("truncate", "false")
    .start()
)

# Start running the query; print running counts to the console
consoleDump = (
    errorRotation.writeStream.trigger(processingTime=slidingDuration)
    .outputMode("update")
    .format("console")
    .option("truncate", "false")
    .start()
)

# Start running the query; print running counts to the console
consoleDump = (
    errorPressure.writeStream.trigger(processingTime=slidingDuration)
    .outputMode("update")
    .format("console")
    .option("truncate", "false")
    .start()
)

# Start running the query; print running counts to the console
consoleDump = (
    errorVibration.writeStream.trigger(processingTime=slidingDuration)
    .outputMode("update")
    .format("console")
    .option("truncate", "false")
    .start()
)

# Save to database
def saveToDatabaseVoltage(batchDataframe, batchId):
    # for voltage error
    # Define function to save a dataframe to mysql
    def save_to_db(iterator):
        # Connect to database and use schema
        session = mysqlx.get_session(dbOptions)
        session.sql("USE errorVoltage").execute()

        for row in iterator:
            # Run upsert (insert or update existing)
            sql = session.sql(
                "UPDATE maintenance_machine_failures_consolidated "
                "SET number_error = number_error + ? "
                "WHERE machineID = ? AND error = 'Voltage'"
            )
            sql.bind(row.machineID, row.number_error).execute()

        session.close()

    # Perform batch UPSERTS per data partition
    batchDataframe.foreachPartition(save_to_db)


def saveToDatabaseRotation(batchDataframe, batchId):
    # for rotation error
    # Define function to save a dataframe to mysql
    def save_to_db(iterator):
        # Connect to database and use schema
        session = mysqlx.get_session(dbOptions)
        session.sql("USE errorRotation").execute()

        for row in iterator:
            # Run upsert (insert or update existing)
            sql = session.sql(
                "UPDATE maintenance_machine_failures_consolidated "
                "SET number_error = number_error + ? "
                "WHERE machineID = ? AND error = 'Rotation'"
            )
            sql.bind(row.machineID, row.number_error).execute()

        session.close()

    # Perform batch UPSERTS per data partition
    batchDataframe.foreachPartition(save_to_db)


def saveToDatabasePressure(batchDataframe, batchId):
    # for pressure error
    # Define function to save a dataframe to mysql
    def save_to_db(iterator):
        # Connect to database and use schema
        session = mysqlx.get_session(dbOptions)
        session.sql("USE errorPressure").execute()

        for row in iterator:
            # Run upsert (insert or update existing)
            sql = session.sql(
                "UPDATE maintenance_machine_failures_consolidated "
                "SET number_error = number_error + ? "
                "WHERE machineID = ? AND error = 'Pressure'"
            )
            sql.bind(row.machineID, row.number_error).execute()

        session.close()

    # Perform batch UPSERTS per data partition
    batchDataframe.foreachPartition(save_to_db)


def saveToDatabaseVibration(batchDataframe, batchId):
    # for vibration errors
    # Define function to save a dataframe to mysql
    def save_to_db(iterator):
        # Connect to database and use schema
        session = mysqlx.get_session(dbOptions)
        session.sql("USE errorVibration").execute()

        for row in iterator:
            # Run upsert (insert or update existing)
            sql = session.sql(
                "UPDATE maintenance_machine_failures_consolidated "
                "SET number_error = number_error + ? "
                "WHERE machineID = ? AND error = 'Vibration'"
            )
            sql.bind(row.machineID, row.number_error).execute()

        session.close()

    # Perform batch UPSERTS per data partition
    batchDataframe.foreachPartition(save_to_db)


# execute saves
dbInsertStreamVoltage = (
    errorVoltage.writeStream.trigger(processingTime=slidingDuration)
    .outputMode("update")
    .foreachBatch(saveToDatabaseVoltage)
    .start()
)

dbInsertStreamRotation = (
    errorRotation.writeStream.trigger(processingTime=slidingDuration)
    .outputMode("update")
    .foreachBatch(saveToDatabaseRotation)
    .start()
)

dbInsertStreamPressure = (
    errorPressure.writeStream.trigger(processingTime=slidingDuration)
    .outputMode("update")
    .foreachBatch(saveToDatabasePressure)
    .start()
)

dbInsertStreamVibration = (
    errorVibration.writeStream.trigger(processingTime=slidingDuration)
    .outputMode("update")
    .foreachBatch(saveToDatabaseVibration)
    .start()
)

# Wait for termination
spark.streams.awaitAnyTermination()
