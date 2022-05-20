import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { doc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { injectStyle } from 'react-toastify/dist/inject-style';
import { Container, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Heading } from '@chakra-ui/react';
import  Compressor from 'compressorjs';



const UploadFile = () => {
  const [imageUpload, setImageUpload] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [show, setShow] = useState(false);
  const [value, setValue] = useState({
    price: 0,
    name: '',
    description: '',
    tags: [],
  });
  injectStyle();
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();

  // const imagesListRef = ref(storage, "images/");

  const uploadFile = async (evt) => {
    evt.preventDefault();



    if (value.name === '' || value.tags === []) {
      toast.error('Every upload needs a name and tags!');
      return;
    }
    if (imageUpload == null) {
      toast.error('Design required for upload');
      return;
    }
    if (user.name == '' || user.name == null) {
      toast.error('Set a username in profile to upload designs.');
      return;
    }
    setShow(!show);
    toast.info('Standby while image is uploading!');

    //We're uploading a photo to the storage, its path is the user's folder, and the filename is the user decided filename with the date
    let date = Date.now();

    const imageRefSmall = ref(
      storage,
      `images/universal/${user.data.id}/small/${value.name + date}.jpg`,
      );

    new Compressor(imageUpload, {
      quality: 0.5, // 0.6 can also be used, but its not recommended to go below.
      success: async (smallImage) => {
        await uploadBytes(imageRefSmall, smallImage);
      },
    })




    const imageRef = ref(
      storage,
      `images/universal/${user.data.id}/${value.name + date}`,
      );


      await uploadBytes(imageRef, imageUpload);

    //The user gets a copy to their firebaseFolder
    let change = await doc(db, 'users', `${user.data.id}`);
    await updateDoc(change, {
      images: arrayUnion({
        path: `/images/universal/${user.data.id}/${value.name + date}`,
        likes: 0,
        comments: 0,
        purchases: 0,
        name: value.name,
        id: `${user.data.id + date}`,
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

    // let getIt = await getDownloadURL(
    //   ref(storage, `/images/universal/${user.data.id}/${value.name + date}`),
    // );
    // setImageUrls((prev) => [...prev, getIt]);
    //rendering the image to prove we can, consider it a preview
    toast.success('Image Upload Successfully!');
    navigate('/');
  };


  return (
    <Container
      style={{ marginTop: '5rem' }}
      className="d-flex justify-content-center ">
      <Form onSubmit={uploadFile} className="d-flex flex-column">
        <Heading>Upload a new design!</Heading>
        <h3 className="my-3">Name:</h3>
        <Form.Group className="mb-3" controlId="name">
          <Form.Control
            type="text"
            value={value.name}
            onChange={(evt) => setValue({ ...value, name: evt.target.value })}
          />
        </Form.Group>
        <h3 className="mb-3">Price:</h3>
        <Form.Group className="mb-3" controlId="price">
          <Form.Control
            type="number"
            min="0"
            step="0.01"
            value={value.price}
            onChange={(evt) => setValue({ ...value, price: evt.target.value })}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="description">
          <h3 className="mb-3">Description:</h3>
          <Form.Control
            as="textarea"
            rows="2"
            cols="50"
            name="description"
            value={value.description}
            onChange={(evt) =>
              setValue({ ...value, description: evt.target.value })
            }
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="file">
          <Form.Control
            type="file"
            onChange={(event) => {
              setImageUpload(event.target.files[0]);
              console.log((event.target.files[0]))
              new Compressor(event.target.files[0], {
                quality: 0.1, // 0.6 can also be used, but its not recommended to go below.
                success: (compressedResult) => {
                  // compressedResult has the compressed file.
                  // Use the compressed file to upload the images to your server.
                  console.log(compressedResult)
                },
              })




            }}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="file">
          <h3 className="mb-3">Tags:</h3>
          {value.tags.map((tag, index) => {
            return (
              <Form.Control
                type="text"
                className="mb-2"
                key={`${index}`}
                onChange={(evt) => {
                  let array = value.tags;
                  array[index] = evt.target.value.toLowerCase();
                  setValue({ ...value, tags: array });
                }}
                value={value.tags[index]}
              />
            );
          })}

          <Button
            type="button"
            onClick={(prev) =>
              setValue({ ...value, tags: [...value.tags, ''] })
            }>
            Add another Tag
          </Button>
        </Form.Group>
        <Button className="mb-2" type="submit" disabled={show === true}>
          Upload Image
        </Button>
        <br />
        {imageUrls.map((url, index) => {
          return <img key={index} src={url} alt={url} style={{ width: 300 }} />;
        })}
      </Form>
    </Container>
  );
};

export default UploadFile;
