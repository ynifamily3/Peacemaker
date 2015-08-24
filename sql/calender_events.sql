USE `peacemaker`;

CREATE TABLE IF NOT EXISTS `calender_events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(32) NOT NULL,
  `start` varchar(19) NOT NULL,
  `end` varchar(19) NOT NULL,
  `allDay` tinyint(1) NOT NULL,
  `user_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`pid`),
  FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;