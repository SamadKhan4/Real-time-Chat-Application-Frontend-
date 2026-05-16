/* eslint-disable no-unused-vars */
import React, { useContext, useState } from 'react'
import assets from '../assets/assets'
import {AuthContext} from '../../context/AuthContext'
const LoginPage = () => {

  const [currState , setCurrState] = useState("Sign up")
  const [fullName , setFullName] = useState("")
  const [email , setEmail] = useState("")
  const [password , setPassword] = useState("")
  const [showPassword , setShowPassword] = useState(false)
  const [bio , setBio] = useState("")
  const [isDataSubmitted ,setIsDataSubmitted] = useState(false) ;
  
  const {login} = useContext(AuthContext)

  const onSubmitHandler = (event) =>{
   event.preventDefault();
   if(currState === 'Sign up' && !isDataSubmitted) {
    setIsDataSubmitted(true)
    return; 
   }
   login(currState === "Sign up" ? 'signup' : 'login' , { fullName , email , password, bio } )

  }

  return (
    <div className='min-h-screen bg-cover bg-centre flex items-center  justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
        {/* left */}
        <img src={assets.logo_big} className='w-[min(30vw,250px)]' />

        {/* Right */}
        <form  onSubmit={onSubmitHandler}
        className='border-2 bg-white/8 text-white border-grey-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg' >
          <h2 className='font-medium text-2xl flex justify-between items-center'>
            {currState} 
            {isDataSubmitted && <img  onClick={()=> setIsDataSubmitted(false)} src={assets.arrow_icon} alt="" className='w-5 cursor-pointer' />}
            
          </h2>
         {currState === "Sign up" && !isDataSubmitted && (
            <input onChange={(e) => setFullName(e.target.value)} value={fullName}
            type="text" className='p-2 border border-grey-500 rounded-md focus:outline-none' placeholder='Full Name' required />
         )}
         {!isDataSubmitted && (
          <>
          <input onChange={(e) => setEmail(e.target.value)} value={email}
           type="email" placeholder='Email Address'  required className='p-2 border border-grey-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'/>
           <div className='relative'>
            <input onChange={(e) => setPassword(e.target.value)} value={password}
            type={showPassword ? "text" : "password"} placeholder='Password..'  required className='w-full p-2 pr-10 border border-grey-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'/>
            <button
              type='button'
              onClick={() => setShowPassword((prev) => !prev)}
              className='absolute inset-y-0 right-3 flex items-center text-white/70 hover:text-white'
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className='w-5 h-5' fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6A2 2 0 0012 14a2 2 0 001.4-.6M9.9 4.2A10.7 10.7 0 0112 4c5 0 8.5 4.1 9.7 6a2 2 0 010 2c-.5.8-1.4 1.9-2.6 2.9M6.4 6.4A16.2 16.2 0 002.3 10a2 2 0 000 2c1.2 1.9 4.7 6 9.7 6 1.3 0 2.5-.3 3.6-.8" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className='w-5 h-5' fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.3 10a2 2 0 000 2c1.2 1.9 4.7 6 9.7 6s8.5-4.1 9.7-6a2 2 0 000-2c-1.2-1.9-4.7-6-9.7-6S3.5 8.1 2.3 10z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              )}
            </button>
           </div>
          </>
         )}

         {
          currState === "Sign up" && isDataSubmitted && (
            <textarea onChange={(e) => setBio(e.target.value)} value={bio}
             rows={4} className='p-2 border border-grey-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' placeholder='provide short bio' required></textarea>
          )}
          
          <button type='submit'
          className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer'>
            {currState === "Sign up" ? "Create Account" : "Login Now" }
          </button >
          <div className='flex items-center gap-2 text-sm text-grey-500'>
            <input type="checkbox" />
            <p>
              Agree to the Term of use & privary policy.
            </p>
          </div>
              <div className='flex flex-col gap-2'>
                {currState === 'Sign up' ? (
                  <p className='text-sm text-grey-600'>Already have an Account <span onClick={() => {setCurrState("Login") ; setIsDataSubmitted(false)}} className='font-medium text-violet-500 cursor-pointer' >login here</span></p>
                ) : (
                  <p className='text-sm text-grey-600'>Create an Account <span onClick={() => setCurrState("Sign up") } className='font-medium text-violet-500 cursor-pointer'>Sign up..</span></p>
                )}
              </div>
        </form>
    </div>
  )
}

export default LoginPage 
