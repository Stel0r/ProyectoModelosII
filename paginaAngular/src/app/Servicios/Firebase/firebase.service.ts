import { Injectable } from '@angular/core';
import { DocumentReference, FieldValue, Firestore, deleteField, doc, getDoc, getFirestore, setDoc, updateDoc } from '@angular/fire/firestore';
import { Storage, StorageReference, deleteObject, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { UsuarioService } from '../Usuarios/usuario.service';
import { retry } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  firestore: Firestore = getFirestore()

  constructor(private storage: Storage) { }


  async guardarCambios(blob: Blob, name: string,user:string,dataUrl:string){
    let f: File;
    let url: string
    let docRef: DocumentReference
    let update: any = {}
    deleteObject(ref(this.storage, 'Users/' + user + '/' + name + ".jpeg")).catch((error) => {
      console.log("creando nuevo Registro de Boceto")
    })
    f = new File([blob], name + ".jpeg", { type: 'image/jpeg' })
    let imgRef: StorageReference = ref(this.storage, 'Users/' + user + '/' + f.name)
    return await uploadBytes(imgRef, f).then(async (snapshot) => {
      return await getDownloadURL(snapshot.ref).then(async(url) => {
        update[name] = {}
        update[name]["img"] = url
        update[name]["dataURL"] = dataUrl
        docRef = doc(this.firestore, 'Usuarios', user)
        return await updateDoc(docRef, update).catch(async (error) => {
          return await setDoc(docRef, update).then(()=>{return "exito"})
        }).then(async ()=>{
          console.log('se ha actualizado la base')
          return "exito"
        })
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

  async eliminarBoceto(name:string,user:string){
    console.log(name)
    console.log(user)
    let imgref: StorageReference =  ref(this.storage, 'Users/' + user + '/' + name + ".jpeg")
    return await deleteObject(imgref).then(async()=>{
      let docRef = doc(this.firestore,'Usuarios',user)
      let update:any = {}
      update[name] = deleteField()
      return await updateDoc(docRef,update).then((response)=>{
        return 1
      }).catch((error)=>{
        console.log(error)
        return 0
      })
    })
    .catch((error) => {
      console.log(error)
      return 0
    })
  }


};


