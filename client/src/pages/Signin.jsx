import { useState } from "react";

const Signin = () => {
  const [form, setForm] = useState({ username: "", password: "", role: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });
    const data = await res.json();
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-6">
      <input
        type="text"
        name="username"
        placeholder="Username"
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
        required
      />
      <select name="role" onChange={handleChange} required>
        <option value="">Select Role</option>
        <option value="collector">Collector</option>
        <option value="transporter">Transporter</option>
        <option value="processing_plant">Processing Plant</option>
        <option value="lab_testing">Lab Testing</option>
        <option value="consumer">Consumer</option>
      </select>
      <button type="submit">Register</button>
    </form>
  );
};

export default Signin;
