-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: airlinedb
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `airport`
--

DROP TABLE IF EXISTS `airport`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `airport` (
  `AirportCode` char(10) NOT NULL,
  `Name` varchar(100) NOT NULL,
  `CityID` int NOT NULL,
  PRIMARY KEY (`AirportCode`),
  KEY `CityID` (`CityID`),
  CONSTRAINT `airport_ibfk_1` FOREIGN KEY (`CityID`) REFERENCES `city` (`CityID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `airport`
--

LOCK TABLES `airport` WRITE;
/*!40000 ALTER TABLE `airport` DISABLE KEYS */;
INSERT INTO `airport` VALUES ('CAN','Guangzhou Baiyun International Airport',3),('CDG','Paris Charles de Gaulle Airport',8),('HND','Tokyo International Airport',9),('JFK','John F. Kennedy International Airport',6),('LAX','Los Angeles International Airport',7),('PEK','Beijing Capital International Airport',1),('SHA','Shanghai Hongqiao International Airport',2),('SIN','Singapore Changi Airport',5),('SUZ','Suzhou Hhh International Airport',4);
/*!40000 ALTER TABLE `airport` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cabinpricing`
--

DROP TABLE IF EXISTS `cabinpricing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cabinpricing` (
  `PricingID` int NOT NULL AUTO_INCREMENT,
  `FlightID` char(20) NOT NULL,
  `DepartureAirportID` char(10) NOT NULL,
  `ArrivalAirportID` char(10) NOT NULL,
  `CabinLevel` enum('Firstclass','Economy') NOT NULL,
  `Price` decimal(10,2) NOT NULL,
  `DiscountRate` decimal(5,2) NOT NULL,
  PRIMARY KEY (`PricingID`),
  KEY `FlightID` (`FlightID`),
  KEY `DepartureAirportID` (`DepartureAirportID`),
  KEY `ArrivalAirportID` (`ArrivalAirportID`),
  CONSTRAINT `cabinpricing_ibfk_1` FOREIGN KEY (`FlightID`) REFERENCES `flight` (`FlightID`),
  CONSTRAINT `cabinpricing_ibfk_2` FOREIGN KEY (`DepartureAirportID`) REFERENCES `airport` (`AirportCode`),
  CONSTRAINT `cabinpricing_ibfk_3` FOREIGN KEY (`ArrivalAirportID`) REFERENCES `airport` (`AirportCode`),
  CONSTRAINT `cabinpricing_chk_1` CHECK ((`Price` > 0)),
  CONSTRAINT `cabinpricing_chk_2` CHECK (((`DiscountRate` >= 0) and (`DiscountRate` <= 100)))
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cabinpricing`
--

LOCK TABLES `cabinpricing` WRITE;
/*!40000 ALTER TABLE `cabinpricing` DISABLE KEYS */;
INSERT INTO `cabinpricing` VALUES (1,'CA123','PEK','SHA','Firstclass',1500.00,7.50),(2,'CA123','PEK','SHA','Economy',800.00,9.00),(5,'CA123','SHA','CAN','Firstclass',1000.00,10.00),(6,'CA124','CAN','SHA','Firstclass',1000.00,20.00),(7,'CA125','SUZ','SIN','Economy',1200.00,10.00),(8,'MH331','CAN','PEK','Firstclass',800.00,5.00),(9,'MH331','PEK','SIN','Economy',1000.00,10.00),(10,'CA123','SHA','CAN','Economy',700.00,10.00),(11,'MH331','CAN','PEK','Economy',700.00,5.00),(12,'MU597','PEK','SUZ','Economy',600.00,8.00),(13,'MU597','SUZ','SHA','Economy',100.00,40.00),(14,'CA123','CAN','SUZ','Economy',400.00,10.00),(15,'CA981','PEK','SHA','Economy',900.00,10.00),(16,'CA981','SHA','JFK','Economy',4000.00,5.00),(18,'VIR95','CAN','LAX','Economy',3000.00,3.00),(19,'VIR95','CAN','LAX','Firstclass',7000.00,4.00),(20,'VIR95','LAX','JFK','Economy',2000.00,5.00),(21,'VIR95','LAX','JFK','Firstclass',5000.00,4.00),(22,'CA144','PEK','CAN','Economy',1000.00,10.00),(23,'CA144','CAN','SHA','Economy',700.00,5.00),(24,'CA144','SHA','CDG','Economy',5000.00,5.00),(25,'CA555','SHA','HND','Economy',1000.00,5.00),(26,'CA555','HND','JFK','Economy',7000.00,4.00);
/*!40000 ALTER TABLE `cabinpricing` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `CheckAirportOrder` BEFORE INSERT ON `cabinpricing` FOR EACH ROW BEGIN
    DECLARE DepartureStopOrder INT;
    DECLARE ArrivalStopOrder INT;
    DECLARE FlightIDForCheck CHAR(20);

    -- 鑾峰彇褰撳墠鎻掑叆璁板綍鐨?FlightID
    SET FlightIDForCheck = NEW.FlightID;

    -- 鑾峰彇鍑哄彂鏈哄満鐨勫仠闈犻『搴?
    SELECT StopOrder 
    INTO DepartureStopOrder
    FROM Flight_Airport
    WHERE FlightID = FlightIDForCheck AND AirportCode = NEW.DepartureAirportID;

    -- 鑾峰彇鍒拌揪鏈哄満鐨勫仠闈犻『搴?
    SELECT StopOrder 
    INTO ArrivalStopOrder
    FROM Flight_Airport
    WHERE FlightID = FlightIDForCheck AND AirportCode = NEW.ArrivalAirportID;

    -- 妫€鏌ュ嚭鍙戞満鍦虹殑椤哄簭鏄惁灏忎簬鍒拌揪鏈哄満鐨勯『搴?
    IF DepartureStopOrder >= ArrivalStopOrder THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '鍑哄彂鏈哄満鐨勯『搴忓繀椤诲皬浜庡埌杈炬満鍦虹殑椤哄簭';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `city`
--

DROP TABLE IF EXISTS `city`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `city` (
  `CityID` int NOT NULL AUTO_INCREMENT,
  `CityName` varchar(50) NOT NULL,
  PRIMARY KEY (`CityID`),
  UNIQUE KEY `CityName` (`CityName`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `city`
--

LOCK TABLES `city` WRITE;
/*!40000 ALTER TABLE `city` DISABLE KEYS */;
INSERT INTO `city` VALUES (1,'Beijing'),(3,'Guangzhou'),(7,'Los Angeles'),(6,'New York'),(8,'Paris'),(2,'Shanghai'),(5,'Singapore'),(4,'Suzhou'),(9,'Tokyo');
/*!40000 ALTER TABLE `city` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flight`
--

DROP TABLE IF EXISTS `flight`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flight` (
  `FlightID` char(20) NOT NULL,
  `AircraftType` varchar(50) NOT NULL,
  `FirstClassSeats` int NOT NULL,
  `EconomySeats` int NOT NULL,
  `WeeklyFlightDays` varchar(50) NOT NULL,
  PRIMARY KEY (`FlightID`),
  CONSTRAINT `flight_chk_1` CHECK ((`FirstClassSeats` >= 0)),
  CONSTRAINT `flight_chk_2` CHECK ((`EconomySeats` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flight`
--

LOCK TABLES `flight` WRITE;
/*!40000 ALTER TABLE `flight` DISABLE KEYS */;
INSERT INTO `flight` VALUES ('CA123','Boeing 737',20,150,'Mon, Wed, Fri'),('CA124','Boeing 737',1,1,'Wed, Sat'),('CA125','Boeing 777',2,4,'Mon, Thu, Sat'),('CA144','Airbus 350',3,9,'Mon, Thu, Sat'),('CA555','Boeing 777',5,10,'Mon, Wed, Fri, Sun'),('CA981','Boeing 747',5,9,'Mon, Wed, Fri, Sun'),('MH331','Boeing 787',3,4,'Tue, Thu, Mon, Sat'),('MU597','Airbus 380',3,10,'Mon, Thu, Sat'),('VIR95','Boeing 777',10,20,'Tue, Thu, Sat');
/*!40000 ALTER TABLE `flight` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flight_airport`
--

DROP TABLE IF EXISTS `flight_airport`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flight_airport` (
  `FlightID` char(20) NOT NULL,
  `AirportCode` char(10) NOT NULL,
  `StopOrder` int NOT NULL,
  PRIMARY KEY (`FlightID`,`StopOrder`),
  KEY `AirportCode` (`AirportCode`),
  CONSTRAINT `flight_airport_ibfk_1` FOREIGN KEY (`FlightID`) REFERENCES `flight` (`FlightID`),
  CONSTRAINT `flight_airport_ibfk_2` FOREIGN KEY (`AirportCode`) REFERENCES `airport` (`AirportCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flight_airport`
--

LOCK TABLES `flight_airport` WRITE;
/*!40000 ALTER TABLE `flight_airport` DISABLE KEYS */;
INSERT INTO `flight_airport` VALUES ('CA123','CAN',3),('CA124','CAN',1),('CA125','CAN',1),('CA144','CAN',2),('CA555','CAN',2),('MH331','CAN',1),('VIR95','CAN',1),('CA144','CDG',4),('CA555','HND',3),('CA555','JFK',4),('CA981','JFK',3),('VIR95','JFK',3),('VIR95','LAX',2),('CA123','PEK',1),('CA124','PEK',3),('CA144','PEK',1),('CA981','PEK',1),('MH331','PEK',2),('MU597','PEK',1),('CA123','SHA',2),('CA124','SHA',2),('CA125','SHA',2),('CA144','SHA',3),('CA555','SHA',1),('CA981','SHA',2),('MU597','SHA',3),('CA125','SIN',4),('MH331','SIN',3),('CA123','SUZ',4),('CA125','SUZ',3),('MU597','SUZ',2);
/*!40000 ALTER TABLE `flight_airport` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `passenger`
--

DROP TABLE IF EXISTS `passenger`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `passenger` (
  `PassengerID` int NOT NULL AUTO_INCREMENT,
  `PassengerName` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL DEFAULT '123',
  `salt` varchar(32) NOT NULL DEFAULT '',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`PassengerID`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `passenger`
--

LOCK TABLES `passenger` WRITE;
/*!40000 ALTER TABLE `passenger` DISABLE KEYS */;
INSERT INTO `passenger` VALUES (1,'Zhang San','123','','2025-05-31 03:02:34','2025-05-31 03:02:34',1),(2,'Li Si','123','','2025-05-31 03:02:34','2025-05-31 03:02:34',1),(3,'hhh','123','','2025-05-31 03:02:34','2025-05-31 03:02:34',1),(4,'hdd','123','','2025-05-31 03:02:34','2025-05-31 03:02:34',1),(5,'hlll','123','','2025-05-31 03:02:34','2025-05-31 03:02:34',1),(6,'111','6ff4b200148acf72992cbca5ab1a3f7b394c5506fb2c12c6755d4ffc390edc03','b43c25168f8f5a3d3f89b2de4e090312','2025-05-31 03:11:02','2025-06-16 03:38:36',1),(7,'hooooo','4ebae7e809eed70c082d24b0da06e087bcd760afb58181cab8df7f7aab195961','6e24efec6a0b8a7ab8ad23795ab45edf','2025-05-31 03:14:06','2025-06-18 01:08:03',1),(8,'hooo','286221bbc23e147e95a35190238f434b28757b696bc35150f4d01261f590219d','bef138bbe9404318ac6cdd51d9fd06ac','2025-05-31 03:19:05','2025-05-31 03:19:05',1),(9,'hoo','bf733462edf188eba146cdb77f4c4417c28b7a7d8799d088434e208f35f4e0e4','32c53ac57db8fcefc17c97662d1c7d1d','2025-05-31 03:20:18','2025-05-31 03:20:18',1),(10,'ho','8371f0c26b92d9d9cd3e07e5bd8d1f54cc73c0d2d68dbb905e72c32d7f031505','cbd95cac36022028867026b9ea22d7a2','2025-05-31 03:20:43','2025-05-31 03:20:43',1),(11,'ho1','af416c4887add7048ca37a290105f7203d47ba3672ee83ae565deb7d993dc31c','1b667e0d07afd85dc6f460c85b4b401a','2025-06-04 06:05:51','2025-06-04 06:05:51',1),(12,'admin','8d2fb5061ea01811136a75d5aae80572a06a1bc4e1c4060010e785e2a77ef599','c4254cffed77d02d010e694fbc9b7da8','2025-06-04 06:23:16','2025-06-18 01:09:44',1),(13,'hkk','83268291a94ad0dfbbbbaf0395ed0251f2811c422693ec122af2200a3eb3782b','30acaab3ab07999dadc9d5803c50b9fc','2025-06-15 05:31:49','2025-06-16 13:40:05',1),(14,'lww','acaba240beebe727cab2be0bfb6d4135b0359e81ee70fe0b56d4d1359b6f12a3','01cee4daebeb7f64aab06e99e8f19dea','2025-06-15 08:54:56','2025-06-17 05:50:39',1),(15,'testhh','9558d0b0661ee6b5ebcf9e621a96020d6b6c2138f3e7ea45ea8dcd1aa39cd6f4','5c69e5c8488d1d867bf058d72cf0f985','2025-06-17 15:01:44','2025-06-17 15:29:54',1),(16,'testuser_6','c13d2bc1bd1fdffaaa26b7bd3340a35ef7ed9cc86646b6e0978a7f86328d6ee5','7998820509950ca7ca772610179f5df7','2025-06-17 15:43:06','2025-06-17 15:43:07',1),(17,'testuser_11','58f65833fb167853dbd426fa16e957d8803fa5000f1aa0c86b9eff9ed0b48dcf','41b214e974beb219fb4e98382a0ba513','2025-06-17 15:43:06','2025-06-17 15:43:07',1),(18,'testuser_8','64861f1ee425e29795aad1176e265a8245fd2c505203f6f778361cb9afc8c6a6','110bdc88deffb958836b8440f35c8998','2025-06-17 15:43:06','2025-06-17 15:43:07',1),(19,'testuser_4','031ba2f2c7d9d6752f28adf224ea0e17b07744e2046a1d099613f4106013a745','91030634abc709bb5259103e8e14d3fd','2025-06-17 15:43:06','2025-06-17 15:43:07',1),(20,'testuser_7','6ae2ca29da8a7660e09df4873526f7d6ed4f1b21cb965087e8aac2a57b09c192','db342f6e869405a975272d11d3037c6f','2025-06-17 15:43:06','2025-06-17 15:43:07',1),(21,'testuser_5','b3346d5d6c15ab44a823d78a5ad8756980dad9ab127cd88bc400e9be97367868','5c8669dd6712e5afa2e08bc5d37a4e0b','2025-06-17 15:43:06','2025-06-17 15:43:07',1),(22,'testuser_9','307d0af2f22ed0b43a62e50a2074f4638a2a6dd982446cf4cf93979720071422','062c7e5780fdec71a3aec9066d93c4e4','2025-06-17 15:43:06','2025-06-17 15:43:07',1),(23,'testuser_10','eb11983ea7a49ee37aa042847b074e93e93e34a2b398db741ddcd510112b611d','85c22bc4c5d0022b98458210ce290ac1','2025-06-17 15:43:06','2025-06-17 15:43:07',1),(24,'testuser_1','4225df4af9dece94775c2e961b453b097b3fdd4648699778ddf2d6304033a357','f1f6c4e2eee14fac695959fcd0a6d634','2025-06-17 15:43:06','2025-06-17 15:43:07',1),(25,'testuser_3','93b00de9e2fea991e05e032b0f03fa7f2e7f76f99ecc19b333838c64f08e61c2','5e5635c5496afbb1fa5d11fdbaaddc0f','2025-06-17 15:43:06','2025-06-17 15:43:07',1),(26,'testuser_15','f30648262c801614313ed7253eaa74eec0dcafc860e76ac926fd63f6fcffbce6','a5e9daad479753f3cbfb598a4c253a92','2025-06-17 15:43:06','2025-06-17 15:43:07',1),(27,'testuser_14','f5c75824b90b3f7c634c31a3be94cc9dc43fd834ae88ef3006fa7bc01b9f6d77','849e4157acebc39becad909b7d012286','2025-06-17 15:43:06','2025-06-17 15:43:07',1),(28,'testuser_12','8db99f9759b6ebceceecc956fe7c16e497572c0bad8632f9206cde3dd9482287','6a9243b3f4a21543c910be2584192f72','2025-06-17 15:43:06','2025-06-17 15:43:07',1),(29,'testuser_16','656426adc34822645d20d88a19ac325273ed73e32b60de842761797640f9b8ef','f565f9aad3b10484e323c930c8164784','2025-06-17 15:43:06','2025-06-17 15:43:07',1),(30,'testuser_0','146c79fbfa0801dc5ba40f8d129d831b365d8de94fa0380c66d1744c16e3c721','ab3268034bb8298d9fa1f69e7555ac77','2025-06-17 15:43:06','2025-06-17 15:43:07',1),(31,'testuser_18','97ac226d55c201ac1fcf30a25c23c7a2135b75bc62f8ec988d6ff010bfe32ae7','429b7bc030f6c606343974a88376273e','2025-06-17 15:43:06','2025-06-17 15:43:07',1),(32,'testuser_17','2ede5e562bac48ffff39ea7b2963867ff49f5d5c184f3d647850855fec1f11bf','bfbef2461472df1d42e4eb6cef909abc','2025-06-17 15:43:06','2025-06-17 15:43:07',1),(33,'testuser_13','877861ccae2f21a3159ae6346374b6f69325d85d6cb715875b61db82e2cca7d5','3a28871d36b4472b6ced8e2b7e5f1307','2025-06-17 15:43:06','2025-06-17 15:43:07',1),(34,'testuser_2','36e402e0535da12f5a19e258b41d75ca4212b6c26f282911b8319062171afa8a','e50f6c55a639c89ab0d329eb30a7b02d','2025-06-17 15:43:06','2025-06-17 15:43:07',1),(35,'testuser_19','d205a0f51afcce0fdbd03ed09a6be89c71708ec6ae07b5873c056e6f0ed9bc24','6bbd692a6753f0ff23f287ec95247e2b','2025-06-17 15:43:06','2025-06-17 15:43:07',1),(36,'test','bc7e0994d4790decb257c2c4731e7f8f2663d8355411a22787b826820dc0dc92','4b19c7e4739b1afc4559aabcf0f4280e','2025-06-18 01:05:39','2025-06-18 01:05:50',1);
/*!40000 ALTER TABLE `passenger` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticketsale`
--

DROP TABLE IF EXISTS `ticketsale`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticketsale` (
  `TicketSaleID` int NOT NULL AUTO_INCREMENT,
  `PassengerID` int NOT NULL,
  `CabinPricingID` int NOT NULL,
  `FlightDate` date NOT NULL,
  `Price` decimal(10,2) NOT NULL DEFAULT '1000.00',
  PRIMARY KEY (`TicketSaleID`),
  KEY `PassengerID` (`PassengerID`),
  KEY `CabinPricingID` (`CabinPricingID`),
  CONSTRAINT `ticketsale_ibfk_1` FOREIGN KEY (`PassengerID`) REFERENCES `passenger` (`PassengerID`),
  CONSTRAINT `ticketsale_ibfk_2` FOREIGN KEY (`CabinPricingID`) REFERENCES `cabinpricing` (`PricingID`),
  CONSTRAINT `ticketsale_chk_1` CHECK ((`Price` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticketsale`
--

LOCK TABLES `ticketsale` WRITE;
/*!40000 ALTER TABLE `ticketsale` DISABLE KEYS */;
INSERT INTO `ticketsale` VALUES (29,7,1,'2025-06-18',1387.50),(30,7,6,'2025-06-18',800.00),(31,13,6,'2025-06-25',800.00),(32,14,7,'2025-06-16',1080.00),(33,7,9,'2025-06-16',900.00),(34,7,6,'2025-07-02',800.00),(35,7,9,'2025-06-23',900.00),(36,7,2,'2025-06-17',1358.00),(37,7,2,'2025-06-16',1358.00),(38,14,2,'2025-06-16',1358.00),(39,13,2,'2025-06-16',1358.00),(40,13,2,'2025-06-23',1358.00),(41,13,2,'2025-06-18',1358.00),(42,13,2,'2025-07-21',1358.00),(43,7,2,'2025-06-23',1358.00),(44,14,2,'2025-06-23',1358.00),(45,14,10,'2025-06-23',1358.00),(46,14,2,'2025-06-25',728.00),(47,14,10,'2025-06-25',630.00),(48,7,15,'2025-06-23',810.00),(49,7,16,'2025-06-23',3800.00),(50,7,2,'2025-06-18',728.00),(51,14,18,'2025-06-17',2910.00),(52,7,18,'2025-06-17',2910.00),(53,7,20,'2025-06-17',1900.00),(54,15,15,'2025-06-18',810.00),(55,15,16,'2025-06-18',3800.00),(56,15,22,'2025-06-19',900.00),(57,15,23,'2025-06-19',665.00),(58,15,8,'2025-06-17',760.00),(59,15,9,'2025-06-17',900.00),(60,15,22,'2025-06-20',900.00),(61,15,23,'2025-06-20',665.00),(62,15,24,'2025-06-20',4750.00),(63,7,22,'2025-06-19',900.00),(64,7,23,'2025-06-19',665.00),(65,7,24,'2025-06-19',4750.00),(66,7,15,'2025-06-20',810.00),(67,36,25,'2025-06-18',950.00),(68,36,26,'2025-06-18',6720.00),(69,7,25,'2025-06-18',950.00);
/*!40000 ALTER TABLE `ticketsale` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `CheckOverbooking` BEFORE INSERT ON `ticketsale` FOR EACH ROW BEGIN
    DECLARE SoldFirstClassSeats INT;
    DECLARE SoldEconomySeats INT;
    DECLARE AvailableFirstClassSeats INT;
    DECLARE AvailableEconomySeats INT;
    DECLARE FlightIDForCheck CHAR(20);
    DECLARE TicketCabinLevel VARCHAR(20);

    -- 閫氳繃 CabinPricingID 鑾峰彇 FlightID
    SELECT FlightID 
    INTO FlightIDForCheck
    FROM CabinPricing
    WHERE PricingID = NEW.CabinPricingID;

    -- 閫氳繃 CabinPricingID 鑾峰彇 CabinLevel
    SELECT CabinLevel 
    INTO TicketCabinLevel
    FROM CabinPricing
    WHERE PricingID = NEW.CabinPricingID;

    -- 鑾峰彇宸插敭鍑虹殑澶寸瓑鑸卞骇浣嶆暟
    SELECT COUNT(*) 
    INTO SoldFirstClassSeats
    FROM TicketSale ts
    JOIN CabinPricing cp ON ts.CabinPricingID = cp.PricingID
    WHERE cp.FlightID = FlightIDForCheck AND cp.CabinLevel = 'Firstclass' AND ts.FlightDate = NEW.FlightDate;

    -- 鑾峰彇宸插敭鍑虹殑缁忔祹鑸卞骇浣嶆暟
    SELECT COUNT(*) 
    INTO SoldEconomySeats
    FROM TicketSale ts
    JOIN CabinPricing cp ON ts.CabinPricingID = cp.PricingID
    WHERE cp.FlightID = FlightIDForCheck AND cp.CabinLevel = 'Economy' AND ts.FlightDate = NEW.FlightDate;

    -- 鑾峰彇鑸彮鐨勫骇浣嶆暟
    SELECT FirstClassSeats, EconomySeats 
    INTO AvailableFirstClassSeats, AvailableEconomySeats
    FROM Flight
    WHERE FlightID = FlightIDForCheck;

    -- 鍒ゆ柇鏄惁瓒呭敭
    IF (TicketCabinLevel = 'Firstclass' AND SoldFirstClassSeats >= AvailableFirstClassSeats) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '澶寸瓑鑸卞骇浣嶅凡鍞畬锛屾棤娉曞畬鎴愬敭绁?;
    END IF;

    IF (TicketCabinLevel = 'Economy' AND SoldEconomySeats >= AvailableEconomySeats) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '缁忔祹鑸卞骇浣嶅凡鍞畬锛屾棤娉曞畬鎴愬敭绁?;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-20 22:38:24
