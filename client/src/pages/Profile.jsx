import React, { useContext } from "react";
import { UserContext } from "../context/UserContext";

const Profile = () => {
  const { user, loading } = useContext(UserContext);

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Not logged in</p>;

  return (
    <div>
      <h1>Welcome, {user.username}</h1>
      <p>Role: {user.role}</p>
    </div>
  );
};

export default Profile;
