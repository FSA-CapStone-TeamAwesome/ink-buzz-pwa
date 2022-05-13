import { useState, useEffect } from "react";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
} from "firebase/storage";
import { useAuthentication } from '../hooks/useAuthentication';
import {db, storage} from '../config/firebase'
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

const UploadFile = () => {
  const [imageUpload, setImageUpload] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);

  const { user } = useAuthentication()

  const imagesListRef = ref(storage, "images/");

  const uploadFile = async () => {
    if (imageUpload == null) return;
    const imageRef = ref(storage, `images/universal/${user.uid}/${imageUpload.name}`);
    await uploadBytes(imageRef, imageUpload)

    let url = await ref(storage ,'images/universal/5Yq3gp4lSlhh59zGSWgcKWjHZeQ2/test1.png')
    console.log(url)
    setImageUrls((prev) => [...prev, 'https://firebasestorage.googleapis.com/v0/b/ink-buzz.appspot.com/o/images%2Funiversal%2FuploadTests%2Ftest1.png?alt=media&token=2a0c8f45-dc2c-4e65-a917-d28ced3fe888 '])

    let change = await doc(db, 'users', `${user.uid}`)
    //After photo uploads to storage, we make an entry on the users account
    await updateDoc(change, {
      photos: arrayUnion({
        path: `/images/universal/${user.uid}/${imageUpload.name}`,
        caption: '',
        likes: 0,
        comments: 0,
      })
    })


  };

  useEffect(() => {
    listAll(imagesListRef).then((response) => {
      response.items.forEach((item) => {
        getDownloadURL(item).then((url) => {
          setImageUrls((prev) => [...prev, url]);
        });
      });
    });
  }, []);

  return (
    <div className="App">
      <input
        type="file"
        onChange={(event) => {
          setImageUpload(event.target.files[0]);
        }}
      />
      <button onClick={uploadFile}> Upload Image</button>
      {imageUrls.map((url) => {
        return <img src={url} alt={url} />;
      })}
    </div>
  );
}

export default UploadFile;
