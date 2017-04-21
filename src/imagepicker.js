const ImagePicker = require('react-native-image-picker');
const options = {
                title:'Add a Photo ...',
                quality:0.6,
                maxWidth:1920,
                maxHeight:1920,
                storageOptions:{cameraRoll:true}};

export default getImage = () => {

  return new Promise((resolve,reject) => {
    ImagePicker.showImagePicker(options, (response) => {
      //console.log(response);
      resolve(response);

    })
  })
}                