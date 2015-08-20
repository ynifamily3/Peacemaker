CREATE TABLE `peacemaker`.`chatting_content` (
  `num` INT NOT NULL,
  `project_id` INT NULL,
  `type` VARCHAR(10) NULL,
  `content` VARCHAR(256) NULL,
  `time` VARCHAR(45) NULL,
  `writer` VARCHAR(45) NULL,
  PRIMARY KEY (`num`) ,
  UNIQUE INDEX `num_UNIQUE` (`num` ASC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ;
