CREATE DATABASE IF NOT EXISTS `peacemaker`;
USE `peacemaker`;

GRANT ALL PRIVILEGES ON `peacemaker`.* TO `peacemaker`@`%` IDENTIFIED BY 's9MxufFcuShxDaB3' WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON `peacemaker`.* TO `peacemaker`@`localhost` IDENTIFIED BY 's9MxufFcuShxDaB3' WITH GRANT OPTION;
FLUSH PRIVILEGES;

CREATE TABLE IF NOT EXISTS `users` (
  `pid` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(32) NOT NULL,
  `username` varchar(32) NOT NULL,
  `password` varchar(128) NOT NULL,
  `salt` varchar(32) NOT NULL,
  `mail` varchar(254) NOT NULL,
  `phone` varchar(12) NOT NULL,
  `register_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`pid`),
  UNIQUE KEY `username` (`username`),
  KEY `mail` (`mail`),
  KEY `phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

CREATE TABLE IF NOT EXISTS `projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(16) NOT NULL,
  `url` varchar(32) NOT NULL,
  `desc` varchar(32) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `hangout_url` varchar(32),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`admin_id`) REFERENCES `users` (`pid`),
  UNIQUE KEY `url` (`url`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

CREATE TABLE IF NOT EXISTS `project_entries` (
  `pid` int(11) NOT NULL,
  `id` int(11) NOT NULL,
  `enrolled_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`pid`) REFERENCES `users` (`pid`),
  FOREIGN KEY (`id`) REFERENCES `projects` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

CREATE TABLE IF NOT EXISTS `files` (
  `path` VARCHAR(256) NOT NULL,
  `original` VARCHAR(256) NOT NULL,
  `size` INT(10) NULL,
  `allow_project` INT(10) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ;

CREATE TABLE IF NOT EXISTS `chatting_content` (
  `num` INT NOT NULL,
  `project_id` INT NULL,
  `type` VARCHAR(10) NULL,
  `content` VARCHAR(256) NULL,
  `time` VARCHAR(45) NULL,
  `writer` VARCHAR(45) NULL,
  PRIMARY KEY (`num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ;

CREATE TABLE IF NOT EXISTS `memo_content` (
  `memo_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `project` INT NOT NULL,
  `color` VARCHAR(10) NULL,
  `is_finished` INT NULL,
  `writer` INT NULL,
  `content` VARCHAR(300) NULL,
  PRIMARY KEY (`memo_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `subject_id` int(11) NOT NULL,
  `object_id` int(11) NOT NULL,
  `project_id` int(11) NULL,
  `type` int(3) NOT NULL,
  `created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`subject_id`) REFERENCES `users` (`pid`),
  FOREIGN KEY (`object_id`) REFERENCES `users` (`pid`),
  FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;