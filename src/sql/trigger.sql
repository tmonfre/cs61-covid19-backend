use COVID19_sp20;

DROP TRIGGER IF EXISTS AuditTriggerCreate;
DROP TRIGGER IF EXISTS AuditTriggerUpdate;

DELIMITER $$
CREATE TRIGGER AuditTriggerCreate
	AFTER INSERT ON CaseCount
    FOR EACH ROW
    BEGIN
		INSERT INTO Audit 
		(UserName, Date, CountyID, StateName, CaseCountBefore, CaseCountAfter, DeathCountBefore, DeathCountAfter) 
		VALUES 
		(CURRENT_USER(), CURDATE(), NEW.CountyID, NEW.StateName, NULL, NEW.CaseCount, NULL, NEW.DeathCount);
    END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER AuditTriggerUpdate
	AFTER UPDATE ON CaseCount
    FOR EACH ROW
    BEGIN
		INSERT INTO Audit 
		(UserName, Date, CountyID, StateName, CaseCountBefore, CaseCountAfter, DeathCountBefore, DeathCountAfter) 
		VALUES 
		(CURRENT_USER(), CURDATE(), NEW.CountyID, NEW.StateName, OLD.CaseCount, NEW.CaseCount, OLD.DeathCount, NEW.DeathCount);
    END$$
DELIMITER ;
    