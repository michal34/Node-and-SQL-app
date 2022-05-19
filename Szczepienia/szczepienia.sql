USE master
GO

DROP DATABASE IF EXISTS Szczepienia
GO

CREATE DATABASE Szczepienia
GO

USE Szczepienia
GO

CREATE TABLE Placówki (
    Id INT IDENTITY PRIMARY KEY,
    Miasto VARCHAR(30) NOT NULL,
    Ulica VARCHAR(30) NOT NULL,
    NumerBudynku INT NOT NULL
)

CREATE TABLE Dawki (
    Id INT IDENTITY PRIMARY KEY,
    PlacówkaId INT NOT NULL REFERENCES Placówki (Id),
    Producent VARCHAR(30) NOT NULL,
    LiczbaDawek INT NOT NULL,
    TerminOd DATE NOT NULL,
    TerminDo DATE NOT NULL
)

CREATE TABLE Pacjenci (
    Id INT IDENTITY PRIMARY KEY,
    DawkaId INT NOT NULL REFERENCES Dawki(Id),
    Imie VARCHAR(20) NOT NULL,
    Nazwisko VARCHAR(20) NOT NULL,
    DataSzczepienia DATE NOT NULL,
    Login VARCHAR(20) NOT NULL,
    Haslo VARCHAR(20) NOT NULL
)

CREATE LOGIN szczepieniaUser WITH PASSWORD = 'szczepieniaHaslo321'
GO

CREATE USER szczepieniaUser FOR LOGIN szczepieniaUser
GO

EXEC sp_addrolemember 'db_datawriter', 'szczepieniaUser'
EXEC sp_addrolemember 'db_datareader', 'szczepieniaUser'

INSERT INTO Placówki VALUES('Warszwa', 'Generała Władysława Andersa',37)
INSERT INTO Dawki VALUES(1, 'Pfizer', 200, '05-05-2021', '07-07-2021')
INSERT INTO Pacjenci VALUES(1, 'Admin', 'Admin', '01-06-2021', 'Admin', 'Admin123')