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