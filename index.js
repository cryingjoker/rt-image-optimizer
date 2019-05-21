const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');
const argv = require('yargs').argv;
const fs = require('fs');
const path = require('path');
const tmpFolder = argv['orig'];
const distFolder = argv['dist'];
const supportFormats = ['\\.jpg','\\.jpeg','\\.png'];
const dirname = __dirname.split('/node_modules')[0];
const supportFormatsRegexp = new RegExp(`(${supportFormats.join('$)|(')}$)`,'i');
const sizeOf = require('image-size');
const tmpFolderPath = path.join(dirname, tmpFolder);
const distFolderPath = path.join(dirname, distFolder);
const sharp = require('sharp');
const maxWidth = argv['max-width'];


fs.readdir(tmpFolderPath, (err, files) => {
    files.forEach((file)=>{
        if(supportFormatsRegexp.test(file)){
            const filePath = path.join(tmpFolderPath,file);
            sizeOf(filePath, (err, dimensions)=>{
                if(maxWidth && dimensions.width > +maxWidth){
                    const newWidth = maxWidth;
                    const newHeigth = Math.ceil(maxWidth/dimensions.width * dimensions.height);
                    const newFilePath = path.join(tmpFolderPath,file.split('.').join('-new.'));
                    sharp(filePath)
                        .resize(newWidth, newHeigth)
                        .toFile(newFilePath)
                        .then((info) => {
                            fs.unlinkSync(filePath);
                            fs.rename(newFilePath,filePath,(err,i)=>{
                                optimizyImage(filePath,distFolder)
                            })
                        });
                }else{
                    optimizyImage(filePath,distFolderPath)
                }

            })
        }
    });
});


const  optimizyImage = async (filePath, distDirPath) => {
  await imagemin([filePath], distDirPath, {
    plugins: [
      imageminPngquant()
    ]
  });
  console.log('Images optimized');
};
