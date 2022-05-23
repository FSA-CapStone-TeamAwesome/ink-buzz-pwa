import { useState } from 'react';
import { ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { doc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import { useSelector, useDispatch } from 'react-redux';
import {updateUser} from '../store/userStore'
import { toast } from 'react-toastify';
import { injectStyle } from 'react-toastify/dist/inject-style';
import { Container, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Heading } from '@chakra-ui/react';
import Compressor from 'compressorjs';


const UploadFile = () => {
  injectStyle();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  const [imageUpload, setImageUpload] = useState(null);
  const [show, setShow] = useState(false);
  const [value, setValue] = useState({
    price: 0,
    name: '',
    description: '',
    tags: [''],
  });

  const uploadFile = async (evt) => {
    evt.preventDefault();
    const arrLength = value.tags.length - 1;
    if (arrLength !== -1) {
      while (value.tags[value.tags.length - 1] === '') {
        value.tags.pop();
      }
    }
    if (
      value.name === '' ||
      value.tags.length === 0 ||
      value.tags.includes('')
    ) {
      toast.error('Every upload needs a name and tags!');
      return;
      }
    if (imageUpload == null) {
      toast.error('Design required for upload!');
      return;
    }
    if (user.name === '' || user.name == null) {
      toast.error('Set a username in profile to upload designs.');
      return;
    }
    setShow(!show);
    toast.info('Standby while image is uploading!');

    //We're uploading a photo to the storage, its path is the user's folder, and the filename is the user decided filename with the date
    let date = Date.now();

    const imageRefSmall = ref(
      storage,
      `images/universal/${user.data.id}/small/${value.name + date}.webp`,
    );

    new Compressor(imageUpload, {
      quality: 0.5,
      width: 350,
      mimeType: 'image/webp',
      success: async (smallImage) => {
        await uploadBytes(imageRefSmall, smallImage);
      },
    });

    const imageRef = ref(
      storage,
      `images/universal/${user.data.id}/${value.name + date}.webp`,
    );

    new Compressor(imageUpload, {
      quality: 1,
      mimeType: 'image/webp',
      success: async (fullImage) => {
        await uploadBytes(imageRef, fullImage);
      },
    });

    //The user gets a copy to their firebaseFolder
    let change = await doc(db, 'users', `${user.data.id}`);
    await updateDoc(change, {
      images: arrayUnion({
        smallPath: `/images/universal/${user.data.id}/small/${value.name + date}.webp`,
        path: `/images/universal/${user.data.id}/${value.name + date}.webp`,
        created: `${date}`,
        name: value.name,
        id: `${user.data.id + date}`,
      }),
    });

    await dispatch(
      updateUser({
        user,
        update: {
          images: arrayUnion({
            smallPath: `/images/universal/${user.data.id}/small/${value.name + date}.webp`,
            path: `/images/universal/${user.data.id}/${value.name + date}.webp`,
            created: `${date}`,
            name: value.name,
            id: `${user.data.id + date}`,
        })}
      })
    )



    //size: 1004113 this is about 1MB size file

    //Finally there's a file with detailed information for that NFT
    const changeP = await doc(db, 'NFTs', `${value.name + date}`);
    await setDoc(changeP, {
      id: `${user.data.id + date}`,
      name: value.name,
      price: value.price * 100,
      creator: `${user.name}`,
      creatorId: `${user.data.id}`,
      description: value.description,
      smallImage: `/images/universal/${user.data.id}/small/${value.name + date}.webp`,
      image: `/images/universal/${user.data.id}/${value.name + date}.webp`,
      created: `${date}`,
      tags: value.tags,
      owner: `${user.name}`,
      ownerId: `${user.data.id}`
    });
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
        <h3 className="mb-3">Ethereum Price:</h3>
        <Form.Group className="mb-3" controlId="price">
          <Form.Control
            type="number"
            min="0"
            step="0.0001"
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
          <h3 className="mb-3">Upload Design Here:</h3>
          <Form.Control
            type="file"
            onChange={(event) => {
              setImageUpload(event.target.files[0]);
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

          {value.tags[value.tags.length - 1] !== '' && (
            <Button
              type="button"
              className="me-3"
              onClick={() => setValue({ ...value, tags: [...value.tags, ''] })}>
              Add another Tag
            </Button>
          )}
          {value.tags[0] && (
            <Button
              type="button"
              variant="danger"
              onClick={() => setValue({ ...value, tags: [''] })}>
              Clear All Tags
            </Button>
          )}
        </Form.Group>
        <Button className="mb-2" type="submit" disabled={show === true}>
          Upload Image
        </Button>
      </Form>
    </Container>
  );
};

export default UploadFile;
