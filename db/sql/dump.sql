CREATE TABLE IF NOT EXISTS `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(45) DEFAULT NULL,
  `password` varchar(60) DEFAULT NULL,
  `wins` int(10) unsigned DEFAULT '0',
  `losses` int(10) unsigned DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `UsersID_UNIQUE` (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `games` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `created` datetime DEFAULT NULL,
  `current_player` int(11) DEFAULT NULL COMMENT 'Number of current player',
  `player_cells_left` int(11) DEFAULT NULL COMMENT 'Nubmer of cells player still should play before turn end. (1-3)',
  `max_players` int(11) DEFAULT NULL COMMENT 'Number of players to start playing',
  `players` int(11) DEFAULT NULL COMMENT 'Number of players have already joined game',
  PRIMARY KEY (`id`),
  UNIQUE KEY `GameID_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8 COMMENT='Games list';

CREATE TABLE IF NOT EXISTS `users_games` (
  `user_id` int(11) unsigned NOT NULL,
  `game_id` int(10) unsigned NOT NULL,
  `player_state` varchar(45) DEFAULT NULL COMMENT '* I believe it should be correct *\nIf >= 0: player turn order\nIf  = -1: player have already lose this game',
  `player_color` tinyint(1) DEFAULT NULL,
  KEY `UserID_idx` (`user_id`),
  KEY `GameID_idx` (`game_id`),
  CONSTRAINT `GameID` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `UserID` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Junction table for players in games';

CREATE TABLE IF NOT EXISTS `board_cells` (
  `id` int(10) unsigned DEFAULT NULL,
  `x` int(11) DEFAULT NULL,
  `y` int(11) DEFAULT NULL,
  `state` int(11) DEFAULT NULL COMMENT 'Cell state:\n	1 - alive cell\n	2 - dead cell',
  `user_id` int(10) unsigned DEFAULT NULL COMMENT 'Cell owner',
  UNIQUE KEY `Unique_cell` (`id`,`x`,`y`,`state`),
  KEY `UserID_idx` (`user_id`),
  KEY `GameID_indx` (`id`),
  KEY `UserID_indx` (`user_id`),
  CONSTRAINT `GameIDConstraint` FOREIGN KEY (`id`) REFERENCES `games` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `UserIDConstraint` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Cells in games';

CREATE TABLE IF NOT EXISTS `pvp_statistics` (
  `user1` int(11) unsigned NOT NULL,
  `user2` int(11) unsigned NOT NULL,
  `user1_wins` int(11) DEFAULT NULL COMMENT 'Number of user 1 wins on user 2',
  UNIQUE KEY `UNIQUE_PAIR` (`user1`,`user2`),
  KEY `User1ID_idx` (`user1`),
  KEY `User2ID_idx` (`user2`),
  CONSTRAINT `User1ID` FOREIGN KEY (`user1`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `User2ID` FOREIGN KEY (`user2`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Player vs player stats';