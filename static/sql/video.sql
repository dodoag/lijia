CREATE TABLE `video` (
  `id` int(11) NOT NULL auto_increment,
  `name` varchar(30) NOT NULL,
  `path` varchar(200) NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;

INSERT INTO `video` VALUES ('1', 'exmaple', '/static/video/sign.mp4');


CREATE TABLE `play` (
  `id` int(11) NOT NULL auto_increment,
  `vid` int(11) NOT NULL,
  `type` int(11) NOT NULL,
  `length` int(11) NOT NULL,
  `time` int(11) NOT NULL,
  `title` varchar(50) NOT NULL,
  `url` varchar(50) NOT NULL,
  `desc` varchar(50) NOT NULL,
  `topY` varchar(50) NOT NULL,
  `leftX` varchar(50) NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;