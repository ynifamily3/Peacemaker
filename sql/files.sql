USE `peacemaker`;

CREATE TABLE `peacemaker`.`files` (
  `path` VARCHAR(256) NOT NULL COMMENT '',
  `original` VARCHAR(256) NOT NULL COMMENT '',
  `size` INT(10) NULL COMMENT '',
  `allow_project` INT(10) NULL COMMENT '')
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci
COMMENT = '업로드한 파일 관리';