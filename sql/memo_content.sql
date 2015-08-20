CREATE TABLE IF NOT EXISTS `memo_content` (
  `memo_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `project` INT NOT NULL,
  `color` VARCHAR(10) NULL,
  `is_finished` INT NULL,
  `writer` INT NULL,
  `content` VARCHAR(300) NULL,
  PRIMARY KEY (`memo_id`) ,
  UNIQUE INDEX `memo_id_UNIQUE` (`memo_id` ASC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
