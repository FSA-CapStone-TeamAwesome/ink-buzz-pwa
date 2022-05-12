import {useState} from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import {Button} from 'react-bootstrap'
import { useNavigate } from "react-router-dom";

export const SignIn = () => {
  const navigate = useNavigate()
  const [value, setValue] = useState({
    email: "",
    password: "",
    error: "",
  });

  async function signIn(evt) {
    evt.preventDefault()
    if (value.email === "" || value.password === "") {
      setValue({
        ...value,
        error: "Email and password are mandatory.",
      });
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, value.email, value.password);
      if(auth.currentUser){
        navigate('/')
      }
    } catch (error) {
      setValue({
        ...value,
        error: error.message,
      });

    }
  }

  return (
    <div>
      <h1>Sign In</h1>
      {!!value.error && (
        <div className='error'>
          {value.error}
        </div>
      )}
    <form className='controls' onSubmit={signIn}>
      <input
      placeholder='Email'
      type='email'
      value={value.email}
      onChange={(evt) => {

        setValue({...value, email: evt.target.value})}}
      />
      <input
          placeholder='Password'
          value={value.password}
          type='password'
          onChange={(evt) => setValue({...value, password: evt.target.value})}
        />
        <Button type="submit">Submit</Button>
    </form>

    </div>
  )
}
