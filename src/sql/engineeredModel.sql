-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema COVID19_sp20
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema COVID19_sp20
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `COVID19_sp20` DEFAULT CHARACTER SET utf8 ;
USE `COVID19_sp20` ;

-- -----------------------------------------------------
-- Table `COVID19_sp20`.`Users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `COVID19_sp20`.`Users` (
  `UserName` VARCHAR(45) NOT NULL,
  `FirstName` VARCHAR(45) NOT NULL,
  `LastName` VARCHAR(45) NULL DEFAULT NULL,
  `AccountCreated` DATETIME NULL DEFAULT NULL,
  `AdminUser` TINYINT(4) NULL DEFAULT 0,
  `SaltedPassword` VARCHAR(65) NOT NULL,
  PRIMARY KEY (`UserName`),
  UNIQUE INDEX `UserName_UNIQUE` (`UserName` ASC));


-- -----------------------------------------------------
-- Table `COVID19_sp20`.`Audit`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `COVID19_sp20`.`Audit` (
  `AuditID` INT(11) NOT NULL AUTO_INCREMENT,
  `UserName` VARCHAR(45) NOT NULL,
  `Date` DATETIME NOT NULL,
  `TableName` VARCHAR(45) NOT NULL,
  `AttributeName` VARCHAR(45) NOT NULL,
  `ValBefore` VARCHAR(100) NULL DEFAULT NULL,
  `ValAfter` VARCHAR(100) NULL DEFAULT NULL,
  PRIMARY KEY (`AuditID`),
  UNIQUE INDEX `AuditID_UNIQUE` (`AuditID` ASC),
  INDEX `fk_Audit_Users1_idx` (`UserName` ASC),
  CONSTRAINT `fk_Audit_Users1`
    FOREIGN KEY (`UserName`)
    REFERENCES `COVID19_sp20`.`Users` (`UserName`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);


-- -----------------------------------------------------
-- Table `COVID19_sp20`.`States`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `COVID19_sp20`.`States` (
  `StateName` VARCHAR(45) NOT NULL,
  `FIPS` VARCHAR(5) NOT NULL,
  `FirstCase` DATETIME NULL DEFAULT NULL,
  `FirstDeath` DATETIME NULL DEFAULT NULL,
  `Population` INT(11) NOT NULL,
  PRIMARY KEY (`StateName`),
  UNIQUE INDEX `StateName_UNIQUE` (`StateName` ASC));


-- -----------------------------------------------------
-- Table `COVID19_sp20`.`Counties`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `COVID19_sp20`.`Counties` (
  `CountyID` INT(11) NOT NULL AUTO_INCREMENT,
  `CountyName` VARCHAR(45) NOT NULL,
  `FIPS` VARCHAR(5) NOT NULL,
  `StateName` VARCHAR(45) NOT NULL,
  `Population` INT(11) NULL DEFAULT NULL,
  PRIMARY KEY (`CountyID`),
  UNIQUE INDEX `CountyID_UNIQUE` (`CountyID` ASC),
  INDEX `fk_Counties_States_idx` (`StateName` ASC),
  CONSTRAINT `fk_Counties_States`
    FOREIGN KEY (`StateName`)
    REFERENCES `COVID19_sp20`.`States` (`StateName`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);


-- -----------------------------------------------------
-- Table `COVID19_sp20`.`CaseCount`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `COVID19_sp20`.`CaseCount` (
  `CountyID` INT(11) NOT NULL,
  `Date` DATETIME NOT NULL,
  `StateName` VARCHAR(45) NOT NULL,
  `CaseCount` INT(11) NULL DEFAULT NULL,
  `DeathCount` INT(11) NULL DEFAULT NULL,
  PRIMARY KEY (`CountyID`, `Date`),
  INDEX `fk_CaseCount_States1_idx` (`StateName` ASC),
  CONSTRAINT `fk_CaseCount_Counties1`
    FOREIGN KEY (`CountyID`)
    REFERENCES `COVID19_sp20`.`Counties` (`CountyID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_CaseCount_States1`
    FOREIGN KEY (`StateName`)
    REFERENCES `COVID19_sp20`.`States` (`StateName`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
