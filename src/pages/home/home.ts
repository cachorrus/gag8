import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';
import { SubirPage } from '../subir/subir';
import { CargaArchivoProvider } from '../../providers/carga-archivo/carga-archivo';
import { archivoSubir } from '../../interfaces/archivoSubir.interface';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage{

  hayMas:boolean = true;

  constructor(
    public modalCtrl: ModalController,
    public _cap: CargaArchivoProvider
  ) {

  }

  mostrarModal() {
    
    let subirModal = this.modalCtrl.create(SubirPage);
    subirModal.present();

  }

  doInfinite(infiniteScroll) {
    console.log('Begin async operation');

    this._cap.cargarPosts().then( (hayMas:boolean) => {

      this.hayMas = hayMas;
      console.log(hayMas);

      infiniteScroll.complete();
      
    });

  }

  compartir( post:archivoSubir ) {
    
    //const img = post.img.replace('%2F','%252F');
    // existe un bug cuando se guarda en una carpeta en el storage de firebase
    // por lo que se debe guardar en la raiz si se van a compartir con este plugin
    //https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin/issues/690
    const opciones = {
      message: 'via 8gag by cachorrus',
      subject: post.titulo, //para correo
      files: [ post.img ],
      //url: post.img// decodeURIComponent(post.img)
    }

    this._cap.share(opciones);

  }

}
