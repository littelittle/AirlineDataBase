-- Active: 1744171703779@@127.0.0.1@3306@library
CREATE DATABASE IF NOT EXISTS AirlineDB;
USE AirlineDB;

-- 城市表
CREATE TABLE City (
    CityID INT AUTO_INCREMENT,
    CityName VARCHAR(50) NOT NULL UNIQUE,
    PRIMARY KEY (CityID)
);

-- 机场表
CREATE TABLE Airport (
    AirportCode CHAR(10) NOT NULL,
    Name VARCHAR(100) NOT NULL,
    CityID INT NOT NULL,
    PRIMARY KEY (AirportCode),
    FOREIGN KEY (CityID) REFERENCES City(CityID)
);

-- 航班表
CREATE TABLE Flight (
    FlightID CHAR(20) NOT NULL,
    AircraftType VARCHAR(50) NOT NULL,
    FirstClassSeats INT NOT NULL CHECK (FirstClassSeats >= 0),
    EconomySeats INT NOT NULL CHECK (EconomySeats >= 0),
    WeeklyFlightDays VARCHAR(50) NOT NULL,
    PRIMARY KEY (FlightID)
);

-- 航班与机场关联表
CREATE TABLE Flight_Airport (
    FlightID CHAR(20) NOT NULL,
    AirportCode CHAR(10) NOT NULL,
    StopOrder INT NOT NULL,
    PRIMARY KEY (FlightID, StopOrder),
    FOREIGN KEY (FlightID) REFERENCES Flight(FlightID),
    FOREIGN KEY (AirportCode) REFERENCES Airport(AirportCode)
);

-- 舱位定价表（含出发机场和终到机场）
CREATE TABLE CabinPricing (
    PricingID INT AUTO_INCREMENT,
    FlightID CHAR(20) NOT NULL,
    DepartureAirportID CHAR(10) NOT NULL,
    ArrivalAirportID CHAR(10) NOT NULL,
    CabinLevel ENUM('Firstclass','Economy') NOT NULL,
    Price DECIMAL(10,2) NOT NULL CHECK (Price > 0),
    DiscountRate DECIMAL(5,2) NOT NULL CHECK (DiscountRate >= 0 AND DiscountRate <= 100),
    PRIMARY KEY (PricingID),
    FOREIGN KEY (FlightID) REFERENCES Flight(FlightID),
    FOREIGN KEY (DepartureAirportID) REFERENCES Airport(AirportCode),
    FOREIGN KEY (ArrivalAirportID) REFERENCES Airport(AirportCode)
);

-- 乘客表
-- CREATE TABLE Passenger (
--     PassengerID INT AUTO_INCREMENT,
--     IDNumber VARCHAR(20) NOT NULL UNIQUE,
--     PassengerName VARCHAR(100) NOT NULL,
--     PRIMARY KEY (PassengerID)
-- );

CREATE TABLE Passenger (
    PassengerID INT PRIMARY KEY AUTO_INCREMENT,
    PassengerName VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(32) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- 售票记录表
CREATE TABLE TicketSale (
    TicketSaleID INT AUTO_INCREMENT,
    PassengerID INT NOT NULL,
    CabinPricingID INT NOT NULL,
    FlightDate DATE NOT NULL,
    Price DECIMAL(10, 2) NOT NULL CHECK (Price >= 0),
    PRIMARY KEY (TicketSaleID),
    FOREIGN KEY (PassengerID) REFERENCES Passenger(PassengerID),
    FOREIGN KEY (CabinPricingID) REFERENCES CabinPricing(PricingID)
);

DELIMITER //

-- 创建 CheckOverbooking 触发器
CREATE TRIGGER CheckOverbooking
BEFORE INSERT ON TicketSale
FOR EACH ROW
BEGIN
    DECLARE SoldFirstClassSeats INT;
    DECLARE SoldEconomySeats INT;
    DECLARE AvailableFirstClassSeats INT;
    DECLARE AvailableEconomySeats INT;
    DECLARE FlightIDForCheck CHAR(20);
    DECLARE TicketCabinLevel VARCHAR(20);

    -- 通过 CabinPricingID 获取 FlightID
    SELECT FlightID 
    INTO FlightIDForCheck
    FROM CabinPricing
    WHERE PricingID = NEW.CabinPricingID;

    -- 通过 CabinPricingID 获取 CabinLevel
    SELECT CabinLevel 
    INTO TicketCabinLevel
    FROM CabinPricing
    WHERE PricingID = NEW.CabinPricingID;

    -- 获取已售出的头等舱座位数
    SELECT COUNT(*) 
    INTO SoldFirstClassSeats
    FROM TicketSale ts
    JOIN CabinPricing cp ON ts.CabinPricingID = cp.PricingID
    WHERE cp.FlightID = FlightIDForCheck AND cp.CabinLevel = 'Firstclass' AND ts.FlightDate = NEW.FlightDate;

    -- 获取已售出的经济舱座位数
    SELECT COUNT(*) 
    INTO SoldEconomySeats
    FROM TicketSale ts
    JOIN CabinPricing cp ON ts.CabinPricingID = cp.PricingID
    WHERE cp.FlightID = FlightIDForCheck AND cp.CabinLevel = 'Economy' AND ts.FlightDate = NEW.FlightDate;

    -- 获取航班的座位数
    SELECT FirstClassSeats, EconomySeats 
    INTO AvailableFirstClassSeats, AvailableEconomySeats
    FROM Flight
    WHERE FlightID = FlightIDForCheck;

    -- 判断是否超售
    IF (TicketCabinLevel = 'Firstclass' AND SoldFirstClassSeats >= AvailableFirstClassSeats) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '头等舱座位已售完，无法完成售票';
    END IF;

    IF (TicketCabinLevel = 'Economy' AND SoldEconomySeats >= AvailableEconomySeats) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '经济舱座位已售完，无法完成售票';
    END IF;
END //

-- 创建 CheckAirportOrder 触发器
CREATE TRIGGER CheckAirportOrder
BEFORE INSERT ON CabinPricing
FOR EACH ROW
BEGIN
    DECLARE DepartureStopOrder INT;
    DECLARE ArrivalStopOrder INT;
    DECLARE FlightIDForCheck CHAR(20);

    -- 获取当前插入记录的 FlightID
    SET FlightIDForCheck = NEW.FlightID;

    -- 获取出发机场的停靠顺序
    SELECT StopOrder 
    INTO DepartureStopOrder
    FROM Flight_Airport
    WHERE FlightID = FlightIDForCheck AND AirportCode = NEW.DepartureAirportID;

    -- 获取到达机场的停靠顺序
    SELECT StopOrder 
    INTO ArrivalStopOrder
    FROM Flight_Airport
    WHERE FlightID = FlightIDForCheck AND AirportCode = NEW.ArrivalAirportID;

    -- 检查出发机场的顺序是否小于到达机场的顺序
    IF DepartureStopOrder >= ArrivalStopOrder THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '出发机场的顺序必须小于到达机场的顺序';
    END IF;
END //


CREATE PROCEDURE BookTicket(
    IN p_PassengerID INT,
    IN p_CabinPricingID INT,
    IN p_FlightDate DATE,
    IN p_Price DECIMAL(10, 2)
)
BEGIN
    -- 声明变量用于检查
    DECLARE v_FlightID CHAR(20);
    DECLARE v_ExistingTickets INT;
    DECLARE v_DepartureAirportID char(10);
    DECLARE v_ArrivalAirportID char(10);

    -- 声明一个退出处理器，用于在发生任何SQL异常时自动回滚事务
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- 发生错误，回滚事务
        ROLLBACK;
        -- 将错误信息重新抛出，以便调用者可以捕获
        RESIGNAL;
    END;

    -- 开启事务
    START TRANSACTION;

    -- 步骤 1: 根据传入的 CabinPricingID 获取航班ID (FlightID)
    -- 这个查询本身也能验证 CabinPricingID 是否有效
    SELECT FlightID, DepartureAirportID, ArrivalAirportID INTO v_FlightID, v_DepartureAirportID, v_ArrivalAirportID
    FROM CabinPricing
    WHERE PricingID = p_CabinPricingID;

    -- 步骤 2: 检查该用户是否已购买过当天的同一航班机票 (你的新要求)
    SELECT COUNT(*)
    INTO v_ExistingTickets
    FROM TicketSale ts
    JOIN CabinPricing cp ON ts.CabinPricingID = cp.PricingID
    WHERE ts.PassengerID = p_PassengerID
      AND cp.FlightID = v_FlightID
      AND ts.FlightDate = p_FlightDate
      AND ((cp.DepartureAirportID = v_DepartureAirportID) OR (cp.ArrivalAirportID = v_ArrivalAirportID));

    -- 如果查询到记录数大于0，说明已购买，则抛出错误
    IF v_ExistingTickets > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '该乘客已购买当天同一航班的机票，无法重复预订。';
    END IF;

    -- 步骤 3: 插入新的售票记录
    -- 这一步会自动触发你已经创建的 `CheckOverbooking` 触发器。
    -- 如果超售，触发器会抛出错误，上面的EXIT HANDLER会捕获到并回滚事务。
    INSERT INTO TicketSale (PassengerID, CabinPricingID, FlightDate, Price)
    VALUES (p_PassengerID, p_CabinPricingID, p_FlightDate, p_Price);

    -- 如果以上所有步骤都成功执行，没有错误发生，则提交事务
    COMMIT;

END //

DELIMITER ;