import { Injectable } from '@angular/core';
import { DocumentReference, Firestore, doc, getDoc, getFirestore, setDoc, updateDoc } from '@angular/fire/firestore';
import { Storage, StorageReference, deleteObject, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { UsuarioService } from '../Usuarios/usuario.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  firestore: Firestore = getFirestore()

  constructor(private storage: Storage) { }


  guardarCambios(blob: Blob, name: string,user:string,dataUrl:string) {
    let f: File;
    let url: string
    let docRef: DocumentReference
    let update: any = {}
    deleteObject(ref(this.storage, 'Users/' + user + '/' + name + ".jpeg")).catch((error) => {
      console.log("creando nuevo Registro de Boceto")
    })
    f = new File([blob], name + ".jpeg", { type: 'image/jpeg' })
    let imgRef: StorageReference = ref(this.storage, 'Users/' + user + '/' + f.name)
    uploadBytes(imgRef, f).then(async (snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        update[name] = {}
        update[name]["img"] = url
        update[name]["dataURL"] = dataUrl
        docRef = doc(this.firestore, 'Usuarios', user)
        updateDoc(docRef, update).catch((error) => {
          setDoc(docRef, update)
        }).finally(()=>{
          console.log('se ha actualizado la base')
        });
        
      })
    })
  }


  async recuperarBocetos(user:string){
    let data = await getDoc(doc(this.firestore,'Usuarios',user),)
    let map = new Map<string,Map<string,string>>()
    if(data.exists()){
      for (let key in data.data()){
        map.set(key,new Map<string,string>())
        let innerMap = map.get(key)!
        innerMap.set('img',(data.data())[key]['img'])
        innerMap.set('dataURL',(data.data())[key]['dataURL'])
      }
    }
    return map
  }


};


