import React, { useState } from "react";
import { AppNavigator, AuthNavigator } from "../src/navigation";

export default function App() {
  const [user, setUser] = useState(null);
  return (
    <>
      {user ? (
        <AppNavigator setUser={setUser} />
      ) : (
        <AuthNavigator setUser={setUser} />
      )}
    </>
  );
}
