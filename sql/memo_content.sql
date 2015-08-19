CREATE TABLE `peacemaker`.`memo_content` (
  `memo_id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '',
  `project` INT NOT NULL COMMENT '',
  `color` VARCHAR(10) NULL COMMENT '',
  `is_finished` INT NULL COMMENT '',
  `writer` INT NULL COMMENT '',
  `content` VARCHAR(300) NULL COMMENT '',
  PRIMARY KEY (`memo_id`)  COMMENT '',
  UNIQUE INDEX `memo_id_UNIQUE` (`memo_id` ASC)  COMMENT '')
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;
