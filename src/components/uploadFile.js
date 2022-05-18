import { useState, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import { useAuthentication } from '../hooks/useAuthentication';
import { db, storage } from '../config/firebase';
import { doc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import { storageBucket } from '../secrets';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const UploadFile = () => {
  const [imageUpload, setImageUpload] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [value, setValue] = useState({
    price: 0,
    name: '',
    description: '',
    tags: [],
  });

  const user = useSelector((state) => state.user.user);

  // const imagesListRef = ref(storage, "images/");

  const uploadFile = async (evt) => {
    evt.preventDefault();
    let date = Date.now()
    if(value.name === '' || value.tags === [] ){
      toast.error('Every upload needs a name and tags!')
      return
    }
    //The user gets a copy to their firebaseFolder
    let change = await doc(db, 'users', `${user.data.id}`);
    await updateDoc(change, {
      images: arrayUnion({
        path: `/images/universal/${user.data.id}/${value.name + date}`,
        likes: 0,
        comments: 0,
        purchases: 0,
      }),
    });

    //Finally there's a file with detailed information for that NFT
    const changeP = await doc(db, 'NFTs', `${value.name + date}`);
    await setDoc(changeP, {
      id: `${user.data.id + date}`,
      name: value.name,
      price: value.price * 100,
      creator: `${user.name}`,
      creatorId: `${user.data.id}`,
      description: value.description,
      image: `/images/universal/${user.data.id}/${value.name + date}`,
      created: `${date}`,
      tags: value.tags,
    });

    let getIt = await getDownloadURL(
      ref(storage, `/images/universal/${user.data.id}/${value.name + date}`),
    );
    console.log(getIt);
    setImageUrls((prev) => [...prev, getIt]);
    //rendering the image to prove we can, consider it a preview
  };

  // useEffect(() => {
  //   listAll(imagesListRef).then((response) => {
  //     response.items.forEach((item) => {
  //       getDownloadURL(item).then((url) => {
  //         setImageUrls((prev) => [...prev, url]);
  //       });
  //     });
  //   });
  // }, []);

  return (
    <div className="App">
      <form onSubmit={uploadFile}>
        <h3>Name:</h3>
        <input
          type="text"
          value={value.name}
          onChange={(evt) => setValue({ ...value, name: evt.target.value })}
        />
        <h3>Price:</h3>
        <input
          type="number"
          min="0"
          step="0.01"
          value={value.price}
          onChange={(evt) =>
            setValue({ ...value, price: evt.target.value })
          }></input>
        <h3>Description:</h3>
        <textarea
          rows="2"
          cols="50"
          name="description"
          value={value.description}
          onChange={(evt) =>
            setValue({ ...value, description: evt.target.value })
          }
        />{' '}
        <br />
        <input
          type="file"
          onChange={(event) => {
            setImageUpload(event.target.files[0]);
          }}
        />
        {value.tags.map((tag, index) => {
          return (
            <input
              type="text"
              key={`${index}`}
              onChange={(evt) => {
                {
                  let array = value.tags;
                  array[index] = evt.target.value;
                  setValue({ ...value, tags: array });
                }
              }}
              value={value.tags[index]}></input>
          );
        })}
        <button
          type="button"
          onClick={(prev) => setValue({ ...value, tags: [...value.tags, ''] })}>
          Add another Tag
        </button>
        <button type="submit"> Upload Image</button> <br />
        {imageUrls.map((url, index) => {
          return <img key={index} src={url} alt={url} style={{ width: 300 }} />;
        })}
      </form>
    </div>
  );
};

export default UploadFile;
