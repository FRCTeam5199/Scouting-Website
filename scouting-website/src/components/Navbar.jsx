import { NavLink } from "react-router-dom"


export default function Navbar() {
  return (
    <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
      <NavLink to="/">Home</NavLink> |{" "}
      <NavLink to="/settings">Settings</NavLink> |{" "}
      <NavLink to="/review">Review</NavLink>
    </nav>
  )
}
