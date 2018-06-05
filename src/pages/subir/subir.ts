import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { CargaArchivoProvider } from '../../providers/carga-archivo/carga-archivo';
import { archivoSubir } from '../../interfaces/archivoSubir.interface';

@Component({
  selector: 'page-subir',
  templateUrl: 'subir.html',
})
export class SubirPage {

  // titulo:string = '';  
  base64Image:string = '';
  post:archivoSubir =  { img: '', titulo:''};
  
  constructor(
    private viewCtrl: ViewController,
    private camera: Camera,
    private _cap: CargaArchivoProvider
  ) {
  }

  cerrarModal() {
    this.viewCtrl.dismiss();
  }

  tomarFoto() {

    const options: CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType:  this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true
    }

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64:
      this.base64Image = 'data:image/jpeg;base64,' + imageData;
      this.post.img = imageData;
     }, (err) => {
      // Handle error
        console.error('Error en camara:', JSON.stringify(err));
     });

  }

  mostrarGaleria() {
    
    let options = {
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG, 
      mediaType: this.camera.MediaType.PICTURE, 
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY //DESDE Libreria
    };

    this.camera.getPicture(options).then((imageData) => {
      this.base64Image = 'data:image/jpeg;base64,' + imageData;
      this.post.img = imageData;
    }, (err) => {
      console.log("Error en galería: ", JSON.stringify(err));
    });

  }

  crearPost() {

    this._cap.cargarImagenFirebase( this.post ).then( () => this.cerrarModal());

  }

}
