CREATE TABLE `video` (
  `id` int(11) NOT NULL auto_increment,
  `name` varchar(30) NOT NULL,
  `path` varchar(200) NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;

INSERT INTO `video` VALUES ('1', 'exmaple', '/static/video/sign.mp4');
