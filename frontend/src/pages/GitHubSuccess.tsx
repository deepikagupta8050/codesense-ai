import { useEffect } from 'react'

export default function GitHubSuccess() {

  useEffect(() => {

    const params =
      new URLSearchParams(window.location.search)

    const token =
      params.get('token')

    const username =
      params.get('username')

    // SAVE JWT TOKEN
    if (token) {

      localStorage.setItem(
        'cs_token',
        token
      )

      localStorage.setItem(
        'github_token',
        token
      )
    }

    // SAVE USERNAME
    if (username) {

      localStorage.setItem(
        'github_username',
        username
      )
    }

    // MAIN USER
    localStorage.setItem(
      'cs_user',
      JSON.stringify({
        name: username || 'GitHub User',
        email: `${username || 'github'}@github.com`,
        github: true
      })
    )

    // GITHUB CONNECTED
    localStorage.setItem(
      'github_connected',
      'true'
    )

    setTimeout(() => {

      window.location.href = '/github'

    }, 500)

  }, [])

  return (
    <div
      style={{
        height:'100vh',
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        background:'#09090f',
        color:'#fff',
        fontSize:'20px',
        fontWeight:700
      }}
    >
      Connecting GitHub...
    </div>
  )
}