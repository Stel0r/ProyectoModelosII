import { Injectable } from '@angular/core';
import { DocumentReference, Firestore, doc, getFirestore, setDoc, updateDoc } from '@angular/fire/firestore';
import { Storage, StorageReference, deleteObject, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { UsuarioService } from '../Usuarios/usuario.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  firestore: Firestore

  constructor(private storage: Storage, private usuarioService: UsuarioService) { }

  ngAfterInit() {
    this.firestore = getFirestore()
  }

  guardarCambios(blob: Blob, name: string) {
    let f: File;
    let url: string
    let docRef: DocumentReference
    let update: any = {}
    deleteObject(ref(this.storage, 'Users/' + this.usuarioService.UsuarioLogeado + '/' + name + ".jpeg")).catch((error) => {
      console.log("creando nuevo Registro de Boceto")
    })
    f = new File([blob], name + ".jpeg", { type: 'image/jpeg' })
    let imgRef: StorageReference = ref(this.storage, 'Users/' + this.usuarioService.UsuarioLogeado + '/' + f.name)
    uploadBytes(imgRef, f).then(async (snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        console.log(url)
        update[name] = url
        docRef = doc(this.firestore, 'Usuarios', this.usuarioService.UsuarioLogeado)
        updateDoc(docRef, update).catch((error) => {
          setDoc(docRef, update)
        });
        console.log('se ha actualizado la base')
      })
    })
  }



};


