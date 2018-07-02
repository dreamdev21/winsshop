<?php include_once("include/puzzle-list.php");

$imageList = new PuzzleList("images/puzzle");

$imageList->createPuzzleList("index.php", "canvas-puzzle-list");
