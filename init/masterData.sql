CREATE TABLE maintenance_machine_telemetry (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `datetime` DATETIME,
    `machineId` INTEGER NOT NULL,
    `volt` FLOAT NOT NULL,
    `rotation` FLOAT NOT NULL,
    `pressure` FLOAT NOT NULL,
    `vibration` FLOAT NOT NULL,
    PRIMARY KEY (`id`, `datetime`, `machineID`)
);

CREATE TABLE machines_master_data (
    `machineId` INTEGER NOT NULL,
    `model` VARCHAR(255) NOT NULL,
    `manufacturingYear` INTEGER NOT NULL,
    PRIMARY KEY (`machineID`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE maintenance_machine_failures (
    `datetime` DATETIME,
    `machineId` INTEGER NOT NULL,
    `error` TEXT NOT NULL,
    PRIMARY KEY (`datetime`, `machineID`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE maintenance_machine_aggregated_failures (
    `machineId` INTEGER NOT NULL,
    `error` VARCHAR(255) NOT NULL,
    `count` INTEGER NOT NULL,
    PRIMARY KEY (`machineID`, `error`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO
    machines_master_data(machineID, model, manufacturingYear)
VALUES
    (1, 'DMG CLX 350', 2015),
    (2, 'DMG CTX beta 2000', 2017),
    (3, 'DMG CTX beta 2000 TC', 2019),
    (4, 'DMG CTX gamma 3000 TC', 2019),
    (5, 'DMG WASINO G 100 | 300', 2020);

INSERT INTO
    maintenance_machine_telemetry (
        datetime,
        machineId,
        volt,
        rotation,
        pressure,
        vibration
    )
VALUES
    (
        '2015-12-15 23:59:59',
        '1',
        '1225',
        '1500',
        '25',
        '10'
    );

INSERT INTO
    maintenance_machine_aggregated_failures (
        machineId,
        error,
        count
    )
VALUES
    (
        '1',
        'Drehzahl überschritten',
        '3'
    ),
    (
        '4',
        'Spannung unterschritten',
        '1'
    );