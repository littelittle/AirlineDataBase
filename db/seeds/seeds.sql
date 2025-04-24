USE AirlineDB;

INSERT INTO City VALUES 
(1, 'Beijing'), 
(2, 'Shanghai'), 
(3, 'Guangzhou');

INSERT INTO Airport (AirportCode, Name, CityID) VALUES
('PEK', 'Beijing Capital International Airport', 1),
('SHA', 'Shanghai Hongqiao International Airport', 2),
('CAN', 'Guangzhou Baiyun International Airport', 3);

INSERT INTO Flight (FlightID, AircraftType, FirstClassSeats, EconomySeats, WeeklyFlightDays) VALUES
('CA123', 'Boeing 737', 20, 150, 'Mon, Wed, Fri'),
('MU456', 'Airbus A320', 15, 160, 'Tue, Thu, Sat');

INSERT INTO Flight_Airport (FlightID, AirportCode, StopOrder) VALUES
('CA123', 'PEK', 1),
('CA123', 'SHA', 2),
('MU456', 'SHA', 1),
('MU456', 'CAN', 2);

INSERT INTO CabinPricing (FlightID, DepartureAirportID, ArrivalAirportID, CabinLevel, Price, DiscountRate) VALUES
('CA123', 'PEK', 'SHA', 'Firstclass', 1500.00, 0),
('CA123', 'PEK', 'SHA', 'Economy', 800.00, 0),
('MU456', 'SHA', 'CAN', 'Firstclass', 1800.00, 0),
('MU456', 'SHA', 'CAN', 'Economy', 900.00, 0);

INSERT INTO Passenger (IDNumber, PassengerName) VALUES
('123456789012345678', 'Zhang San'),
('987654321098765432', 'Li Si');

INSERT INTO TicketSale (PassengerID, CabinPricingID, FlightDate) VALUES
(1, 2, '2023-10-01'),  -- Zhang San 订购 CA123 经济舱
(2, 4, '2023-10-02');  -- Li Si 订购 MU456 经济舱