$(function(){
  var upload = document.getElementById('upload'),
      baseCanvas = document.getElementById('base'),
      baseContext = baseCanvas.getContext('2d'),
      defaultX,
      defaultY,
      defaultWidth,
      defaultHeight,
      defaultRotate,
      userCanvas = document.getElementById('render'),
      userContext = userCanvas.getContext('2d'),
      template = document.createElement('img'),
      uploadedImage = document.createElement('img'),
      uploadedImageWidth,
      uploadedImageHeight,
      exportCanvas = document.createElement('canvas'),
      exportContext = exportCanvas.getContext('2d');

  // Render base template to canvas
  template.src = 'oscars.png';
  template.onload = function() {
    baseContext.drawImage(template, 0, 0);
  }
  upload.addEventListener('change', processImage, false);

  function processImage(e) {
    // Set default X and Y positioning values for uploaded image
    defaultX = 183;
    defaultY = 330;
    defaultWidth = 300;
    defaultHeight = 189;
    defaultRotate = 2;

    $('#toolbox').fadeIn(800);

    var reader = new FileReader();
    reader.onload = function(event) {
      uploadedImage.onload = function() {
        uploadedImageWidth = uploadedImage.width,
        uploadedImageHeight = uploadedImage.height;

        // Reset canvas transforms
        userContext.setTransform(1, 0, 0, 1, 0, 0);
        userContext.clearRect(0, 0, userCanvas.width, userCanvas.height);

        // Set canvas background to black
        userContext.fillStyle = "#000";
        userContext.fillRect(0, 0, userCanvas.width, userCanvas.height);

        // Transform uploaded image
        userContext.rotate(defaultRotate * Math.PI / 180);
        userContext.transform(1, 0.038, -0.10, 1, 0, 0);

        // Render uploaded image to canvas
        userContext.drawImage(uploadedImage, defaultX, defaultY, defaultWidth, defaultHeight);
      }
      uploadedImage.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);     
  }

  // Nudge uploaded image up
  $('#nudge-up').on('click', function() {
    defaultY = defaultY - 5;
    $(uploadedImage).trigger('load');
  });

  // Nudge uploaded image down
  $('#nudge-down').on('click', function() {
    defaultY = defaultY + 5;
    $(uploadedImage).trigger('load');
  });

  // Nudge uploaded image left
  $('#nudge-left').on('click', function() {
    defaultX = defaultX - 5;
    $(uploadedImage).trigger('load');
  });

  // Nudge uploaded image right
  $('#nudge-right').on('click', function() {
    defaultX = defaultX + 5;
    $(uploadedImage).trigger('load');
  });

  // Rotate uploaded image counter-clockwise
  $('#rotate-left').on('click', function() {
    defaultRotate--;
    $(uploadedImage).trigger('load');
  });

  // Rotate uploaded image clockwise
  $('#rotate-right').on('click', function() {
    defaultRotate++;
    $(uploadedImage).trigger('load');
  });

  // Set image to original size
  $('#reset-scale').on('click', function() {
    defaultWidth = uploadedImageWidth;
    defaultHeight = uploadedImageHeight;
    $(uploadedImage).trigger('load');
  });

  // Save image
  $('#save').on('click', function() {
    var elem = $(this);
    // Already in progress?
    if (elem.hasClass('working')) {
      return;
    }

    elem.addClass('working').text('Saving...');
    var exportData;

    // Render our two working canvases to a final canvas for export
    exportCanvas.width = 500;
    exportCanvas.height = 605;
    exportContext.drawImage(userCanvas, 0, 0);
    exportContext.drawImage(baseCanvas, 0, 0);
    exportData = exportCanvas.toDataURL('image/png');

    // Send to imgur
    $.ajax({
      url: 'https://api.imgur.com/3/image',
      type: 'POST',
      headers: {
        'Authorization': 'Client-ID 46811b8294146a4'
      },
      data: {
        image: exportData.replace(/^data:image\/(png|jpg);base64,/, ''),
        type: 'base64',
        title: 'Generated at papermodelplane.com/oscars/',
        description: 'Generated at papermodelplane.com/oscars/'
      }
    }).success(function(data) {
      // Reset save button
      elem.removeClass('working').text('Save image / get URL');

      // Display imgur URL
      if (data.data.link.length) {
        $('#saved').fadeIn(800).find('a').text(data.data.link).attr('href', data.data.link);
      } else {
        $('#saved').fadeIn(800).text('Sorry, something went wrong. Try again later!');
      }
    });
  });
});