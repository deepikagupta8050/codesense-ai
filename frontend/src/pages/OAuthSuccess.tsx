import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'

export default function OAuthSuccess({ onLogin }: any) {

  const [params] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {

    const token = params.get('token')

    if (!token) {
      navigate('/login')
      return
    }

    localStorage.setItem('token', token)

    axios.get(
      'https://codesense-ai-2bu3.onrender.com/api/auth/me',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    .then(res => {

      onLogin(token, res.data.user)

      navigate('/dashboard')

    })
    .catch(() => {
      navigate('/login')
    })

  }, [])

  return (
    <div
      style={{
        height:'100vh',
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        background:'#09090f',
        color:'#fff'
      }}
    >
      Logging in...
    </div>
  )
}