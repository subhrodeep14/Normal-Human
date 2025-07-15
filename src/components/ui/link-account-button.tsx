"use client"

import React from 'react'
import { Button } from './button'
import { get } from 'http'
import { getAurinkoAuthUrl } from '@/lib/aurinko'
import { SignIn } from '@clerk/nextjs'

const LinkAccountButton = () => {
  return (
    <Button onClick={async() => {
      
      const authUrl= await getAurinkoAuthUrl('Google')
      console.log('Auth URL:', authUrl);
      window.location.href = authUrl
      
    }}>
      Link Account
    </Button>
  )
}

export default LinkAccountButton