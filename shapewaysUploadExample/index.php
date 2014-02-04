<?php
?>

<script type="text/javascript" src="jquery-1.7.2.min.js?tag=<?php echo $scriptTag;?>"></script>
<script type="text/javascript" src="jquery.form.js?tag=<?php echo $scriptTag;?>"></script>

<script type="text/javascript">
  
  var modelPath = null;
  
  /**
   * Uploads a model with the Shapeways API.
   */
  function uploadModel() {
    var modelLink = $('#model-link');
    modelLink.html('Attempting Upload...');
    modelLink.css('display', 'block');
    $.post('api/apiUpload.php', 
	   {modelFilePath: "../3dmodel/", modelFileName: "mycoin.obj"},
	   function(response) {
		 
		 // now that we have a model id, we can create a link to the model on shapeways
		 console.log(response);
		 var decodedResponse = JSON.parse(response);
		 var modelId = decodedResponse.modelId;
		 var modelLink = $('#model-link');
		 modelLink.html('<a href="http://www.shapeways.com/model/upload-and-buy/' + modelId + '">Click here to see your model on shapeways.com!</a>');
		 modelLink.css('display', 'block');
	   }
    );
  }
</script>

<a href="#" onclick="uploadModel()">Upload Model to Shapeways</a>
<div id="model-link" style="display: none">
	
</div>