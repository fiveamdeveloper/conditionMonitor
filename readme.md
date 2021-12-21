# Distribute Node.js Apps

Build a docker file

## Dashboard App

docker build -t dashboard-app .

## Kafka Producer App

docker build -t kafka-producer-app .

# Accesing MySQL database within the container

Access the database e.g. https://towardsdatascience.com/how-to-run-mysql-using-docker-ed4cebcd90e4
docker exec -it conditionmonitor_db_1 bash
mysql -uroot -proot (connect with root to mysql)

## Check for existing data in the db init

SHOW DATABASES; (";" is important at the end of each line)
USE monitoringData; (replace db_name with db_name of conditionMonitoring project)
SHOW TABLES; (shows all tables)
SELECT \* FROM maintenance_machine_telemetry;

## Create an example entry for telemetry

# Expose container ports to localhost

docker run -it --expose 8008 -p 8008:8008 myContainer // change myContainer

# Kafka Image

docker pull bitnami/kafka
https://hub.docker.com/r/bitnami/kafka/

# Startup docker

docker-compose up -d (-d shows details)

# Kill docker

docker-compose down -d

# Get ingress data from Kafka

cd /Users/felix/OneDrive\ -\ CONSILIO\ GmbH/Dokumente/40_Weiterbildung/Dualer\ Master/10_Vorlesungsunterlagen/Semester\ 2/Data\ Science\ \&\ Big\ Data/Big\ Data/Prüfungsleistung/conditionMonitor

docker-compose exec kafka bash
kafka-console-consumer --topic test-topic --bootstrap-server localhost:9092 --from-beginning

# Install PySpark

Prerequisites: brew install python
pip3 install pyspark
pip3 install mysqlx
