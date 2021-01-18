var foto;
window.onload = function() {
    foto = new Foto();
}

class Foto{
    constructor()
{
    var root=this;this.operationOrgCanvas=document.createElement("canvas");
    this.operationOrgCtx=this.operationOrgCanvas.getContext("2d");
    this.operationEditedCanvas=document.createElement("canvas");
    this.operationEditedCtx=this.operationEditedCanvas.getContext("2d");
    this.fileInput=document.getElementById("foto-file");
    this.fileInput.addEventListener("change",function(event){root.loadImage();})
    this.image=null;
    this.imageData=null;
    this.imageWidth=0;
    this.imageHeight=0;
    this.convertedToGrayScale=false;
    this.redPixelMatrix=[];
    this.greenPixelMatrix=[];
    this.bluePixelMatrix=[];
    this.alphaPixelMatrix=[];
    this.pickedR="";
    this.pickedG="";
    this.pickedB="";
    this.selectedFileName="";
    this.selectStart=false;
    this.startX="";
    this.startY="";
    this.endX="";
    this.endY="";
    this.excludeArea=false;
}

    loadImage()
    {
        var input=document.getElementById("foto-file");
        this.selectedFileName=input.files.item(0).name
        var reader=new FileReader();
        var root=this;
        reader.onload=function(e)
        {
            root.image=new Image();
            root.image.onload=function()
            {
                root.imageWidth=root.image.width;
                root.imageHeight=root.image.height;
                root.operationOrgCanvas.width=root.imageWidth;
                root.operationOrgCanvas.height=root.imageHeight;
                root.operationEditedCanvas.width=root.imageWidth;
                root.operationEditedCanvas.height=root.imageHeight;
                root.imageData=[];root.redPixelMatrix=[];
                root.greenPixelMatrix=[];
                root.bluePixelMatrix=[];
                root.alphaPixelMatrix=[];
                root.operationOrgCtx.clearRect(0,0,root.operationOrgCanvas.width,root.operationOrgCanvas.height);
                root.operationEditedCtx.clearRect(0,0,root.operationEditedCanvas.width,root.operationEditedCanvas.height);
                root.operationOrgCtx.drawImage(root.image,0,0);root.previewImage(root.operationOrgCanvas);
                root.imageData=root.operationOrgCtx.getImageData(0,0,root.operationOrgCanvas.width,root.operationOrgCanvas.height);
                var r=[],g=[],b=[],a=[];
                for(var i=0;i<root.imageData.data.length;i=i+4)
                {
                    if((i/4)%root.imageWidth==0)
                    {
                        if(i!=0){root.redPixelMatrix.push(r);
                            root.greenPixelMatrix.push(g);
                            root.bluePixelMatrix.push(b);
                            root.alphaPixelMatrix.push(a);
                        }
                        r=[];g=[];b=[];a=[];
                    }
                    r.push(root.imageData.data[i]);
                    g.push(root.imageData.data[i+1]);
                    b.push(root.imageData.data[i+2]);
                    a.push(root.imageData.data[i+3]);
                }
                console.log("Pixel Data Loaded");
            }
            root.image.src=e.target.result
        }
        reader.readAsDataURL(input.files[0]);
    }
    grayscale()
    {
        var modifiedImageData=this.imageData;
        for(var i=0;i<modifiedImageData.data.length;i=i+4)
        {
            var red=modifiedImageData.data[i];
            var green=modifiedImageData.data[i+1];
            var blue=modifiedImageData.data[i+2];
            var alpha=modifiedImageData.data[i+3];
            modifiedImageData.data[i]=(red+green+blue)/3;
            modifiedImageData.data[i+1]=(red+green+blue)/3;
            modifiedImageData.data[i+2]=(red+green+blue)/3;
        }
        this.operationEditedCtx.putImageData(modifiedImageData,0,0);
        this.previewImage();
        this.convertedToGrayScale=!this.convertedToGrayScale;
    }
    makeBright()
    {
        var modifiedImageData=this.imageData;
        for(var i=0;i<modifiedImageData.data.length;i=i+4)
        {
            var pixel=[];
            var red=modifiedImageData.data[i];
            var green=modifiedImageData.data[i+1];
            var blue=modifiedImageData.data[i+2];
            var alpha=modifiedImageData.data[i+3];
            modifiedImageData.data[i]=red+10;
            modifiedImageData.data[i+1]=green+10;
            modifiedImageData.data[i+2]=blue+10;
            modifiedImageData.data[i+3]=alpha;
        }
        this.operationEditedCtx.putImageData(modifiedImageData,0,0);
        this.previewImage();
    }
    makeDark()
    {
        var modifiedImageData=this.imageData;
        for(var i=0;i<modifiedImageData.data.length;i=i+4)
        {
            modifiedImageData.data[i]-=10;
            modifiedImageData.data[i+1]-=10;
            modifiedImageData.data[i+2]-=10;
            modifiedImageData.data[i+3]-=10;
        }
        this.operationEditedCtx.putImageData(modifiedImageData,0,0);this.previewImage();
    }
    makeTransparent()
    {
        console.log(this.pickedR);
        var modifiedImageData=this.imageData;
        for(var i=0;i<modifiedImageData.data.length;i=i+4)
        {
            if(Math.abs(modifiedImageData.data[i]-this.pickedR)<20&&Math.abs(modifiedImageData.data[i+1]-this.pickedG)<20&&Math.abs(modifiedImageData.data[i+2]-this.pickedB)<20)
modifiedImageData.data[i+3]=0;
        }
        this.operationEditedCtx.putImageData(modifiedImageData,0,0);
        this.previewImage();
    }
    applyFilter(filter)
    {
        var count=0;for(var i=0;i<this.imageData.data.length;i=i+4)
        {
            var finalR,finalG,finalB;
            var row=parseInt((i/4)/this.imageWidth);
            var col=(i/4)%this.imageWidth;
            if(row==0||col==0||row==this.imageHeight-1||col==this.imageWidth-1)
            continue;
            var finalR=0,finalG=0,finalB=0,finalA=0;
            for(var x=0;x<3;x++)
            {
                for(var y=0;y<3;y++)
                {
                    if(this.redPixelMatrix[row+(x-1)]==undefined)
                    {
                        continue;
                    }
                    if(this.redPixelMatrix[row+(x-1)][col+(y-1)]==undefined)
                    {
                        continue;
                    }
                    finalR+=filter[x][y]*this.redPixelMatrix[row+(x-1)][col+(y-1)];
                    finalG+=filter[x][y]*this.greenPixelMatrix[row+(x-1)][col+(y-1)];
                    finalB+=filter[x][y]*this.bluePixelMatrix[row+(x-1)][col+(y-1)];
                    finalA+=filter[x][y]*this.alphaPixelMatrix[row+(x-1)][col+(y-1)];
                }
            }
            if(this.convertedToGrayScale)
            {
                this.imageData.data[i]=(finalR+finalG+finalB)/3;
                this.imageData.data[i+1]=(finalR+finalG+finalB)/3;
                this.imageData.data[i+2]=(finalR+finalG+finalB)/3;
                this.imageData.data[i+3]=finalA;
            }
            else
            {
                this.imageData.data[i]=finalR;
                this.imageData.data[i+1]=finalG;
                this.imageData.data[i+2]=finalB;
                this.imageData.data[i+3]=finalA;
            }
        }
        console.log("Its here");
        this.operationEditedCtx.putImageData(this.imageData,0,0);
        this.previewImage();
    }
    applyBlurFilter()
    {
        this.applyFilter([[.0625,.125,.0625],[.125,.25,.125],[.0625,.125,.0625]])
    }
    applyEmbossFilter()
    {
        this.applyFilter([[-2,-1,0],[-1,1,1],[0,1,2]])
    }
    applySharpFilter()
    {
        this.applyFilter([[0,-1,0],[-1,5,-1],[0,-1,0]])
    }
    applyCustom()
    {
        this.applyFilter([[-1,-1,-1],[2,2,2],[-1,-1,-1]])
    }
    export()
    {
        var link=document.createElement('a');link.download=this.selectedFileName+'-edited.png';link.href=this.operationEditedCanvas.toDataURL()
        link.click();
    }
    previewImage(canvas, firstLoad, recreateImageFlag)
    {
        var root=this;
        var image=document.getElementById("foto-image");
        this.image.setAttribute('draggable', false);

        var root = this;
        if(firstLoad != undefined && firstLoad == 0) {
            this.image.addEventListener("mouseover", function(event){
                this.style.cursor = "crosshair";
        })

        this.image.addEventListener("click", function(event){
            root.relativeStartX = event.offsetX;
            root.relativeStartY = event.offsetY;

            if(root.ctrlPressed) {
                root.pickColorPixel(root.relativeStartX, root.relativeStartY);
            }
            root.selectStart = false;
        })

        this.image.addEventListener("mousedown", function(event){
            root.selectStart = true;
            root.startX = event.clientX;
            root.startY = event.clientY;

            root.relativeStartX = event.offsetX;
            root.relativeStartY = event.offsetY;
        })

        this.image.addEventListener("mousemove", function(event){
            root.endX = event.clientX;
            root.endY = event.clientY;
            
            if(root.selectStart) {

                root.selectRect.style.position = "fixed";
                root.selectRect.style.display = "initial";
                root.selectRect.style.border = "2px dashed black";
                root.selectRect.style.top = root.startY + "px";
                root.selectRect.style.left = root.startX + "px";

                root.selectRect.style.height = (root.endY - root.startY) + "px";
                root.selectRect.style.width = (root.endX - root.startX) + "px";
            }
        })

        this.image.addEventListener("mouseup", function(event){

            root.relativeEndX = event.layerX;
            root.relativeEndY = event.layerY;

            root.selectStart = false;
            root.selectRect.style.height = "0px";
            root.selectRect.style.width = "0px";
            root.selectRect.style.display = "none";
        })

        this.selectRect.addEventListener("mouseup", function(event){
            root.selectStart = false;
        })
    }

        
        if(canvas==undefined)
        imagee.src=root.operationEditedCanvas.toDataURL();
        else
        {
            image.src=canvas.toDataURL();
        }
    }
    recreateImageObject() {
        this.image = new Image();
        this.image.src = this.operationOrgCanvas.toDataURL();
    }

    cropSelected() {
        var imgW = this.image.width;
        var imgH = this.image.height;

        var imgWFactor = this.imageWidth / imgW;
        var imageHFactor = this.imageHeight / imgH;
        var actualStartX = this.relativeStartX * imgWFactor;
        var actualStartY = this.relativeStartY * imageHFactor;

        var croppedWidth = parseInt(parseInt(this.selectRect.style.width.replace(/\D/g,'')) * imgWFactor);
        var croppedHeight = parseInt(parseInt(this.selectRect.style.height.replace(/\D/g,'')) * imageHFactor);

        var editedCroppedImageData = this.operationEditedCtx.getImageData(actualStartX, actualStartY, croppedWidth, croppedHeight);
        var orgCroppedImageData = this.operationOrgCtx.getImageData(actualStartX, actualStartY, croppedWidth, croppedHeight);
        
        this.operationEditedCtx.clearRect(0, 0, this.operationEditedCanvas.width, this.operationEditedCanvas.height);
        this.operationOrgCtx.clearRect(0, 0, this.operationOrgCtx.width, this.operationOrgCtx.height);

        this.operationEditedCanvas.width = croppedWidth;
        this.operationEditedCanvas.height = croppedHeight;

        this.operationOrgCanvas.width = croppedWidth;
        this.operationOrgCanvas.height = croppedHeight;

        this.operationEditedCtx.putImageData(editedCroppedImageData, 0, 0);
        this.operationOrgCtx.putImageData(orgCroppedImageData, 0, 0);

        this.imageWidth = croppedWidth;
        this.imageHeight = croppedHeight;

        this.imageData = this.operationOrgCtx.getImageData(0, 0, this.operationOrgCanvas.width, this.operationOrgCanvas.height);
        this.generatePixelMatrix();

        this.selectRect.style.display = "none";
        
        this.previewImage()

    }

}

function selectImage() {
    document.getElementById("foto-file").click();
}

function grayscale() {
    foto.grayscale();
}

function makeBright() {
    foto.makeBright();
}

function makeDark() {
    foto.makeDark();
}

function makeBlur() {
    foto.applyBlurFilter();
}

function makeEmboss() {
    foto.applyEmbossFilter();
}

function makeSharp() {
    foto.applySharpFilter();
}

function download() {
    foto.export();
}
function crop(){
    foto.cropSelected();
}