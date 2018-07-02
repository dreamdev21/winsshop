<?php

class PuzzleList {

    function __construct($folder)
    {
        $this->thumb_width = 128;
        $this->thumb_height = 85;

        $this->thumb_dir = "$folder/thumbnails";
        
        // make sure the directory exists
        if (!file_exists($this->thumb_dir))
            mkdir($this->thumb_dir);

        foreach (glob("$folder/*") as $i  => $file_path)
        {
            $this->addImage($file_path);
        }
    }
    
    function createPuzzleList($gameurl, $class="canvas-puzzle-list")
    {
        echo "<ul class='$class'>";
        foreach ($this->images as $image => $thumbnail):
        ?>
            <li><a href='<?php echo "$gameurl?image=$image"; ?>'><img src="<?php echo $thumbnail; ?>"></a></li>
        <?php
        endforeach;
        echo "</ul>";
    }

	// Verify that a file is actually an image
    function addImage($image_path)
	{
	    $info = pathinfo($image_path);
	    
	    if (isset($info['extension']))
	    {
	        $ext = $info['extension'];
	    }
	    
	    if (!isset($ext))
	    {
	        return;
	    }
	    
	    $type = strtolower($ext);
	    
        if ($type == 'jpg') $type = 'jpeg';
        
        $func = 'imagecreatefrom' . $type;
        
        // si existe la función posiblemente es un formato de imagen valido
        if (!function_exists($func)) 
        {
            return;
        }
        
        $thumbnail_path = "{$this->thumb_dir}/{$info["basename"]}";
        
        // Create thumbnail if not exists
        // code adapted from http://davidwalsh.name/create-image-thumbnail-php
        if (!file_exists($thumbnail_path))
        {
            $func = 'imagecreatefrom' . $type;
            $source_image = $func($image_path);
            $width = imagesx($source_image);
            $height = imagesy($source_image);

            $desired_width = $this->thumb_width;
            
            /* find the "desired height" of this thumbnail, relative to the desired width  */
            $desired_height = floor($height * ($desired_width / $width));
            
            /* create a new, "virtual" image */
            $virtual_image = imagecreatetruecolor($desired_width, $desired_height);

            /* copy source image at a resized size */
            imagecopyresampled($virtual_image, $source_image, 0, 0, 0, 0, $desired_width, $desired_height, $width, $height);
            
            $func = 'image' . $type;
            
            /* create the physical thumbnail image to its destination */
            $func($virtual_image, $thumbnail_path);
        }

        $this->images[$image_path] = $thumbnail_path;
	}

}
