CREATE TABLE `peacemaker`.`chatting_content` (
  `num` INT NOT NULL COMMENT '',
  `project_id` INT NULL COMMENT '',
  `type` VARCHAR(10) NULL COMMENT '',
  `content` VARCHAR(256) NULL COMMENT '',
  `time` VARCHAR(45) NULL COMMENT '',
  `writer` VARCHAR(45) NULL COMMENT '',
  PRIMARY KEY (`num`)  COMMENT '',
  UNIQUE INDEX `num_UNIQUE` (`num` ASC)  COMMENT '')
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;
