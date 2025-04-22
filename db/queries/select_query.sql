-- Active: 1744268725013@@127.0.0.1@3306@airlinedb
SELECT F.FlightID
FROM Flight F
JOIN Flight_Airport FA1 ON F.FlightID = FA1.FlightID 
JOIN Airport A1 ON FA1.AirportCode = A1.AirportCode
JOIN City C1 ON A1.CityID = C1.CityID
JOIN Flight_Airport FA2 ON F.FlightID = FA2.FlightID AND FA2.StopOrder > FA1.StopOrder
JOIN Airport A2 ON FA2.AirportCode = A2.AirportCode
JOIN City C2 ON A2.CityID = C2.CityID
WHERE C1.CityName = 'Beijing' AND C2.CityName = 'Shanghai'
AND FA2.StopOrder = (SELECT MAX(StopOrder) FROM Flight_Airport WHERE FlightID = F.FlightID);


SELECT Price
FROM CabinPricing
WHERE FlightID = 'CA123'
AND DepartureAirportID = 'PEK'
AND ArrivalAirportID = 'SHA'
AND CabinLevel = 'Economy';

SELECT F.EconomySeats - COUNT(TS.TicketSaleID) AS AvailableSeats
FROM Flight F
LEFT JOIN CabinPricing CP ON F.FlightID = CP.FlightID AND CP.CabinLevel = 'Economy'
LEFT JOIN TicketSale TS ON CP.PricingID = TS.CabinPricingID AND TS.FlightDate = '2023-10-01'
WHERE F.FlightID = 'CA123'
GROUP BY F.FlightID, F.EconomySeats;

SELECT P.PassengerName
FROM Passenger P
JOIN TicketSale TS ON P.PassengerID = TS.PassengerID
JOIN CabinPricing CP ON TS.CabinPricingID = CP.PricingID
WHERE CP.FlightID = 'CA123' AND TS.FlightDate = '2023-10-01';