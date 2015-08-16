USE `peacemaker`;

CREATE TABLE IF NOT EXISTS `files` (
  `path` VARCHAR(256) NOT NULL,
  `original` VARCHAR(256) NOT NULL,
  `size` INT(10) NULL,
  `allow_project` INT(10) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ;