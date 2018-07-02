<?php include_once("include/translate.php"); ?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title><?php echo _("Jigsaw Puzzle"); ?></title>
    <!--[if lt IE 9]><script type="text/javascript" src="js/bin/flashcanvas.js"></script><![endif]-->
    <link rel="stylesheet" href="css/modal.css" type="text/css" charset="utf-8" />
    <link rel="stylesheet" href="css/style.css" type="text/css" charset="utf-8" />
    <link rel="stylesheet" href="css/buttons.css" type="text/css" charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body>

<!-- JIGSAW CANVAS -->
<div id="canvas-wrap">
    <canvas id="canvas"></canvas>
    <canvas class="hide" id="image"></canvas>
    <canvas class="hide" id="image-preview"></canvas>
</div>

<!-- GAME OPTIONS -->
<div id="game-options">
<ul>
    <li><b id="clock" class="button">00:00:00</b></li>
    <li><a href="#" id="SHOW_EDGE" class="button left" title="<?php echo _('Show edge pieces only'); ?>"><?php echo _("Border"); ?></a></li>
    <li><a href="#" id="SHOW_MIDDLE" class="button middle" title="<?php echo _('Show middle pieces only'); ?>"><?php echo _("Middle"); ?></a></li>
    <li><a href="#" id="SHOW_ALL" class="button right" title="<?php echo _('Show all pieces'); ?>"><?php echo _("All"); ?></a></li>
    <li><a href="#" id="JIGSAW_SHUFFLE" class="button left" title="<?php echo _('Shuffle'); ?>"><?php echo _("Shuffle"); ?></a></li>
    <li><a href="#" id="SHOW_PREVIEW" class="button middle" title="<?php echo _('Preview'); ?>"><?php echo _("Preview"); ?></a></li>
    <li><a href="#" id="SHOW_HELP" class="button help right" title="<?php echo _('Help'); ?>"><?php echo _("Help"); ?></a></li>
    <!-- INSERT CUSTOM BUTTONS -->
    
    <!-- END INSERT CUSTOM BUTTONS -->
    <li>
        <div class="styled-select">
            <select id="set-parts" selected-index="8">
            </select>
        </div>
    </li>
    <!-- Insert custom buttons here -->
    <li id="create"><a href="#" class="button add" id="SHOW_FILEPICKER" title="<?php echo _('Create puzzle'); ?>" ><?php echo _("Create puzzle"); ?></a></li>
</ul>
<br class="clear"/>
</div>

<!-- MODAL WINDOW -->
<div class="hide" id="overlay"></div>
<div id="modal-window" class="hide">
    <div id="modal-window-msg"></div>
    <a href="#" id="modal-window-close" class="button"><?php echo _("Close"); ?></a>
</div>

<!-- CONGRATULATION -->
<div id="congrat" class="hide">
    <h1><?php echo _("Congratulations!"); ?></h1>
    <h2><?php echo _("You solved it in"); ?></h2>
    <h3><span id="time"></span></h3>
    <form method="post" class="hide" action="score.php" target="save-score" onsubmit="jigsaw.UI.close_lightbox();">
        <label>
        <?php echo _("Your Name"); ?>: <input type="text" name="name" />
        </label>
        <input type="submit" value="<?php echo _('Save score'); ?>" />
        <input type="hidden" id="time-input" name="time"/>
    </form>
</div>

<!-- CREATE PUZZLE -->
<div class="hide" id="create-puzzle">
    <h1><?php echo _("Choose an image"); ?></h1>
    <form id="image-form" id="add-image-form">
        <input type="file" id="image-input">
        <p id="image-error"><?php echo _("that's not an image"); ?></p>
        <p id="dnd"><i><?php echo _("Or drag one from your computer"); ?></i></p>
    </form>
</div>

<!-- HELP -->
<div id="help" class="hide">
    <h2><?php echo _("How to play"); ?></h2>
    <ul>
        <li><?php echo _("Change the number of pieces with the selector on the top."); ?><br/>
            <img src="images/selector.png"/>
        </li>
        
        <li><?php echo _("Use left/right arrows, or right click to rotate a piece."); ?></li>

        <li><?php echo _("Toggle between edge or middle pieces:"); ?><br>
            <img src="images/toggle.png"/>
        </li>
    </ul>
    
    <h3><?php echo _("Good luck."); ?></h3>
</div>

<form class="hide" method="post" id="redirect-form">
    <input type="text" name="time" id="t" />
    <input type="text" name="parts" id="p" />
</form>
<iframe class="hide" src="about:blank" id="save-score" name="save-score"></iframe>
<!-- SCRIPTS ROMPECABEZAS -->
<script src="js/event-emiter.min.js"></script>
<script src="js/canvas-event.min.js"></script>
<script src="js/canvas-puzzle.min.js"></script>
<!--[if lt IE 9]><script type="text/javascript" src="js/canvas-puzzle.ie.min.js"></script><![endif]-->
<script>
;(function() {
var jsaw = new jigsaw.Jigsaw({
        defaultImage: "images/puzzle/scottwills_meercats.jpg",
        piecesNumberTmpl: "<?php echo _('%d Pieces'); ?>"
    });

    if (jigsaw.GET["image"]) { jsaw.set_image(jigsaw.GET["image"]); }
}());
</script>
</body>
</html>
