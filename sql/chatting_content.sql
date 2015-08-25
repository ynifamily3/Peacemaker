USE `peacemaker`;

CREATE TABLE IF NOT EXISTS `chatting_content` (
  `num` INT(11) NOT NULL AUTO_INCREMENT,
  `project_id` INT(11) NULL,
  `type` VARCHAR(20) NULL,
  `content` VARCHAR(1400) NULL,
  `writer` INT(11) NULL,
  `original` VARCHAR(512) NULL,
  `size` INT(20) NULL,
  `created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ;