import { useState, useEffect } from "react";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
} from "firebase/storage";
import { useAuthentication } from '../hooks/useAuthentication';
import {db, storage} from '../config/firebase'
import { doc, updateDoc, arrayUnion, setDoc } from "firebase/firestore";
import { storageBucket } from "../secrets";

const UploadFile = () => {
  const [imageUpload, setImageUpload] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);

  const { user } = useAuthentication()

  const imagesListRef = ref(storage, "images/");

  const uploadFile = async () => {
    let date = Date.now()
    if (imageUpload == null) return;
    const imageRef = ref(storage, `images/universal/${user.uid}/${imageUpload.name+date}`);
    await uploadBytes(imageRef, imageUpload)

    let url = await ref(storage ,'images/universal/5Yq3gp4lSlhh59zGSWgcKWjHZeQ2/test1.png')


    let change = await doc(db, 'users', `${user.uid}`)

    //After photo uploads to storage, we make an entry on the users account
    await updateDoc(change, {
      images: arrayUnion({
        path: `/images/universal/${user.uid}/${imageUpload.name + date}`,
        likes: 0,
        comments: 0,
        purchases: 0,
      })
    })
    const changeP = await doc(db, 'NFTs',`${imageUpload.name + date}`)

    await setDoc(changeP, {
      id:`${user.uid+date}`,
      name:`userInput`,
      price: 0,
      creator: `${user.email}`,
      description:'',
      image:`/images/universal/${user.uid}/${imageUpload.name + date}`

    })
    let getIt = await getDownloadURL(ref(storage, `/images/universal/${user.uid}/${imageUpload.name + date}`))
    setImageUrls([getIt])

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
