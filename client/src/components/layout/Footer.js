import React from 'react'

const fstyle={
    clear: 'both',
    position: 'relative'
}

export default function Footer() {
  return (
    <footer style={fstyle} className="bg-dark text-white mt-5 p-4 text-center">
        Copyright &copy; {new Date().getFullYear()} DevNet
    </footer>
  )
}
