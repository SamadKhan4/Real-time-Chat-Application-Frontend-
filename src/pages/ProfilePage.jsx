/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets'
const ProfilePage = () => {

const [selectedImg , SetSelectedImg] = useState(null)
const navigate = useNavigate();
const [name , setName] = useState("Martin Johnson")
const [bio , setBio] = useState("hi Everyone , I am Using QuickChat")

  return (
    <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center'>
      <div className='w-5/6 max-w-2xl backdrop-blur-2xl text-white/80 border-2 border-white/50 flex items-center justify-between max-sm:flex-col-reverse rounded-lg'>
        <form className='flex flex-col gap-5 p-10 flex-1'>
          <h3 className='text-lg'>
            Profile Details
          </h3>

          <label htmlFor='avatar' className='flex items-center gap-3 cutsor-pointer'>
            <input onChange={(e)=>SetSelectedImg(e.target.files[0])} 
            type='file' id='avatar' accept='.png , .jpg , .jpeg' hidden />
            <img src={selectedImg ? URL.createObjectURL(selectedImg) : assets.avatar_icon} alt=""  className={`w-12 h-12 ${selectedImg && 'rounded-full'}`}/> upload Profile image
          </label>
          <input onChange={(e)=>setName(e.target.value)} value={name}
          type='text' required placeholder='Your name' className='p-2 border border-grey-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500'/>
        </form>
        <img src='' />
      </div>
    </div>
  )
}

export default ProfilePage