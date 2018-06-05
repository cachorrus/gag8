import { Injectable } from '@angular/core';

import { SocialSharing } from '@ionic-native/social-sharing';
import { AngularFireDatabase } from 'angularfire2/database';
import firebase from 'firebase/app';
import 'firebase/storage';

import { archivoSubir } from '../../interfaces/archivoSubir.interface';

import { ToastController } from 'ionic-angular';

import { map } from 'rxjs/operators';

@Injectable()
export class CargaArchivoProvider {

  //private basePath = 'img';
  private postDB = '/post';
  public postList:archivoSubir[] = [];
  public lastKey:string = null;

  constructor(
    private toastCtrl:ToastController,
    private afDB:AngularFireDatabase,
    private socialSharing: SocialSharing
  ) {
    
    this.cargarUltimoKey().subscribe( () => this.cargarPosts() );
  }

  private cargarUltimoKey() {
       return this.afDB.list(this.postDB, ref => ref.orderByKey().limitToLast(1))
                  .valueChanges() //['child_added','child_removed']) //https://github.com/angular/angularfire2/issues/1158
                  .pipe(
                    map( (post:any) => {

                      if (post[0]){
                        console.log('cargarUltimoKey', JSON.stringify(post));

                        this.lastKey = post[0].key;
                        this.postList.push(post[0]);
                      } else{
                        // this.lastKey = null;
                        console.log('lastKey vacío', this.lastKey);
                      }                      

                    })
                  );
  }


  // private cargarUltimoKey() {
  //   return this.afDB.list(this.postDB, ref => ref.orderByKey().limitToLast(1))
  //                   .snapshotChanges()
  //                   .pipe(

  //                     map(actions => actions.map(a => {
                        
  //                       const key = a.payload.key;
  //                       const data = a.payload.val() as archivoSubir;

  //                       this.lastKey = key;

  //                       this.postList.push(data);

  //                       console.log('SNAPSHOT');
  //                       console.log(key);
  //                       console.log(JSON.stringify(data));
  //                       // return { id, ...data };
  //                     }))

  //                   );
  // }


  cargarPosts() {

    return new Promise(  (resolve, reject) => {

      if( !this.lastKey ) {
        console.log('no existe lastKey');
        resolve(false);
        return;
      }


      this.afDB.list(this.postDB,
          ref => ref.orderByKey()
                .limitToLast(3)                
                .endAt(this.lastKey)
          ).valueChanges()
          .subscribe(  (posts:any[]) => {

            posts.pop();

            console.log('cargarPosts subscribe', JSON.stringify(posts));

            if( posts.length == 0) {
              console.log('Ya no hay más registros');
              resolve(false);
              return;
            }

            this.lastKey = posts[0].key;

            posts.reverse().forEach( post => {

              if ( this.postList.find( x=> x.key === post.key )) {                
                //console.log('find true:', JSON.stringify(post));                
              } else {
                this.postList.push(post);
                //console.log('find false:', JSON.stringify(post));               
              }

              
            });

            resolve(true);

          }, error => {
            console.log('CargarPost subscribe Error:', JSON.stringify(error));      
            reject();
          });           

    }).catch( error => {
      console.log('CargarPost Error:', JSON.stringify(error));      
    });

  }

  cargarImagenFirebase( archivo:archivoSubir ){

    let promesa = new Promise( (resolve, reject) => {

      this.mostrarMensaje('Cargando...');

      const storageRef = firebase.storage().ref(); // referencia a firabase
      const nombreArchivo:string = new Date().valueOf().toString(); //121233

      let uploadTask: firebase.storage.UploadTask =
        //storageRef.child(`${this.basePath}/${nombreArchivo}`)
        storageRef.child(`${nombreArchivo}.jpg`)
                  .putString(archivo.img, 'base64', { contentType: 'image/jpeg' });

      uploadTask.on( firebase.storage.TaskEvent.STATE_CHANGED,
        (snapshot) => {
          // in progress
          const snap = snapshot as firebase.storage.UploadTaskSnapshot;
          // progress.percentage = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          console.log(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
        },
        (error) => {
          // fail
          console.log(JSON.stringify(error));
          this.mostrarMensaje( JSON.stringify(error) );
          reject();
        },
        () => {
          // success         
          // Upload completed successfully, now we can get the download URL
          uploadTask.snapshot.ref.getDownloadURL().then( (downloadURL:any) => {
            
            let post:archivoSubir = {
              titulo: archivo.titulo,
              key: nombreArchivo,
              img: downloadURL
            }

            console.log('getDownloadURL', JSON.stringify(post));
            
            this.crearPost(post);          
               
            this.mostrarMensaje('Archivo cargado');               
            resolve();

          }).catch( (error) => {
            console.log(JSON.stringify(error));
            this.mostrarMensaje( JSON.stringify(error) );
            reject();
          });
                    
        }
      );

    });

    return promesa;

  }

  private crearPost(archivo:archivoSubir) {

    //this.afDB.list(`${this.postDB}`).push(archivo)}; //id automatico de firebase

    this.afDB.object(`${this.postDB}/${archivo.key}`).update(archivo);
    
    //this.postList.push(archivo);

    console.log( 'crear Post' );
    console.log(JSON.stringify(this.postList));
  }

  mostrarMensaje(mensaje:string) {
    this.toastCtrl.create( {
      message: mensaje,
      duration: 2000
    }).present();
  }

  share (body:any) {

    //https://stackoverflow.com/questions/50350435/ionic-socialsharing-plugin-not-working-on-ios
    //https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin/blob/b231f855d25330031458f8fc703a405b80d63d97/README.md#using-the-share-sheet

    this.socialSharing.shareWithOptions( body )
        .then( (result ) => {
          console.log( JSON.stringify(result));
          console.log( JSON.stringify(body));
          console.log('share success');
        })
        .catch( error => {
          console.error('Error social sharing');
          console.error(JSON.stringify( error ));
        });

  }

}
