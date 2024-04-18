import * as React from "react"

const ProfileIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={800}
    height={800}
    viewBox="0 0 48 48"
    {...props}
  >
    <path fill="none" d="M0 0h48v48H0z" />
    <path d="M33.843 26.914 24 36l-9.843-9.086C8.674 30.421 5 36.749 5 44h38c0-7.251-3.674-13.579-9.157-17.086z" />
    <path d="M24 28c3.55 0 6.729-1.55 8.926-4A11.94 11.94 0 0 0 36 16c0-6.627-5.373-12-12-12S12 9.373 12 16a11.94 11.94 0 0 0 3.074 8c2.197 2.45 5.376 4 8.926 4z" />
  </svg>
)
export default ProfileIcon;
