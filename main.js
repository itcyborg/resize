var Password={
    reset:function(){

    },
    change:function(id){
        var current=$('[name=currentPassword]').val();
        var newPassword=$('[name=password]').val();
        var confirmPassword=$('[name=passwordConfirm]').val();
        Password.match(newPassword,confirmPassword);
        $.ajax({
            url         :   '/password/change',
            dataType    :   'json',
            type        :   'post',
            data        :   {
                'id'        :   id,
                'current'   :   current,
                '_token'    :   token,
                'new'       :   newPassword,
                'confirm'   :   confirmPassword
            },
            success:function(data){
                console.log(data);
            }
        });
    },
    match:function(newPassword,confirmPassword){
        if(newPassword!==confirmPassword){
            $('[name=passwordConfirm]').parent('div').addClass('has-error');
        }else{
            $('[name=passwordConfirm]').parent('div').addClass('has-success').removeClass('has-error');
        }
    }
};

$('[name=passwordConfirm]').keypress(function(){
    Password.match($('[name=password]').val(),$('[name=passwordConfirm]').val());
});

class ImageResize{
    constructor(fileinput,preview=null,form=null){
        this.fileinput=fileinput;
        this.max_width=fileinput.getAttribute('data-maxwidth');
        this.max_height=fileinput.getAttribute('data-maxheight');
        this.preview=document.getElementById(preview);
        this.form=document.getElementById(form);
    }

    process(file){
        if( !( /image/i ).test( file.type ) )
        {
            alert( "File "+ file.name +" is not an image." );
            return false;
        }

        // read the files
        var reader = new FileReader();
        reader.readAsArrayBuffer(file);

        reader.onload = function (event) {
            // blob stuff
            var blob = new Blob([event.target.result]); // create blob...
            window.URL = window.URL || window.webkitURL;
            var blobURL = window.URL.createObjectURL(blob); // and get it's URL

            // helper Image object
            var image = new Image();
            image.src = blobURL;
            //preview.appendChild(image); // preview commented out, I am using the canvas instead
            var l=this;
            image.onload = () => {
                // have to wait till it's loaded
                var resized = l.resizeMe(image); // send it to canvas
                // var resized = ; // send it to canvas
                var newinput = document.createElement("input");
                newinput.type = 'hidden';
                newinput.name = 'images[]';
                newinput.value = resized; // put result from canvas into new hidden input
                this.form.appendChild(newinput);
            }
        };
    }
    readfiles(files) {
        // remove the existing canvases and hidden inputs if user re-selects new pics
        var existinginputs = document.getElementsByName('images[]');
        var existingcanvases = document.getElementsByTagName('canvas');
        while (existinginputs.length > 0) { // it's a live list so removing the first element each time
            // DOMNode.prototype.remove = function() {this.parentNode.removeChild(this);}
            this.form.removeChild(existinginputs[0]);
            this.preview.removeChild(existingcanvases[0]);
        }

        for (var i = 0; i < files.length; i++) {
            this.process(files[i]); // process each file at once
        }
        this.fileinput.value = ""; //remove the original files from fileinput
        // TODO remove the previous hidden inputs if user selects other files
    }
    resizeMe(img) {

        var canvas = document.createElement('canvas');

        var width = img.width;
        var height = img.height;

        // calculate the width and height, constraining the proportions
        if (width > height) {
            if (width > this.max_width) {
                //height *= max_width / width;
                height = Math.round(height *= this.max_width / width);
                width = this.max_width;
            }
        } else {
            if (height > this.max_height) {
                //width *= max_height / height;
                width = Math.round(width *= this.max_height / height);
                height = this.max_height;
            }
        }

        // resize the canvas and draw the image data into it
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        this.preview.appendChild(canvas); // do the actual resized preview

        return canvas.toDataURL("image/jpeg",0.7); // get the data from canvas as 70% JPG (can be also PNG, etc.)
    }
}
